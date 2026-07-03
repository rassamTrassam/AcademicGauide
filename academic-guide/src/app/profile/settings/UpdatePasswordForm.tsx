"use client";

import { useState, useTransition } from "react";
import { Lock, Save } from "lucide-react";
import { updateUserPassword } from "@/app/actions/auth";
import toast from "react-hot-toast";

export default function UpdatePasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error("كلمة المرور يجب أن لا تقل عن 6 أحرف");
      return;
    }

    startTransition(async () => {
      const result = await updateUserPassword(password);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("تم تحديث كلمة المرور بنجاح. يمكنك الآن استخدامها لتسجيل الدخول.");
        setPassword("");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
      <div>
        <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          تعيين أو تغيير كلمة المرور
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 pl-3 flex items-center pointer-events-none w-10 justify-center">
            <Lock size={18} className="text-gray-400" />
          </div>
          <input
            type="password"
            id="newPassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-brand-500 focus:border-brand-500 block ps-10 p-3"
            placeholder="كلمة مرور جديدة (6 أحرف على الأقل)"
            required
            minLength={6}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          مفيدة إذا قمت بإنشاء حسابك عبر Google وترغب بتسجيل الدخول لاحقاً باستخدام البريد وكلمة المرور.
        </p>
      </div>

      <div className="pt-4 flex justify-end">
        <button 
          type="submit" 
          disabled={isPending}
          className="btn-primary py-3 px-8 text-base disabled:opacity-50"
        >
          {isPending ? "جاري الحفظ..." : (
            <>
              <Save size={20} className="ml-2" />
              حفظ كلمة المرور
            </>
          )}
        </button>
      </div>
    </form>
  );
}
