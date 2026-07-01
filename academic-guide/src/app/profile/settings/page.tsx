import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { updateStudentSettings } from "@/app/actions/settings";
import { Save, User, Mail } from "lucide-react";

export const metadata = {
  title: "إعدادات الحساب | الدليل الأكاديمي اليمني",
};

export default async function ProfileSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return <div>حدث خطأ في استرجاع بياناتك.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">إعدادات الحساب</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">تحديث بياناتك الشخصية.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden max-w-2xl">
        <form action={updateStudentSettings} className="p-6 sm:p-8 space-y-8">
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 pl-3 flex items-center pointer-events-none w-10 justify-center">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="w-full bg-gray-100 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 rounded-xl cursor-not-allowed block ps-10 p-3"
                  dir="ltr"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">لا يمكن تغيير البريد الإلكتروني حالياً.</p>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                الاسم الكامل
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 pl-3 flex items-center pointer-events-none w-10 justify-center">
                  <User size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  defaultValue={profile.full_name || ""}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-brand-500 focus:border-brand-500 block ps-10 p-3"
                  required
                  minLength={3}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" className="btn-primary py-3 px-8 text-base">
              <Save size={20} className="ml-2" />
              حفظ التعديلات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
