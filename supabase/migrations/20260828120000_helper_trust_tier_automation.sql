-- Menghitung rangkaian tugas bersih dan memutusnya saat laporan formal dibuat.

CREATE OR REPLACE FUNCTION public.handle_task_completion_trust_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_helper public.helper_profiles;
  v_next_streak INTEGER;
BEGIN
  IF NOT (OLD.status IS DISTINCT FROM 'selesai' AND NEW.status = 'selesai')
    OR NEW.helper_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_helper
  FROM public.helper_profiles
  WHERE id = NEW.helper_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profil Helper untuk task selesai tidak ditemukan' USING ERRCODE = 'P0002';
  END IF;

  v_next_streak := LEAST(v_helper.tugas_selesai_berturut + 1, 2147483647);

  UPDATE public.helper_profiles
  SET tugas_selesai_berturut = LEAST(tugas_selesai_berturut + 1, 2147483647),
      total_tugas_selesai = total_tugas_selesai + 1,
      tingkat_kepercayaan = CASE
        WHEN status = 'verified' AND v_next_streak >= 5 THEN 'terpercaya'
        ELSE tingkat_kepercayaan
      END,
      promoted_at = CASE
        WHEN status = 'verified'
          AND v_next_streak >= 5
          AND tingkat_kepercayaan IS DISTINCT FROM 'terpercaya'
          THEN NOW()
        ELSE promoted_at
      END,
      updated_at = NOW()
  WHERE id = v_helper.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_task_completed_update_trust_tier ON public.tasks;
CREATE TRIGGER on_task_completed_update_trust_tier
AFTER UPDATE OF status ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.handle_task_completion_trust_tier();

CREATE OR REPLACE FUNCTION public.handle_report_accumulation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  active_report_count INTEGER;
  v_helper public.helper_profiles;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.reported_helper_id::TEXT, 0));

  SELECT * INTO v_helper
  FROM public.helper_profiles
  WHERE user_id = NEW.reported_helper_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profil Helper yang dilaporkan tidak ditemukan' USING ERRCODE = 'P0002';
  END IF;

  SELECT COUNT(*) INTO active_report_count
  FROM public.reports
  WHERE reported_helper_id = NEW.reported_helper_id
    AND status IN ('menunggu', 'ditindak');

  UPDATE public.helper_profiles
  SET tugas_selesai_berturut = 0,
      tingkat_kepercayaan = 'probation',
      status = CASE
        WHEN status = 'verified' AND active_report_count >= 2 THEN 'under_review'
        ELSE status
      END,
      updated_at = NOW()
  WHERE id = v_helper.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_report_inserted ON public.reports;
CREATE TRIGGER on_report_inserted
AFTER INSERT ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.handle_report_accumulation();

REVOKE ALL ON FUNCTION public.handle_task_completion_trust_tier() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_report_accumulation() FROM PUBLIC;
