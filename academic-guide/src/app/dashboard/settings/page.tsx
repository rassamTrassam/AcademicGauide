// @ts-nocheck
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { updateInstitutionSettings } from "@/app/actions/settings";
import { Save, User, Mail, Phone, Image as ImageIcon, Building2 } from "lucide-react";
import InstitutionSettingsForm from "./InstitutionSettingsForm";

export const metadata = {
  title: "إعدادات المؤسسة | الدليل الأكاديمي اليمني",
};

export default async function DashboardSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*, institutions(*)")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.institutions) {
    return <div>حدث خطأ في استرجاع بيانات المؤسسة.</div>;
  }

  const institution = Array.isArray(profile.institutions) ? profile.institutions[0] : profile.institutions;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">إعدادات المؤسسة</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">تحديث بيانات الاتصال واسم المسؤول وشعار المؤسسة.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden max-w-3xl">
        <InstitutionSettingsForm profile={profile} institution={institution} />
      </div>
    </div>
  );
}
