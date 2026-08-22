-- Allow authenticated users to read a helper profile through the verified helper relation.
-- The policy is recreated so a previously applied version remains safe to repair.

DROP POLICY IF EXISTS "Users can read profiles of verified helpers" ON public.users;

CREATE POLICY "Users can read profiles of verified helpers" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.helper_profiles
            WHERE helper_profiles.user_id = public.users.id
            AND helper_profiles.status = 'verified'
        )
    );
