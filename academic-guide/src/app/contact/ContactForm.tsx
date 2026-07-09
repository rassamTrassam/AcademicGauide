"use client";

import { Send, Loader2, CheckCircle, Info } from "lucide-react";
import { useState, useTransition } from "react";
import { submitContactMessage } from "@/app/actions/contact";

export default function ContactForm({ defaultName = "", defaultEmail = "" }: { defaultName?: string, defaultEmail?: string }) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;

    startTransition(async () => {
      const result = await submitContactMessage(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        form.reset();
      }
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">أرسل لنا رسالة</h2>

      {/* Support Reply Clarification Banner */}
      <div className="bg-blue-50/10 dark:bg-blue-900/20 border border-blue-500/20 text-blue-800 dark:text-blue-200 p-4 rounded-xl flex items-start gap-3 text-sm leading-relaxed mb-6 transition-all duration-300">
        <Info className="shrink-0 text-blue-500 mt-0.5" size={20} />
        <p>
          سيتم الرد على استفسارك مباشرة عبر البريد الإلكتروني الذي تدخله أدناه. يرجى التأكد من كتابة بريد إلكتروني نشط وصحيح لتلقي الرد.
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl flex items-center gap-3 animate-fade-in">
          <CheckCircle size={20} className="text-green-600 dark:text-green-400 shrink-0" />
          <p className="text-green-700 dark:text-green-400 text-sm font-semibold">
            تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-red-600 dark:text-red-400 text-sm font-semibold animate-fade-in">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">الاسم الكامل</label>
            <input 
              type="text" 
              name="name"
              defaultValue={defaultName}
              required
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-brand-500 focus:border-brand-500 block p-3" 
              placeholder="أدخل اسمك الكريم"
              disabled={isPending}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">البريد الإلكتروني</label>
            <input 
              type="email" 
              name="email"
              defaultValue={defaultEmail}
              required
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-brand-500 focus:border-brand-500 block p-3 text-left" 
              placeholder="example@email.com"
              dir="ltr"
              disabled={isPending}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">الموضوع</label>
          <input 
            type="text" 
            name="subject"
            required
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-brand-500 focus:border-brand-500 block p-3" 
            placeholder="عنوان الرسالة"
            disabled={isPending}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">الرسالة</label>
          <textarea 
            rows={5}
            name="message"
            required
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-brand-500 focus:border-brand-500 block p-3 resize-none" 
            placeholder="تفاصيل رسالتك..."
            disabled={isPending}
          ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="btn-primary w-full sm:w-auto py-3 px-8 text-base font-bold disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 size={20} className="animate-spin ms-2" />
              جاري الإرسال...
            </>
          ) : (
            <>
              <Send size={20} className="ms-2 rotate-180" />
              إرسال الرسالة
            </>
          )}
        </button>
      </form>
    </div>
  );
}
