"use client";

import { Mail, Phone, MapPin, Send, Loader2, CheckCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { submitContactMessage } from "@/app/actions/contact";

export default function ContactPage() {
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
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-12 lg:py-20 relative overflow-hidden">
        <div className="absolute top-0 start-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 end-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl text-center mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-6">
              تواصل معنا
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
              نحن هنا لمساعدتك! إذا كان لديك أي استفسار أو اقتراح، فلا تتردد في التواصل معنا.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-12">
          
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm h-full">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">معلومات التواصل</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-xl flex items-center justify-center shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">رقم الهاتف</h3>
                    <p className="text-gray-600 dark:text-gray-400" dir="ltr">+967 736 288 846</p>
                    <p className="text-gray-600 dark:text-gray-400" dir="ltr">+967 713 801 592</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">البريد الإلكتروني</h3>
                    <p className="text-gray-600 dark:text-gray-400">rassamTrassam@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">الموقع</h3>
                    <p className="text-gray-600 dark:text-gray-400">اليمن - تعز</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">أرسل لنا رسالة</h2>

              {/* Success Message */}
              {success && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-600 dark:text-green-400 shrink-0" />
                  <p className="text-green-700 dark:text-green-400 text-sm font-semibold">
                    تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-red-600 dark:text-red-400 text-sm font-semibold">
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
          </div>

        </div>
      </div>
    </div>
  );
}
