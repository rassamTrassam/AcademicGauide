"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateMessageStatus(messageId: string, newStatus: string) {
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

  revalidatePath("/admin/contact-messages");
  return { success: true };
}
