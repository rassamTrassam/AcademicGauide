ALTER TABLE public.contact_messages
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new' CHECK (status IN ('new', 'processing', 'resolved'));
