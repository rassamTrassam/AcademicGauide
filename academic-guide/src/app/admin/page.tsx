import { getAdminStats } from "@/app/actions/admin";
import { Building2, CheckSquare, GraduationCap, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="text-3xl font-black text-text-primary">نظرة عامة على النظام</h1>
        <p className="text-text-secondary mt-1">إحصائيات المنصة الشاملة</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 border-s-4 border-s-blue-500 flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-text-secondary">المؤسسات التعليمية</span>
            <div className="text-3xl font-black mt-2 text-text-primary">{stats.institutionsCount}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
            <Building2 size={24} />
          </div>
        </div>

        <div className="card p-6 border-s-4 border-s-green-500 flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-text-secondary">البرامج الأكاديمية</span>
            <div className="text-3xl font-black mt-2 text-text-primary">{stats.programsCount}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 text-green-500 flex items-center justify-center">
            <GraduationCap size={24} />
          </div>
        </div>

        <div className="card p-6 border-s-4 border-s-orange-500 flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-text-secondary">طلبات معلقة</span>
            <div className="text-3xl font-black mt-2 text-text-primary">{stats.pendingCount}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center">
            <CheckSquare size={24} />
          </div>
        </div>

        <div className="card p-6 border-s-4 border-s-purple-500 flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-text-secondary">إجمالي المستخدمين</span>
            <div className="text-3xl font-black mt-2 text-text-primary">{stats.usersCount}</div>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-500 flex items-center justify-center">
            <Users size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}
