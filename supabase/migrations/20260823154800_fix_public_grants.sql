-- Fix missing grants for anon and authenticated users on public schema
-- This was caused by DROP SCHEMA public CASCADE in the initial schema which removed default privileges.

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
