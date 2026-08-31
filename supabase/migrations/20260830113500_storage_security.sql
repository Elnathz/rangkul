-- Migration file: Secure storage bucket 'dokumen'
-- Restrict access so only service_role can perform direct operations (to create signed URLs).
-- Clients (authenticated users) cannot directly select/insert/update/delete.
-- This ensures they must go through our API routes.

-- Note: In Supabase, storage policies are on the storage.objects table.

-- First, ensure the 'dokumen' bucket exists and is private
INSERT INTO storage.buckets (id, name, public) 
VALUES ('dokumen', 'dokumen', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Drop existing public policies if they exist (to be safe)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder" ON storage.objects;

-- Create restrictive policies for the 'dokumen' bucket
-- 1. Deny direct SELECT for all users
CREATE POLICY "Deny direct read access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'dokumen' AND auth.role() = 'service_role');

-- 2. Deny direct INSERT for all users (they must use /api/storage/upload)
CREATE POLICY "Deny direct insert access" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'dokumen' AND auth.role() = 'service_role');

-- 3. Deny direct UPDATE for all users
CREATE POLICY "Deny direct update access" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'dokumen' AND auth.role() = 'service_role');

-- 4. Deny direct DELETE for all users
CREATE POLICY "Deny direct delete access" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'dokumen' AND auth.role() = 'service_role');
