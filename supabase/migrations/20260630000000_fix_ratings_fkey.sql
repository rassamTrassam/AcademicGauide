-- Fix foreign key for ratings and favorites to point to user_profiles instead of auth.users
-- This allows PostgREST to join user_profiles when querying ratings or favorites.

-- Drop existing constraints
ALTER TABLE ratings DROP CONSTRAINT IF EXISTS ratings_user_id_fkey;
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_id_fkey;

-- Add new constraints pointing to user_profiles
ALTER TABLE ratings
  ADD CONSTRAINT ratings_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE favorites
  ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Also make sure the public can read user_profiles for the comments section
-- We had a fix in 20260628015814_fix_ratings_rls_policy.sql but let's be 100% sure it's applied
DROP POLICY IF EXISTS "profiles_public_read" ON user_profiles;
CREATE POLICY "profiles_public_read"
  ON user_profiles FOR SELECT
  USING (true);
