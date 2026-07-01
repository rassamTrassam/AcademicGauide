import { ProgramForm } from "@/components/ProgramForm";

export default function NewProgramPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">إضافة برنامج جديد</h1>
        <p className="text-text-secondary mt-1">أدخل بيانات البرنامج ليتم عرضه في الدليل الأكاديمي.</p>
      </div>
      
      <ProgramForm />
    </div>
  );
}
