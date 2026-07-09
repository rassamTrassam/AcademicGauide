"use client";

import { useState } from "react";
import { Mail, Clock, MessageSquare, ChevronDown, CheckCircle } from "lucide-react";
import { ContactMessage } from "@/types/database";
import { updateMessageStatus } from "./actions";

interface ContactMessagesClientProps {
  initialMessages: ContactMessage[];
}

export default function ContactMessagesClient({ initialMessages }: ContactMessagesClientProps) {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleStatusChange = async (messageId: string, newStatus: string) => {
    setIsUpdating(messageId);
    try {
      const result = await updateMessageStatus(messageId, newStatus);
      if (result.success) {
        // Optimistic UI update
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, status: newStatus as any } : msg
          )
        );
      } else {
        alert("فشل تحديث الحالة: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء التحديث.");
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processing":
        return <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">قيد المعالجة</span>;
      case "resolved":
        return <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full flex items-center gap-1"><CheckCircle size={12} /> تم حلها / الرد</span>;
      case "new":
      default:
        return <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">جديدة</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">طلبات الدعم والتواصل</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          جميع الرسائل الواردة من نموذج &quot;تواصل معنا&quot; مع تتبع حالة كل رسالة.
          {messages && <span className="font-semibold text-brand-600 ms-2">({messages.length} طلب)</span>}
        </p>
      </div>

      {messages && messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((msg) => {
            const mailtoLink = `mailto:${msg.email}?subject=رد على استفسارك: ${encodeURIComponent(msg.subject)}&body=${encodeURIComponent(`مرحباً ${msg.name}،\n\nبخصوص استفسارك بخصوص موضوع "${msg.subject}"...\n\nمع تحيات فريق الدعم الفني،\nالدليل الأكاديمي اليمني`)}&bcc=support@academic-guide.com`;

            return (
              <div 
                key={msg.id} 
                className={`card p-6 border-s-4 transition-colors ${
                  msg.status === "resolved"
                    ? "border-s-green-500 bg-green-50/10 dark:bg-green-900/5" 
                    : msg.status === "processing"
                    ? "border-s-yellow-500 bg-yellow-50/30 dark:bg-yellow-900/5"
                    : "border-s-blue-500 bg-blue-50/30 dark:bg-blue-900/5"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 flex items-center justify-center font-bold text-lg">
                      {msg.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{msg.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400" dir="ltr">{msg.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                      <Clock size={14} />
                      {new Date(msg.created_at).toLocaleDateString("ar-YE", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    {getStatusBadge(msg.status)}
                  </div>
                </div>

                <div className="mb-3">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                    <MessageSquare size={14} /> الموضوع
                  </span>
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 text-lg">{msg.subject}</h4>
                </div>

                <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/30 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">تغيير الحالة:</span>
                    <div className="relative">
                      <select
                        value={msg.status}
                        onChange={(e) => handleStatusChange(msg.id, e.target.value)}
                        disabled={isUpdating === msg.id}
                        className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-1.5 pe-8 ps-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
                      >
                        <option value="new">جديدة</option>
                        <option value="processing">قيد المعالجة</option>
                        <option value="resolved">تم حلها / الرد</option>
                      </select>
                      <ChevronDown size={14} className="absolute end-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    {isUpdating === msg.id && <span className="text-xs text-brand-600 animate-pulse">جاري التحديث...</span>}
                  </div>
                  
                  <a
                    href={mailtoLink}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Mail size={16} />
                    رد عبر البريد الإلكتروني
                  </a>
                </div>
              </div>
            );
          })}
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
