-- Add username column to users table
ALTER TABLE public.users 
ADD COLUMN username TEXT;

-- Populate existing users with default username based on email
UPDATE public.users 
SET username = 'user_' || SUBSTR(email, 1, POSITION('@' IN email) - 1)
WHERE username IS NULL;

-- Create unique index for username (case-insensitive)
CREATE UNIQUE INDEX idx_users_username_lower ON public.users (LOWER(username));

-- Make username required
ALTER TABLE public.users 
ALTER COLUMN username SET NOT NULL;

-- Update trigger function to handle username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, phone, full_name, role, username)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Pengguna Baru'),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'keluarga'::public.user_role),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || SUBSTR(NEW.email, 1, POSITION('@' IN NEW.email) - 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
