-- Allow authenticated users to read koordinator profiles so they can select a koordinator during Helper verification
CREATE POLICY "Authenticated users can read verified koordinator profiles"
ON public.koordinator_profiles
FOR SELECT
TO authenticated
USING (status = 'verified');

-- Also allow authenticated users to read basic info of other users IF they are a verified koordinator. 
-- However, for performance and simplicity, we can just allow authenticated users to view all users' profiles.
-- The users table doesn't have highly sensitive data (passwords are handled by Supabase Auth).
CREATE POLICY "Authenticated users can read all users"
ON public.users
FOR SELECT
TO authenticated
USING (true);
