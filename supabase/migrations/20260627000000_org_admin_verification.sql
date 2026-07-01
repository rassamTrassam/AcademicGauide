-- ============================================================
-- Yemen Educational Marketplace
-- Migration: org_admin_verification
-- Generated: 2026-06-27
-- ============================================================
-- Purpose: Add verification fields to user_profiles for Org_Admin
--          manual review workflow. Create private storage bucket
--          for sensitive documents (IDs, work cards, auth letters).
-- ============================================================

-- ============================================================
-- 1. ALTER TABLE user_profiles — Add verification columns
-- ============================================================

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS approval_status       TEXT        NOT NULL DEFAULT 'pending'
    CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS full_name_4_parts     TEXT,
  ADD COLUMN IF NOT EXISTS institution_name_request TEXT,
  ADD COLUMN IF NOT EXISTS job_title             TEXT,
  ADD COLUMN IF NOT EXISTS personal_contact      TEXT,
  ADD COLUMN IF NOT EXISTS institution_contact   TEXT,
  ADD COLUMN IF NOT EXISTS id_image_url          TEXT,
  ADD COLUMN IF NOT EXISTS work_id_image_url     TEXT,
  ADD COLUMN IF NOT EXISTS auth_letter_image_url TEXT;

COMMENT ON COLUMN user_profiles.approval_status IS
  'حالة اعتماد الحساب: pending | approved | rejected (يخص Org_Admin فقط)';
COMMENT ON COLUMN user_profiles.full_name_4_parts IS
  'الاسم الرباعي الكامل للمسؤول';
COMMENT ON COLUMN user_profiles.institution_name_request IS
  'اسم الجامعة / المعهد المقدَّم في طلب التسجيل';
COMMENT ON COLUMN user_profiles.job_title IS
  'المسمى الوظيفي للمسؤول';
COMMENT ON COLUMN user_profiles.personal_contact IS
  'رقم هاتف أو بريد إلكتروني شخصي';
COMMENT ON COLUMN user_profiles.institution_contact IS
  'رقم هاتف أو بريد إلكتروني الجهة التعليمية';
COMMENT ON COLUMN user_profiles.id_image_url IS
  'رابط صورة الهوية الشخصية (Supabase Storage)';
COMMENT ON COLUMN user_profiles.work_id_image_url IS
  'رابط صورة بطاقة العمل (Supabase Storage)';
COMMENT ON COLUMN user_profiles.auth_letter_image_url IS
  'رابط صورة تصريح/توصية معمدة (Supabase Storage)';

-- ============================================================
-- 2. Index for quick admin lookup by approval status
-- ============================================================

CREATE INDEX IF NOT EXISTS user_profiles_approval_status_idx
  ON user_profiles (approval_status);

-- ============================================================
-- 3. Storage: Create verification_docs bucket (PRIVATE)
-- ============================================================
-- NOTE: Supabase Storage buckets must be created via Dashboard or API.
-- The INSERT below uses the internal storage.buckets table available
-- in Supabase self-hosted & cloud environments.
-- The bucket is private (public = false) so no anonymous access.
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification_docs',
  'verification_docs',
  false,                         -- PRIVATE bucket
  10485760,                      -- 10 MB max per file
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. RLS Policies for storage.objects (verification_docs bucket)
-- ============================================================

-- Allow authenticated users to upload their own docs
-- Path convention: verification_docs/{user_id}/{filename}
CREATE POLICY "verification_docs_user_upload"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'verification_docs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to read their own docs
CREATE POLICY "verification_docs_user_read"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'verification_docs'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow service_role (admins/developers) to read ALL docs
-- This is handled automatically by service_role bypassing RLS,
-- but we add an explicit policy for anon/super_admin role if needed.
CREATE POLICY "verification_docs_admin_read_all"
  ON storage.objects
  FOR SELECT
  TO service_role
  USING (bucket_id = 'verification_docs');

-- Allow service_role to DELETE docs (for cleanup)
CREATE POLICY "verification_docs_admin_delete"
  ON storage.objects
  FOR DELETE
  TO service_role
  USING (bucket_id = 'verification_docs');

-- ============================================================
-- 5. Update handle_new_user trigger to include new fields
--    (role is passed via user_metadata from signUpAction)
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_role TEXT;
BEGIN
  v_role := NEW.raw_user_meta_data->>'role';

  INSERT INTO user_profiles (
    id,
    full_name,
    avatar_url,
    -- Set approval_status:
    -- 'approved' for students (no verification needed)
    -- 'pending'  for org_admins (requires manual review)
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

-- ============================================================
-- END OF MIGRATION
-- ============================================================
