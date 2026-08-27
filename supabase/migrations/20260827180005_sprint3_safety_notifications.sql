-- Menegakkan scope SOS dan recipient notification di database.

CREATE UNIQUE INDEX IF NOT EXISTS emergency_alerts_task_active_unique
  ON public.emergency_alerts (task_id) WHERE status = 'active';

CREATE OR REPLACE FUNCTION public.notify_message_recipient()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.task_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, body, type)
    VALUES (NEW.receiver_id, 'Pesan baru', 'Anda menerima pesan baru pada percakapan tugas.', 'message');
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_message_inserted ON public.messages;
CREATE TRIGGER on_message_inserted AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.notify_message_recipient();

CREATE OR REPLACE FUNCTION public.notify_task_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_helper_user_id UUID;
BEGIN
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN RETURN NEW; END IF;
  INSERT INTO public.notifications (user_id, title, body, type)
  VALUES (NEW.keluarga_id, 'Status tugas berubah', format('Status tugas sekarang %s.', NEW.status), 'task');
  IF NEW.helper_id IS NOT NULL THEN
    SELECT user_id INTO v_helper_user_id FROM public.helper_profiles WHERE id = NEW.helper_id;
    IF v_helper_user_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, body, type)
      VALUES (v_helper_user_id, 'Status tugas berubah', format('Status tugas sekarang %s.', NEW.status), 'task');
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_task_status_changed ON public.tasks;
CREATE TRIGGER on_task_status_changed AFTER UPDATE OF status ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.notify_task_status_change();

CREATE OR REPLACE FUNCTION public.create_emergency_alert(p_task_id UUID)
RETURNS public.emergency_alerts LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_task public.tasks; v_helper public.helper_profiles; v_coordinator public.koordinator_profiles; v_alert public.emergency_alerts;
BEGIN
  IF auth.uid() IS NULL OR auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Sesi Helper tidak valid' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_task FROM public.tasks WHERE id = p_task_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Tugas tidak ditemukan' USING ERRCODE = 'P0002'; END IF;
  SELECT * INTO v_helper FROM public.helper_profiles WHERE id = v_task.helper_id FOR UPDATE;
  IF NOT FOUND OR v_helper.user_id <> auth.uid() OR v_task.status <> 'dikerjakan' THEN
    RAISE EXCEPTION 'SOS hanya dapat dikirim Helper yang sedang mengerjakan task' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_alert FROM public.emergency_alerts WHERE task_id = p_task_id AND status = 'active' FOR UPDATE;
  IF FOUND THEN RETURN v_alert; END IF;
  INSERT INTO public.emergency_alerts (task_id, triggered_by, status)
  VALUES (p_task_id, auth.uid(), 'active') RETURNING * INTO v_alert;
  INSERT INTO public.notifications (user_id, title, body, type)
  VALUES (v_task.keluarga_id, 'Sinyal darurat aktif', 'Helper memerlukan perhatian untuk task ini.', 'emergency');
  IF v_helper.koordinator_id IS NOT NULL THEN
    SELECT * INTO v_coordinator FROM public.koordinator_profiles
    WHERE id = v_helper.koordinator_id AND status = 'verified';
    IF FOUND THEN
      INSERT INTO public.notifications (user_id, title, body, type)
      VALUES (v_coordinator.user_id, 'Sinyal darurat aktif', 'Helper memerlukan perhatian untuk task di wilayah Anda.', 'emergency');
    END IF;
  END IF;
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), 'emergency_alert_created', 'emergency_alert', v_alert.id, jsonb_build_object('task_id', p_task_id));
  RETURN v_alert;
END;
$$;

CREATE OR REPLACE FUNCTION public.acknowledge_emergency_alert(p_alert_id UUID)
RETURNS public.emergency_alerts LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_alert public.emergency_alerts; v_task public.tasks; v_helper public.helper_profiles; v_coordinator public.koordinator_profiles; v_role public.user_role;
BEGIN
  IF auth.uid() IS NULL OR auth.role() <> 'authenticated' THEN
    RAISE EXCEPTION 'Sesi pengguna tidak valid' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_alert FROM public.emergency_alerts WHERE id = p_alert_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Sinyal darurat tidak ditemukan' USING ERRCODE = 'P0002'; END IF;
  SELECT * INTO v_task FROM public.tasks WHERE id = v_alert.task_id;
  SELECT role INTO v_role FROM public.users WHERE id = auth.uid();
  SELECT * INTO v_helper FROM public.helper_profiles WHERE id = v_task.helper_id;
  IF v_role = 'admin' OR (v_role = 'keluarga' AND v_task.keluarga_id = auth.uid()) THEN
    NULL;
  ELSIF v_role = 'koordinator' THEN
    SELECT * INTO v_coordinator FROM public.koordinator_profiles
    WHERE id = v_helper.koordinator_id AND user_id = auth.uid() AND status = 'verified';
    IF NOT FOUND THEN RAISE EXCEPTION 'Anda tidak berwenang mengakui sinyal ini' USING ERRCODE = '42501'; END IF;
  ELSE
    RAISE EXCEPTION 'Anda tidak berwenang mengakui sinyal ini' USING ERRCODE = '42501';
  END IF;
  IF v_alert.status <> 'active' THEN RAISE EXCEPTION 'Sinyal darurat sudah diakui' USING ERRCODE = 'P0001'; END IF;
  UPDATE public.emergency_alerts SET status = 'acknowledged', acknowledged_by = auth.uid(), acknowledged_at = NOW()
  WHERE id = p_alert_id AND status = 'active' RETURNING * INTO v_alert;
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (auth.uid(), 'emergency_alert_acknowledged', 'emergency_alert', v_alert.id, jsonb_build_object('task_id', v_alert.task_id));
  RETURN v_alert;
END;
$$;

DROP POLICY IF EXISTS "Task participants can read emergency alerts" ON public.emergency_alerts;
CREATE POLICY "Scoped participants can read emergency alerts" ON public.emergency_alerts
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM public.tasks t
    LEFT JOIN public.helper_profiles hp ON hp.id = t.helper_id
    LEFT JOIN public.koordinator_profiles kp ON kp.id = hp.koordinator_id
    WHERE t.id = emergency_alerts.task_id AND (
      t.keluarga_id = auth.uid() OR hp.user_id = auth.uid() OR
      (kp.user_id = auth.uid() AND kp.status = 'verified') OR public.is_admin()
    )
  ));

REVOKE ALL ON FUNCTION public.create_emergency_alert(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_emergency_alert(UUID) TO authenticated;
REVOKE ALL ON FUNCTION public.acknowledge_emergency_alert(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.acknowledge_emergency_alert(UUID) TO authenticated;
