"use client";

import { useState, useTransition } from "react";
import { updateInstitutionSettings } from "@/app/actions/settings";
import { Save, User, Mail, Phone, Image as ImageIcon, Building2, Loader2 } from "lucide-react";

export default function InstitutionSettingsForm({ profile, institution }: { profile: any; institution: any }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    setMessage(null);
    startTransition(async () => {
      const result = await updateInstitutionSettings(formData);
      if (result.error) {
        setMessage({ text: result.error, type: "error" });
      } else {
        setMessage({ text: "تم الحفظ بنجاح", type: "success" });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 pb-2">
          بيانات مسؤول النظام
        </h3>
        
        <div>
          <label htmlFor="adminName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            اسم المسؤول الكامل
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 pl-3 flex items-center pointer-events-none w-10 justify-center">
              <User size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              id="adminName"
              name="adminName"
              defaultValue={profile.full_name || ""}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-brand-500 focus:border-brand-500 block ps-10 p-3"
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 pb-2">
          بيانات المؤسسة ({institution.name_ar})
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              البريد الإلكتروني للمؤسسة
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 pl-3 flex items-center pointer-events-none w-10 justify-center">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                defaultValue={institution.email || ""}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-brand-500 focus:border-brand-500 block ps-10 p-3"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              رقم الهاتف (للتواصل)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 pl-3 flex items-center pointer-events-none w-10 justify-center">
                <Phone size={18} className="text-gray-400" />
              </div>
              <input
                type="tel"
                id="phone"
                name="phone"
                defaultValue={institution.phone || ""}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-brand-500 focus:border-brand-500 block ps-10 p-3"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="logo" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            شعار المؤسسة
          </label>
          
          <div className="flex items-start gap-4">
            {institution.logo_url ? (
              <div className="w-16 h-16 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0 bg-white relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={institution.logo_url} alt="Logo" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <Building2 size={24} className="text-gray-400" />
              </div>
            )}
            
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 start-0 pl-3 flex items-center pointer-events-none w-10 justify-center">
                  <ImageIcon size={18} className="text-gray-400" />
                </div>
                <input
                  type="file"
                  id="logo"
                  name="logo"
                  accept="image/jpeg, image/png, image/webp"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-brand-500 focus:border-brand-500 block ps-10 p-2.5 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer dark:file:bg-brand-900/30 dark:file:text-brand-400"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                يُفضل أن يكون الشعار مربعاً (1:1) بخلفية شفافة (PNG) وبحجم لا يتجاوز 2MB. سيتم استبدال الشعار الحالي إن وُجد.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button type="submit" disabled={isPending} className="btn-primary py-3 px-8 text-base disabled:opacity-50 flex items-center gap-2">
          {isPending ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          {isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
        </button>
      </div>
    </form>
  );
}
