-- RLS policies do not grant table privileges by themselves.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.helper_service_categories TO authenticated;
