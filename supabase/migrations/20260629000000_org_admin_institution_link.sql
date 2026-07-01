-- Migration: Add institution_id to user_profiles and update RLS for org_admins

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL;

COMMENT ON COLUMN user_profiles.institution_id IS 'الجهة التعليمية التي يمثلها هذا الحساب';

CREATE INDEX IF NOT EXISTS user_profiles_institution_id_idx ON user_profiles(institution_id);

-- Update RLS for programs to allow org_admins to read/write their own programs

-- Policy: Org admins can read their own programs (including drafts)
CREATE POLICY "programs_org_admin_read"
  ON programs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.institution_id = programs.institution_id
    )
  );

-- Policy: Org admins can insert programs for their own institution
CREATE POLICY "programs_org_admin_insert"
  ON programs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.institution_id = programs.institution_id
    )
  );

-- Policy: Org admins can update programs for their own institution
CREATE POLICY "programs_org_admin_update"
  ON programs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.institution_id = programs.institution_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.institution_id = programs.institution_id
    )
  );

-- Policy: Org admins can delete programs for their own institution
CREATE POLICY "programs_org_admin_delete"
  ON programs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.institution_id = programs.institution_id
    )
  );
