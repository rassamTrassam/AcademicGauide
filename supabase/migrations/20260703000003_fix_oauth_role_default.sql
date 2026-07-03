-- Update handle_new_user to also handle Google OAuth users:
-- 1. Fallback name extraction from full_name if name is null (Google OAuth)
-- 2. Explicitly default role to 'student' if missing
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id, 
    email,
    full_name, 
    avatar_url,
    approval_status
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN new.raw_user_meta_data->>'role' = 'org_admin' THEN 'pending'
      ELSE 'approved'
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.user_profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.user_profiles.avatar_url);
  
  -- Default role to 'student' for OAuth users who have no role set
  IF new.raw_user_meta_data->>'role' IS NULL THEN
    UPDATE auth.users 
    SET raw_user_meta_data = raw_user_meta_data || '{"role": "student"}'::jsonb
    WHERE id = new.id;
  END IF;

  RETURN new;
END;
$$;

-- Ensure trigger is correctly attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
