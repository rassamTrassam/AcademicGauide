// @ts-nocheck
"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitContactMessage(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const subject = formData.get("subject")?.toString().trim();
  const message = formData.get("message")?.toString().trim();

  if (!name || !email || !subject || !message) {
    return { error: "يرجى تعبئة جميع الحقول المطلوبة." };
  }

  try {
    // Use regular client so RLS applies
    const supabase = await createClient();
    const { error } = await supabase
      .from("contact_messages")
      .insert({ name, email, subject, message });

    if (error) {
      console.error("❌ Contact message insert error:", error.message);
      return { error: `فشل إرسال الرسالة: ${error.message}` };
    }

    return { success: true, message: "تم إرسال رسالتك بنجاح! سنتواصل معك قريباً." };
  } catch (err: any) {
    console.error("❌ Contact message error:", err);
    return { error: `خطأ غير متوقع: ${err?.message || "يرجى المحاولة مرة أخرى."}` };
  }
}

export async function updateMessageStatus(messageId: string, newStatus: string) {
  // 1. Verify user is authenticated and has super_admin role
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.user_metadata?.role !== "super_admin") {
    return { success: false, error: "Unauthorized access" };
  }

  // 2. Perform the update securely using the Admin client
  const adminClient = await createAdminClient();
  const { error } = await adminClient
    .from("contact_messages")
    // @ts-ignore
    .update({ status: newStatus as any })
    .eq("id", messageId);

  if (error) {
    console.error("Failed to update message status:", error);
    return { success: false, error: error.message };
  }

  // 3. Revalidate path to update UI instantly
  revalidatePath("/admin/contact-messages");
  return { success: true };
}
