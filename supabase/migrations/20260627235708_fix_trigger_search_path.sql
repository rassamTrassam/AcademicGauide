-- ============================================================
-- Fix: set explicit schema and search_path for handle_new_user
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := NEW.raw_user_meta_data->>'role';

  INSERT INTO public.user_profiles (
    id,
    full_name,
    avatar_url,
    approval_status
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name'
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    CASE WHEN v_role = 'org_admin' THEN 'pending' ELSE 'approved' END
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;
