-- The original Sprint 6 migration exposed an unsafe two-argument overload.
-- The API uses the auth-derived one-argument RPC, so remove the legacy version
-- rather than leave a callable function with an invalid notification enum value.

DROP FUNCTION IF EXISTS public.accept_quick_task(uuid, uuid);
