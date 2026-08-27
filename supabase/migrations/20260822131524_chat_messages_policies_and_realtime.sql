-- Message policies already exist in the initial schema with task-scoped checks.
-- Keep this migration focused on Realtime so it does not duplicate or weaken them.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    END IF;
END;
$$;
