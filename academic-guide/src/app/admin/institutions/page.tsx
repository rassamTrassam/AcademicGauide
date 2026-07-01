import { getAdminInstitutions } from "@/app/actions/admin";
import { Building2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InstitutionsPage() {
  const institutions = await getAdminInstitutions();

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">إدارة المؤسسات التعليمية</h1>
        <p className="text-text-secondary mt-1">عرض جميع المؤسسات المسجلة في النظام</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="bg-bg-elevated/50 text-text-muted text-sm border-b border-border">
                <th className="font-semibold py-4 px-6 text-start">المؤسسة</th>
                <th className="font-semibold py-4 px-6 text-start">النوع</th>
                <th className="font-semibold py-4 px-6 text-start">المحافظة</th>
                <th className="font-semibold py-4 px-6 text-start">حالة التسجيل</th>
              </tr>
            </thead>
            <tbody>
              {institutions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-text-muted">
                    لا توجد مؤسسات تعليمية حالياً.
                  </td>
                </tr>
              ) : (
                institutions.map((inst: any) => (
                  <tr key={inst.id} className="border-b border-border/50 last:border-0 hover:bg-bg-elevated/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/20 text-brand-600 flex items-center justify-center shrink-0">
                          <Building2 size={20} />
                        </div>
                        <div className="font-semibold text-text-primary">{inst.name_ar}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-text-secondary">
                      {inst.type === "university" ? "جامعة" : inst.type === "institute" ? "معهد" : "أكاديمية"}
                    </td>
                    <td className="py-4 px-6 text-text-secondary">{inst.city_ar || "غير محدد"}</td>
                    <td className="py-4 px-6">
                      <span className="badge badge-green">معتمدة</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
