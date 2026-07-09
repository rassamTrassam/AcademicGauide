import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ContactMessagesClient from "./ContactMessagesClient";
import { ContactMessage } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ContactMessagesPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== "super_admin") {
    redirect("/");
  }

  // Use Admin Client to bypass RLS and guarantee Super Admin can see messages
  const adminClient = await createAdminClient();
  const { data: messages } = await adminClient
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <ContactMessagesClient initialMessages={(messages as ContactMessage[]) || []} />
  );
}
