-- Add featured column to programs
ALTER TABLE public.programs ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Create an index for efficient featured queries
CREATE INDEX IF NOT EXISTS idx_programs_is_featured ON public.programs (is_featured) WHERE is_featured = true;
