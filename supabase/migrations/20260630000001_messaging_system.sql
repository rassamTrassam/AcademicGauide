-- ============================================================
-- Migration: Messaging System
-- Creates conversations and messages tables with strict RLS
-- ============================================================

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, program_id) -- A student can have one active conversation per program
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_institution_id ON public.conversations(institution_id);
CREATE INDEX IF NOT EXISTS idx_conversations_student_id ON public.conversations(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- Trigger to update conversation updated_at
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- ============================================================
-- Enable Row Level Security
-- ============================================================

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Policies for Conversations
-- ============================================================

-- Students can read their own conversations
CREATE POLICY "Students can read own conversations"
ON public.conversations FOR SELECT
USING (auth.uid() = student_id);

-- Students can create conversations
CREATE POLICY "Students can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- Org Admins can read conversations for their institution
CREATE POLICY "Org Admins can read institution conversations"
ON public.conversations FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.institution_id = conversations.institution_id
    )
);

-- Org Admins can update conversations (e.g., if needed later)
CREATE POLICY "Org Admins can update institution conversations"
ON public.conversations FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.institution_id = conversations.institution_id
    )
);

-- ============================================================
-- Policies for Messages
-- ============================================================

-- Users can read messages in their conversations (both students and admins)
CREATE POLICY "Users can read messages in their conversations"
ON public.messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = messages.conversation_id
        AND (
            c.student_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.user_profiles p
                WHERE p.id = auth.uid() AND p.institution_id = c.institution_id
            )
        )
    )
);

-- Users can insert messages in their conversations
CREATE POLICY "Users can insert messages"
ON public.messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = messages.conversation_id
        AND (
            c.student_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.user_profiles p
                WHERE p.id = auth.uid() AND p.institution_id = c.institution_id
            )
        )
    )
);

-- Users can update message read status
CREATE POLICY "Users can update message read status"
ON public.messages FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.conversations c
        WHERE c.id = messages.conversation_id
        AND (
            c.student_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.user_profiles p
                WHERE p.id = auth.uid() AND p.institution_id = c.institution_id
            )
        )
    )
);
