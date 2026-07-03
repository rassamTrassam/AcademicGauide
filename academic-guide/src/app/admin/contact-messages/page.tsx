import { createClient, createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Mail, Clock, User, MessageSquare } from "lucide-react";

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
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">رسائل الزوار</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          جميع الرسائل الواردة من نموذج &quot;تواصل معنا&quot;.
          {messages && <span className="font-semibold text-brand-600 ms-2">({messages.length} رسالة)</span>}
        </p>
      </div>

      {messages && messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((msg: any) => (
            <div 
              key={msg.id} 
              className={`card p-6 border-s-4 transition-colors ${
                msg.is_read 
                  ? "border-s-gray-300 dark:border-s-gray-600" 
                  : "border-s-brand-500 bg-brand-50/30 dark:bg-brand-900/5"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 flex items-center justify-center font-bold text-sm">
                    {msg.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">{msg.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400" dir="ltr">{msg.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 shrink-0">
                  <Clock size={14} />
                  {new Date(msg.created_at).toLocaleDateString("ar-YE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              <div className="mb-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                  <MessageSquare size={12} /> الموضوع
                </span>
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">{msg.subject}</h4>
              </div>

              <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Mail size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">لا توجد رسائل حتى الآن</h3>
          <p className="text-gray-500 dark:text-gray-400">ستظهر هنا جميع الرسائل الواردة من نموذج &quot;تواصل معنا&quot;.</p>
        </div>
      )}
    </div>
  );
}
