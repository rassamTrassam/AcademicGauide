-- Fix RLS for ratings and user_profiles to allow public reads

-- 1. Fix ratings table
DROP POLICY IF EXISTS "ratings_public_read" ON ratings;
CREATE POLICY "ratings_public_read"
  ON ratings FOR SELECT
  USING (true);

-- 2. Fix user_profiles table (needed to display user names on comments)
DROP POLICY IF EXISTS "profiles_public_read" ON user_profiles;
CREATE POLICY "profiles_public_read"
  ON user_profiles FOR SELECT
  USING (true);
