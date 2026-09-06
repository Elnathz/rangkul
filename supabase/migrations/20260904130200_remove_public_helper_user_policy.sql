-- A legacy policy can expose verified Helper email and phone to every authenticated
-- account. Public catalogue data must come from the reduced server projection.

DROP POLICY IF EXISTS "Authenticated can read public helper user profiles" ON public.users;
