"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProgram, updateProgram } from "@/app/actions/programs";
import { Loader2, Save, X, Image as ImageIcon, FileText } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ProgramFormProps {
  initialData?: any;
  programId?: string;
  isSuperAdmin?: boolean;
  institutions?: any[];
}

export function ProgramForm({ initialData, programId, isSuperAdmin = false, institutions = [] }: ProgramFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  
  const isEditing = !!programId;
  const metadata = initialData?.metadata || {};

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      let result;
      if (isEditing) {
        result = await updateProgram(programId, formData);
      } else {
        result = await createProgram(formData);
      }

      if (result.error) {
        setError(result.error);
      } else {
        router.push(isSuperAdmin ? "/admin/programs" : "/dashboard/programs");
      }
    });
  };

  return (
    <div className="card p-6 md:p-8">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-semibold text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Institution Selector for Super Admin */}
          {isSuperAdmin && (
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">الجهة التعليمية <span className="text-red-500">*</span></label>
              <select 
                name="institution_id" 
                required 
                defaultValue={initialData?.institution_id || ""} 
                className="input-base"
              >
                <option value="" disabled>-- اختر الجهة التعليمية --</option>
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.name_ar}</option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2">اسم البرنامج <span className="text-red-500">*</span></label>
            <input 
              name="title_ar"
              type="text"
              required
              defaultValue={initialData?.title_ar}
              placeholder="مثال: بكالوريوس الطب والجراحة"
              className="input-base"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2">وصف البرنامج</label>
            <textarea 
              name="description_ar"
              rows={4}
              defaultValue={initialData?.description_ar || ""}
              placeholder="وصف مختصر للبرنامج ومميزاته..."
              className="w-full bg-white text-gray-900 border-gray-300 dark:bg-gray-900 dark:text-white dark:border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Degree Level */}
          <div>
            <label className="block text-sm font-semibold mb-2">الدرجة العلمية <span className="text-red-500">*</span></label>
            <select name="degree_level" defaultValue={initialData?.degree_level || "bachelor"} className="input-base">
              <option value="bachelor">بكالوريوس</option>
              <option value="master">ماجستير</option>
              <option value="phd">دكتوراه</option>
              <option value="diploma">دبلوم</option>
              <option value="certificate">شهادة قصيرة</option>
              <option value="course">دورة تدريبية</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold mb-2">حالة النشر <span className="text-red-500">*</span></label>
            <select name="status" defaultValue={initialData?.status || "draft"} className="input-base">
              <option value="draft">مسودة (غير منشور)</option>
              <option value="active">نشط (منشور)</option>
              <option value="inactive">غير نشط (مخفي)</option>
            </select>
          </div>

          {/* Study Type */}
          <div>
            <label className="block text-sm font-semibold mb-2">نمط الدراسة</label>
            <input 
              name="study_type"
              type="text"
              defaultValue={metadata?.study_style || ""}
              placeholder="مثال: حضوري، عن بعد، مدمج"
              className="input-base"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold mb-2">مدة الدراسة</label>
            <input 
              name="duration"
              type="text"
              defaultValue={metadata?.duration_raw || ""}
              placeholder="مثال: 4 سنوات، 8 فصول"
              className="input-base"
            />
          </div>

          {/* Fees */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold mb-2">الرسوم الدراسية التقريبية</label>
            <input 
              name="fees"
              type="text"
              defaultValue={metadata?.fees_raw || ""}
              placeholder="مثال: 1500$ سنوياً"
              className="input-base"
            />
          </div>

          {/* Cover Image Upload */}
          <div className="card p-4 bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 transition-colors">
            <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
              <ImageIcon size={18} className="text-blue-500" />
              صورة الغلاف (اختياري)
            </label>
            {initialData?.cover_image_url && (
              <div className="mb-4 relative w-32 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <Image src={initialData.cover_image_url} alt="Cover" fill className="object-cover" />
              </div>
            )}
            <input 
              name="cover_image"
              type="file"
              accept="image/*"
              className="block w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
            />
          </div>

          {/* Study Plan PDF Upload */}
          <div className="card p-4 bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 transition-colors">
            <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
              <FileText size={18} className="text-purple-500" />
              الخطة الدراسية (PDF اختياري)
            </label>
            {initialData?.study_plan_pdf_url && (
              <div className="mb-4 text-sm text-blue-600 font-semibold underline">
                <a href={initialData.study_plan_pdf_url} target="_blank" rel="noopener noreferrer">عرض الخطة الحالية</a>
              </div>
            )}
            <input 
              name="study_plan_pdf"
              type="file"
              accept="application/pdf"
              className="block w-full text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900/30 dark:file:text-purple-400"
            />
          </div>

        </div>

        {/* Actions */}
        <div className="pt-6 border-t border-border flex items-center gap-4">
          <button 
            type="submit"
            disabled={isPending}
            className="btn-primary"
          >
            {isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isPending ? "جاري الحفظ..." : "حفظ البرنامج"}
          </button>
          
          <Link href={isSuperAdmin ? "/admin/programs" : "/dashboard/programs"} className="btn-ghost">
            <X size={18} />
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  );
}
