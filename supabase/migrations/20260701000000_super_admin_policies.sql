-- Super Admin RLS Bypass Policies

-- 1. user_profiles
CREATE POLICY "Super Admins can select all user_profiles"
ON user_profiles FOR SELECT
USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Super Admins can update all user_profiles"
ON user_profiles FOR UPDATE
USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Super Admins can insert all user_profiles"
ON user_profiles FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Super Admins can delete all user_profiles"
ON user_profiles FOR DELETE
USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'super_admin'));

-- 2. institutions
CREATE POLICY "Super Admins can select all institutions"
ON institutions FOR SELECT
USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Super Admins can update all institutions"
ON institutions FOR UPDATE
USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Super Admins can insert all institutions"
ON institutions FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Super Admins can delete all institutions"
ON institutions FOR DELETE
USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'super_admin'));

-- 3. programs
CREATE POLICY "Super Admins can select all programs"
ON programs FOR SELECT
USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Super Admins can update all programs"
ON programs FOR UPDATE
USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Super Admins can insert all programs"
ON programs FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Super Admins can delete all programs"
ON programs FOR DELETE
USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'super_admin'));
