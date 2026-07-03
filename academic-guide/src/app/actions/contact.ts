// @ts-nocheck
"use server";

import { createClient } from "@/utils/supabase/server";
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
    const supabase = await createClient();
    const { error } = await supabase
      .from("contact_messages")
      .insert({ name, email, subject, message });

    if (error) {
      console.error("Contact message insert error:", error);
      return { error: "حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة لاحقاً." };
    }

    return { success: true, message: "تم إرسال رسالتك بنجاح! سنتواصل معك قريباً." };
  } catch (err: any) {
    console.error("Contact message error:", err);
    return { error: "خطأ غير متوقع. يرجى المحاولة مرة أخرى." };
  }
}
