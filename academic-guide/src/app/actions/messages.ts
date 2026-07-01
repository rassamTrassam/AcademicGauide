"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function startConversation(programId: string, institutionId: string, content: string) {
  try {
    const supabase = await createClient();
    
    // 1. Verify User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: "يجب تسجيل الدخول لإرسال رسالة." };
    }

    // 2. Check if conversation already exists
    let { data: conversation, error: fetchError } = await supabase
      .from("conversations")
      .select("id")
      .eq("student_id", user.id)
      .eq("program_id", programId)
      .maybeSingle();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching conversation:", fetchError);
      return { error: "حدث خطأ أثناء التحقق من المحادثة." };
    }

    // 3. Create conversation if it doesn't exist
    if (!conversation) {
      const { data: newConversation, error: createError } = await supabase
        .from("conversations")
        .insert({
          student_id: user.id,
          institution_id: institutionId,
          program_id: programId,
        })
        .select("id")
        .single();

      if (createError) {
        console.error("Error creating conversation:", createError);
        return { error: "حدث خطأ أثناء إنشاء المحادثة." };
      }
      conversation = newConversation;
    }

    // 4. Insert message
    if (conversation) {
      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          content: content.trim(),
        });

      if (messageError) {
        console.error("Error inserting message:", messageError);
        return { error: "لم يتم إرسال الرسالة بنجاح." };
      }
    }

    revalidatePath(`/programs/${programId}`);
    return { success: true, message: "تم إرسال الرسالة بنجاح!" };
  } catch (error: any) {
    console.error("Start Conversation Error:", error);
    return { error: error.message || "حدث خطأ غير متوقع." };
  }
}

export async function replyToConversation(conversationId: string, content: string) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: "غير مصرح لك بالقيام بهذا الإجراء." };
    }

    // Insert the message. RLS will ensure that the user can only insert if they are part of the conversation
    // (either student or an org_admin for the institution).
    const { error: messageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
      });

    if (messageError) {
      console.error("Error inserting reply:", messageError);
      return { error: "لم يتم إرسال الرد بنجاح." };
    }

    // Force an update to the conversation's updated_at via a dummy update 
    // to bring it to the top of the list, although we have a trigger, it requires an actual update query.
    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);

    revalidatePath("/dashboard/messages");
    return { success: true };
  } catch (error: any) {
    console.error("Reply to Conversation Error:", error);
    return { error: error.message || "حدث خطأ غير متوقع." };
  }
}
