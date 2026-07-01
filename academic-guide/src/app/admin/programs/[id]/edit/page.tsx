// @ts-nocheck
import { ProgramForm } from "@/components/ProgramForm";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { getAdminInstitutions } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminEditProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== "super_admin") {
    redirect("/");
  }

  const { data: program } = await supabase
    .from("programs")
    .select("*")
    .eq("id", id)
    .single();

  if (!program) {
    notFound();
  }

  const institutions = await getAdminInstitutions();

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">تعديل البرنامج (مشرف عام)</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">تحديث بيانات البرنامج وتغيير الجهة التعليمية إن لزم الأمر.</p>
      </div>
      
      <ProgramForm initialData={program} programId={program.id} isSuperAdmin={true} institutions={institutions} />
    </div>
  );
}
