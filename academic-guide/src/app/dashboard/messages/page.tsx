// @ts-nocheck
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ChatUI } from "@/components/ChatUI";

export default async function MessagesPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("institution_id")
    .eq("id", user.id)
    .single();

  if (!profile?.institution_id) {
    redirect("/dashboard");
  }

  // Fetch all conversations for this institution along with their messages
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(`
      id,
      updated_at,
      student:user_profiles!student_id(id, full_name, avatar_url),
      program:programs!program_id(id, title_ar, cover_image_url),
      messages(id, sender_id, content, created_at, is_read)
    `)
    .eq("institution_id", profile.institution_id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch conversations:", error);
  }

  const formattedConversations = (conversations || []).map((conv: any) => {
    const studentData = Array.isArray(conv.student) ? conv.student[0] : conv.student;
    return {
      ...conv,
      interlocutor: { id: studentData.id, name: studentData.full_name, avatar_url: studentData.avatar_url },
      program: Array.isArray(conv.program) ? conv.program[0] : conv.program,
    };
  });

  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">طلبات المراسلة</h1>
        <p className="text-text-secondary mt-1">تواصل مع الطلاب الذين لديهم استفسارات حول برامجك التعليمية.</p>
      </div>

      <ChatUI initialConversations={formattedConversations as any} currentUserId={user.id} currentUserRole="admin" />
    </div>
  );
}
