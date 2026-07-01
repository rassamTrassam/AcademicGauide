import { ProgramForm } from "@/components/ProgramForm";
import { getAdminInstitutions } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function NewAdminProgramPage() {
  const institutions = await getAdminInstitutions();

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">إضافة برنامج جديد (مشرف عام)</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">أضف برنامجاً جديداً واختر الجهة التعليمية التابع لها.</p>
      </div>
      
      <ProgramForm isSuperAdmin={true} institutions={institutions} />
    </div>
  );
}
