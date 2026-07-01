import { getAdminUsers, getAdminInstitutions } from "@/app/actions/admin";
import UsersTableClient from "@/components/admin/UsersTableClient";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await getAdminUsers();
  const institutions = await getAdminInstitutions();

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">إدارة المستخدمين</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">عرض جميع المستخدمين، تحديث الأدوار وإسناد المشرفين لجهاتهم التعليمية.</p>
      </div>

      <UsersTableClient users={users} institutions={institutions} />
    </div>
  );
}
