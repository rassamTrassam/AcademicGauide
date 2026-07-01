// @ts-nocheck
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Eye, Star, Heart } from "lucide-react";
import { DeleteProgramButton } from "@/components/DeleteProgramButton";

export default async function ProgramsManagementPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("institution_id, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "super_admin" && !profile?.institution_id) {
    redirect("/dashboard");
  }

  let query = supabase
    .from("programs")
    .select("*, institutions(name_ar)")
    .order("created_at", { ascending: false });

  if (profile?.role !== "super_admin") {
    query = query.eq("institution_id", profile.institution_id);
  }

  const { data: programs } = await query;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">إدارة البرامج</h1>
          <p className="text-text-secondary mt-1">تصفح، تعديل، أو حذف البرامج الخاصة بمؤسستك.</p>
        </div>
        
        <Link href="/dashboard/programs/new" className="btn-primary">
          <Plus size={18} />
          إضافة برنامج جديد
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="bg-bg-elevated/50 text-text-muted text-sm border-b border-border">
                <th className="font-semibold py-4 px-6 text-start">اسم البرنامج</th>
                <th className="font-semibold py-4 px-6 text-start">الدرجة العلمية</th>
                <th className="font-semibold py-4 px-6 text-start">الحالة</th>
                <th className="font-semibold py-4 px-6 text-center">التفاعل</th>
                <th className="font-semibold py-4 px-6 text-end">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {programs && programs.length > 0 ? programs.map((program: any) => (
                <tr key={program.id} className="border-b border-border/50 last:border-0 hover:bg-bg-elevated/20 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{program.title_ar}</div>
                    {profile?.role === "super_admin" && program.institutions?.name_ar && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-semibold">{program.institutions.name_ar}</div>
                    )}
                    {program.metadata?.study_style && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{program.metadata.study_style}</div>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className="badge badge-blue">
                      {program.degree_level === 'bachelor' ? 'بكالوريوس' : 
                       program.degree_level === 'master' ? 'ماجستير' : 
                       program.degree_level === 'phd' ? 'دكتوراه' : 
                       program.degree_level === 'diploma' ? 'دبلوم' : 
                       program.degree_level === 'certificate' ? 'شهادة قصيرة' : 
                       program.degree_level === 'course' ? 'دورة تدريبية' : 'أخرى'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`badge ${program.status === 'active' ? 'badge-green' : program.status === 'draft' ? 'badge-yellow' : 'badge-red'}`}>
                      {program.status === 'active' ? 'نشط' : program.status === 'draft' ? 'مسودة' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-center gap-4 text-xs text-text-secondary font-medium">
                      <div className="flex items-center gap-1" title="المشاهدات">
                        <Eye size={14} /> {program.views_count || 0}
                      </div>
                      <div className="flex items-center gap-1" title="المفضلة">
                        <Heart size={14} className={program.favorites_count > 0 ? "text-red-500 fill-red-500" : ""} /> {program.favorites_count || 0}
                      </div>
                      <div className="flex items-center gap-1" title="التقييم">
                        <Star size={14} className={program.average_rating > 0 ? "text-yellow-500 fill-yellow-500" : ""} /> {Number(program.average_rating || 0).toFixed(1)}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/dashboard/programs/${program.id}/edit`}
                        title="تعديل البرنامج"
                        className="p-2 text-text-muted hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors"
                      >
                        <Edit size={18} />
                      </Link>
                      
                      <DeleteProgramButton programId={program.id} programTitle={program.title_ar} />
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-muted">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <p className="text-lg">لا توجد برامج مضافة حتى الآن.</p>
                      <Link href="/dashboard/programs/new" className="text-brand-600 font-semibold hover:underline">
                        أضف برنامجك الأول
                      </Link>
                    </div>
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
