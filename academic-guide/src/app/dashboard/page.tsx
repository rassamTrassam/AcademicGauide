import { Plus, Eye, MoreVertical } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let programs = [];
  let totalPrograms = 0;
  let totalViews = 0;

  if (user) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("institution_id, role")
      .eq("id", user.id)
      .single();

    if (profile?.institution_id || profile?.role === "super_admin") {
      let query = supabase
        .from("programs")
        .select("*")
        .order("created_at", { ascending: false });

      if (profile?.role !== "super_admin") {
        query = query.eq("institution_id", profile.institution_id);
      }

      const { data: instPrograms } = await query;

      if (instPrograms) {
        programs = instPrograms;
        totalPrograms = programs.length;
        totalViews = programs.reduce((acc: number, curr: any) => acc + (curr.views_count || 0), 0);
      }
    }
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">نظرة عامة</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">إحصاءات وأداء البرامج على المنصة</p>
        </div>
        <Link href="/dashboard/programs/new" className="btn-primary">
          <Plus size={18} />
          إضافة برنامج جديد
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="card p-6 border-s-4 border-s-brand-500">
          <span className="text-sm font-semibold text-text-secondary">إجمالي البرامج</span>
          <div className="text-3xl font-black mt-2">{totalPrograms}</div>
        </div>
        <div className="card p-6 border-s-4 border-s-purple-500">
          <span className="text-sm font-semibold text-text-secondary">مشاهدات البرامج</span>
          <div className="text-3xl font-black mt-2">{totalViews.toLocaleString()}</div>
        </div>
        <div className="card p-6 border-s-4 border-s-green-500">
          <span className="text-sm font-semibold text-text-secondary">طلبات الاستفسار والتسجيل</span>
          <div className="text-3xl font-black mt-2">0</div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-lg">أحدث البرامج المضافة</h2>
          <Link href="/dashboard/programs" className="text-brand-600 text-sm font-semibold hover:underline">عرض الكل</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="bg-bg-elevated/50 text-text-muted text-sm border-b border-border">
                <th className="font-semibold py-3 px-6 text-start">البرنامج</th>
                <th className="font-semibold py-3 px-6 text-start">الدرجة العلمية</th>
                <th className="font-semibold py-3 px-6 text-start">الحالة</th>
                <th className="font-semibold py-3 px-6 text-start">المشاهدات</th>
                <th className="font-semibold py-3 px-6 text-start"></th>
              </tr>
            </thead>
            <tbody>
              {programs.length > 0 ? programs.slice(0, 5).map((program: any) => (
                <tr key={program.id} className="border-b border-border/50 last:border-0 hover:bg-bg-elevated/20 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-text-primary">{program.title_ar}</div>
                    <div className="text-xs text-text-muted mt-1">{program.faculty_ar}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="badge badge-blue">
                      {program.degree_level === 'bachelor' ? 'بكالوريوس' : 
                       program.degree_level === 'master' ? 'ماجستير' : 
                       program.degree_level === 'phd' ? 'دكتوراه' : 
                       program.degree_level === 'diploma' ? 'دبلوم' : 'أخرى'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`badge ${program.status === 'active' ? 'badge-green' : 'badge-yellow'}`}>
                      {program.status === 'active' ? 'نشط' : program.status === 'draft' ? 'مسودة' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-text-secondary flex items-center gap-2">
                    <Eye size={14}/> {program.views_count || 0}
                  </td>
                  <td className="py-4 px-6 text-end">
                    <button className="p-2 text-text-muted hover:text-text-primary rounded-full hover:bg-bg-elevated">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-text-muted">
                    لا توجد برامج مضافة حتى الآن.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
