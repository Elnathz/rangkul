-- Publish application changes so Keluarga can invalidate its own applicant queue live.
-- The browser still refetches through the role-scoped API after receiving an event.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'task_applications'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.task_applications;
    END IF;
END;
$$;
