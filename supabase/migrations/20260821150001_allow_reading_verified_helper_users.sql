-- Allow anyone (or at least authenticated users) to read the user profile 
-- of a helper if the helper's profile is verified. 
-- This is necessary so that 'cari-helper' can join the 'users' table to display the helper's name.

CREATE POLICY "Users can read profiles of verified helpers" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.helper_profiles 
            WHERE helper_profiles.user_id = public.users.id 
            AND helper_profiles.status = 'verified'
        )
    );
