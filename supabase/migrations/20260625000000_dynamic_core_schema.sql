-- ============================================================
-- Yemen Educational Marketplace — Dynamic Core Schema
-- Migration: dynamic_core_schema
-- Generated: 2026-06-25
-- ============================================================
-- Strategy: Hybrid schema using JSONB for inconsistent data fields
-- across 7 Yemeni educational institutions
-- ============================================================

-- Enable extensions
-- Note: gen_random_uuid() is built-in since PostgreSQL 13, no extension needed
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For Arabic full-text search

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE degree_level_enum AS ENUM (
  'bachelor',
  'master',
  'phd',
  'diploma',
  'certificate',
  'course'
);

CREATE TYPE program_status_enum AS ENUM (
  'active',
  'inactive',
  'draft'
);

CREATE TYPE institution_type_enum AS ENUM (
  'university',
  'institute',
  'academy',
  'college'
);

-- ============================================================
-- TABLE: institutions
-- ============================================================

CREATE TABLE IF NOT EXISTS institutions (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ar       TEXT NOT NULL,
  name_en       TEXT,
  slug          TEXT UNIQUE,
  logo_url      TEXT,
  cover_url     TEXT,
  city          TEXT,
  type          institution_type_enum DEFAULT 'university',
  website       TEXT,
  phone         TEXT,
  email         TEXT,
  description   TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE institutions IS 'المؤسسات التعليمية اليمنية';
COMMENT ON COLUMN institutions.name_ar IS 'الاسم بالعربية';
COMMENT ON COLUMN institutions.name_en IS 'الاسم بالإنجليزية';
COMMENT ON COLUMN institutions.slug IS 'معرف URL مختصر (مثل: taiz-university)';

-- ============================================================
-- TABLE: programs
-- ============================================================

CREATE TABLE IF NOT EXISTS programs (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id      UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,

  -- Core fields (consistent across all institutions)
  title_ar            TEXT NOT NULL,
  title_en            TEXT,
  slug                TEXT,

  degree_level        degree_level_enum NOT NULL,
  faculty_ar          TEXT,
  faculty_en          TEXT,

  description_ar      TEXT,
  description_en      TEXT,

  -- Duration
  duration_years      NUMERIC(4,1),   -- e.g., 4.0, 4.5, 2.0
  duration_semesters  INTEGER,

  -- Files (Supabase Storage URLs)
  cover_image_url     TEXT,
  study_plan_pdf_url  TEXT,

  -- Status
  status              program_status_enum DEFAULT 'draft',

  -- Statistics (maintained by triggers)
  views_count         INTEGER DEFAULT 0,
  favorites_count     INTEGER DEFAULT 0,
  average_rating      NUMERIC(3,2) DEFAULT 0,
  ratings_count       INTEGER DEFAULT 0,

  -- ============================================================
  -- JSONB: Flexible data for inconsistent fields across institutions
  -- ============================================================
  -- Possible keys:
  -- {
  --   "fees_per_year": 150000,         (رسوم سنوية)
  --   "fees_per_semester": 75000,      (رسوم فصلية)
  --   "total_credit_hours": 160,       (ساعات معتمدة)
  --   "admission_requirements": [...], (شروط القبول)
  --   "specializations": [...],        (التخصصات الفرعية)
  --   "graduation_requirements": "...", (متطلبات التخرج)
  --   "available_seats": 50,           (الأماكن المتاحة)
  --   "academic_year": "2024-2025",    (العام الدراسي)
  --   "language_of_instruction": "Arabic",
  --   "accreditation": "...",          (الاعتماد الأكاديمي)
  --   "contact": { "phone": "", "email": "" },
  --   "social": { "facebook": "", "instagram": "" },
  --   "raw_excel_rows": [...],         (البيانات الخام من Excel)
  --   "keywords": [...]                (كلمات مفتاحية للبحث)
  -- }
  metadata            JSONB DEFAULT '{}',

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint on slug per institution
CREATE UNIQUE INDEX IF NOT EXISTS programs_institution_slug_idx
  ON programs(institution_id, slug) WHERE slug IS NOT NULL;

-- GIN index for fast JSONB queries
CREATE INDEX IF NOT EXISTS programs_metadata_gin_idx
  ON programs USING GIN (metadata);

-- Full-text search on Arabic titles
CREATE INDEX IF NOT EXISTS programs_title_ar_trgm_idx
  ON programs USING GIN (title_ar gin_trgm_ops);

CREATE INDEX IF NOT EXISTS programs_degree_level_idx
  ON programs(degree_level);

CREATE INDEX IF NOT EXISTS programs_institution_idx
  ON programs(institution_id);

CREATE INDEX IF NOT EXISTS programs_status_idx
  ON programs(status);

COMMENT ON TABLE programs IS 'البرامج الأكاديمية لكل مؤسسة';
COMMENT ON COLUMN programs.metadata IS 'بيانات JSONB للحقول غير المتجانسة (الرسوم، شروط القبول، إلخ)';

-- ============================================================
-- TABLE: favorites
-- ============================================================

CREATE TABLE IF NOT EXISTS favorites (
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id  UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (user_id, program_id)
);

CREATE INDEX IF NOT EXISTS favorites_program_idx ON favorites(program_id);
CREATE INDEX IF NOT EXISTS favorites_user_idx ON favorites(user_id);

COMMENT ON TABLE favorites IS 'البرامج المفضلة للمستخدمين';

-- ============================================================
-- TABLE: ratings
-- ============================================================

CREATE TABLE IF NOT EXISTS ratings (
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id  UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  rating      SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (user_id, program_id)
);

CREATE INDEX IF NOT EXISTS ratings_program_idx ON ratings(program_id);

COMMENT ON TABLE ratings IS 'تقييمات المستخدمين للبرامج الأكاديمية';

-- ============================================================
-- TABLE: user_profiles (extends auth.users)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  city        TEXT,
  phone       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE user_profiles IS 'ملفات المستخدمين الشخصية';

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- 1. Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER institutions_updated_at
  BEFORE UPDATE ON institutions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER ratings_updated_at
  BEFORE UPDATE ON ratings
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- 2. Auto-create user profile on signup
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 3. Favorites count trigger
-- ============================================================

CREATE OR REPLACE FUNCTION update_favorites_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE programs
    SET favorites_count = favorites_count + 1
    WHERE id = NEW.program_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE programs
    SET favorites_count = GREATEST(favorites_count - 1, 0)
    WHERE id = OLD.program_id;
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER favorites_count_trigger
  AFTER INSERT OR DELETE ON favorites
  FOR EACH ROW EXECUTE FUNCTION update_favorites_count();

-- ============================================================
-- 4. Ratings average & count trigger
-- ============================================================

CREATE OR REPLACE FUNCTION update_program_ratings()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_program_id UUID;
  v_avg        NUMERIC(3,2);
  v_count      INTEGER;
BEGIN
  -- Determine which program to update
  IF TG_OP = 'DELETE' THEN
    v_program_id := OLD.program_id;
  ELSE
    v_program_id := NEW.program_id;
  END IF;

  -- Recalculate from scratch (accurate)
  SELECT
    COALESCE(AVG(rating), 0),
    COUNT(*)
  INTO v_avg, v_count
  FROM ratings
  WHERE program_id = v_program_id;

  UPDATE programs
  SET
    average_rating = v_avg,
    ratings_count  = v_count
  WHERE id = v_program_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER ratings_aggregate_trigger
  AFTER INSERT OR UPDATE OR DELETE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_program_ratings();

-- ============================================================
-- 5. RPC: Increment views count (called from client)
-- ============================================================

CREATE OR REPLACE FUNCTION increment_program_views(p_program_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE programs
  SET views_count = views_count + 1
  WHERE id = p_program_id AND status = 'active';
END;
$$;

-- ============================================================
-- 6. Slug generator helper
-- ============================================================

CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  result TEXT;
BEGIN
  result := lower(input_text);
  result := regexp_replace(result, '[^a-z0-9\u0600-\u06ff\s-]', '', 'g');
  result := regexp_replace(result, '\s+', '-', 'g');
  result := regexp_replace(result, '-+', '-', 'g');
  result := trim(both '-' from result);
  RETURN result;
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS: institutions — public read, admin write
-- ============================================================

CREATE POLICY "institutions_public_read"
  ON institutions FOR SELECT
  USING (is_active = true);

-- ============================================================
-- RLS: programs — public read (active only), admin write
-- ============================================================

CREATE POLICY "programs_public_read"
  ON programs FOR SELECT
  USING (status = 'active');

-- ============================================================
-- RLS: favorites — users manage their own favorites
-- ============================================================

CREATE POLICY "favorites_user_read"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "favorites_user_insert"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorites_user_delete"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- RLS: ratings — public read, authenticated write own
-- ============================================================

CREATE POLICY "ratings_public_read"
  ON ratings FOR SELECT
  USING (true);

CREATE POLICY "ratings_user_insert"
  ON ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ratings_user_update"
  ON ratings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ratings_user_delete"
  ON ratings FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- RLS: user_profiles — users manage their own profile
-- ============================================================

CREATE POLICY "profiles_user_read"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_user_update"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- SEED DATA: Institutions
-- ============================================================

INSERT INTO institutions (name_ar, name_en, slug, city, type) VALUES
  ('جامعة تعز', 'Taiz University', 'taiz-university', 'تعز', 'university'),
  ('جامعة العلوم والتكنولوجيا-عدن', 'University of Science and Technology - Aden', 'ust-aden', 'عدن', 'university'),
  ('الأكاديمية اليمنية للدراسات العليا', 'Yemen Academy for Graduate Studies', 'yemen-academy', 'صنعاء', 'academy'),
  ('الجامعة الوطنية-تعز', 'National University - Taiz', 'national-university-taiz', 'تعز', 'university'),
  ('جامعة السعيد', 'Al-Saeed University', 'alsaeed-university', 'تعز', 'university'),
  ('جامعة سبأ', 'Saba University', 'saba-university', 'صنعاء', 'university'),
  ('معهد بوابة التكنولوجيا', 'Technology Gateway Institute', 'tech-gateway-institute', 'تعز', 'institute')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- Storage Bucket Policies (run separately in Supabase Dashboard)
-- ============================================================
-- Run these in Supabase Storage settings:
--
-- Bucket: "program-covers" (public)
-- Bucket: "study-plans" (public)
-- Bucket: "institution-logos" (public)
--
-- ============================================================
