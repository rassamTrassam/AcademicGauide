"use client";

import { useState, useTransition } from "react";
import { MessageSquare, X, Send, Loader2, Globe, Mail } from "lucide-react";
import { startConversation } from "@/app/actions/messages";
import { useRouter } from "next/navigation";

interface ContactButtonProps {
  programId: string;
  institutionId: string;
  isAuthenticated: boolean;
  institutionWebsite?: string | null;
  institutionEmail?: string | null;
}

export function ContactButton({ programId, institutionId, isAuthenticated, institutionWebsite, institutionEmail }: ContactButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleOpen = () => {
    if (!isAuthenticated) {
      // Force them to login
      router.push(`/login?redirectTo=/programs/${programId}`);
      return;
    }
    setIsOpen(true);
    setSuccess(false);
    setError(null);
  };

  const handleSend = () => {
    if (!message.trim()) return;
    
    setError(null);
    startTransition(async () => {
      const result = await startConversation(programId, institutionId, message);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setMessage("");
        setTimeout(() => setIsOpen(false), 2000);
      }
    });
  };

  return (
    <>
      <div className="flex items-center gap-2 w-full">
        <button 
          onClick={handleOpen}
          className="btn-primary flex-1 justify-center py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
          title="مراسلة في المنصة"
        >
          <MessageSquare size={20} />
          مراسلة الجهة
        </button>

        {/* Globe icon — only rendered if institution has a real website */}
        {institutionWebsite && (
          <a
            href={institutionWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary shrink-0 px-4 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            title="الموقع الإلكتروني"
          >
            <Globe size={20} />
          </a>
        )}

        {/* Mail icon — only rendered if institution has a real email */}
        {institutionEmail && (
          <a
            href={`mailto:${institutionEmail}`}
            className="btn-primary shrink-0 px-4 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            title="البريد الإلكتروني"
          >
            <Mail size={20} />
          </a>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-bg-base w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-scale-up">
            <div className="p-4 border-b border-border flex items-center justify-between bg-bg-surface">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <MessageSquare size={20} className="text-blue-500" />
                أرسل استفساراً
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-text-muted hover:text-text-primary p-2 rounded-full hover:bg-bg-elevated transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {success ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send size={32} />
                  </div>
                  <h4 className="text-xl font-bold mb-2">تم الإرسال بنجاح!</h4>
                  <p className="text-text-secondary">سيتم الرد عليك في أقرب وقت من قبل الجهة التعليمية.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                      {error}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold mb-2">رسالتك:</label>
                    <textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      placeholder="اكتب استفسارك هنا بوضوح..."
                      className="w-full bg-bg-surface border border-border rounded-xl p-3 text-text-base outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                    />
                  </div>
                  <button 
                    onClick={handleSend}
                    disabled={isPending || !message.trim()}
                    className="btn-primary w-full justify-center py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isPending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    {isPending ? "جاري الإرسال..." : "إرسال الرسالة"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
