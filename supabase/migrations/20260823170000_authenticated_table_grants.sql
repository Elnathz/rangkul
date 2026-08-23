-- RLS menentukan baris yang boleh diakses, sedangkan privilege menentukan apakah
-- role authenticated boleh menjalankan query pada tabelnya.
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.koordinator_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.helper_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.tasks TO authenticated;
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_categories TO authenticated;
