// @ts-nocheck
import { ProgramForm } from "@/components/ProgramForm";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";

export default async function EditProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("institution_id")
    .eq("id", user.id)
    .single();

  if (!profile?.institution_id) {
    redirect("/dashboard");
  }

  const { data: program } = await supabase
    .from("programs")
    .select("*")
    .eq("id", id)
    .single();

  if (!program) {
    notFound();
  }

  if (program.institution_id !== profile.institution_id) {
    redirect("/dashboard/programs"); // Unauthorized
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">تعديل البرنامج</h1>
        <p className="text-text-secondary mt-1">يمكنك تحديث بيانات البرنامج وملفاته المرفقة.</p>
      </div>
      
      <ProgramForm initialData={program} programId={program.id} />
    </div>
  );
}
