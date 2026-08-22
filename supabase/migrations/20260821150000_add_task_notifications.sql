-- Sprint 2: notifikasi in-app untuk booking direct dan penandaan sudah dibaca.

DROP POLICY IF EXISTS "Users can mark own notifications read" ON public.notifications;

CREATE POLICY "Users can mark own notifications read"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.notify_helper_of_direct_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  helper_user_id UUID;
  service_name TEXT;
  lansia_name TEXT;
BEGIN
  IF NEW.helper_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT user_id INTO helper_user_id
  FROM public.helper_profiles
  WHERE id = NEW.helper_id;

  IF helper_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT nama INTO service_name
  FROM public.service_categories
  WHERE id = NEW.service_category_id;

  SELECT nama INTO lansia_name
  FROM public.lansia_profiles
  WHERE id = NEW.lansia_id;

  INSERT INTO public.notifications (user_id, title, body, type)
  VALUES (
    helper_user_id,
    'Booking baru menunggu konfirmasi',
    format(
      '%s untuk %s dijadwalkan %s. Buka Papan Tugas untuk menerima atau menolak tugas ini.',
      COALESCE(service_name, 'Tugas baru'),
      COALESCE(lansia_name, 'profil lansia'),
      to_char(NEW.jadwal_waktu AT TIME ZONE 'Asia/Jakarta', 'DD Mon YYYY, HH24:MI')
    ),
    'task'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_direct_booking_created ON public.tasks;

CREATE TRIGGER on_direct_booking_created
AFTER INSERT ON public.tasks
FOR EACH ROW
WHEN (NEW.helper_id IS NOT NULL)
EXECUTE FUNCTION public.notify_helper_of_direct_booking();
