import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ChatUI } from "@/components/ChatUI";

export default async function ProfileMessagesPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch all conversations for this student along with their messages
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select(`
      id,
      updated_at,
      institution:institutions!institution_id(id, name_ar, logo_url),
      program:programs!program_id(id, title_ar, cover_image_url),
      messages(id, sender_id, content, created_at, is_read)
    `)
    .eq("student_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch conversations:", error);
  }

  const formattedConversations = (conversations || []).map((conv: any) => {
    const instData = Array.isArray(conv.institution) ? conv.institution[0] : conv.institution;
    return {
      ...conv,
      interlocutor: { 
        id: instData.id, 
        name: instData.name_ar, 
        avatar_url: instData.logo_url 
      },
      program: Array.isArray(conv.program) ? conv.program[0] : conv.program,
    };
  });

  return (
    <div className="animate-fade-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">المراسلات</h1>
        <p className="text-text-secondary mt-1">تواصل مع الجهات التعليمية وتابع استفساراتك حول البرامج.</p>
      </div>

      <ChatUI initialConversations={formattedConversations as any} currentUserId={user.id} currentUserRole="student" />
    </div>
  );
}
