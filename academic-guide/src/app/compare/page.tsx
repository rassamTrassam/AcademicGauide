// @ts-nocheck
"use client";

import { useCompareStore } from "@/store/useCompareStore";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Tables } from "@/types/database";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Trash2, GraduationCap, MapPin, Building2, BookOpen, Clock, Banknote, Star } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";


type ProgramWithInstitution = Tables<"programs"> & {
  institutions: { name_ar: string; city: string | null; logo_url: string | null } | null;
};

export default function ComparePage() {
  const { compareIds, toggleCompare, clearCompare } = useCompareStore();
  const [mounted, setMounted] = useState(false);
  const [programs, setPrograms] = useState<ProgramWithInstitution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    async function fetchPrograms() {
      if (compareIds.length === 0) {
        setPrograms([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("programs")
        .select(`*, institutions(name_ar, city, logo_url)`)
        .in("id", compareIds);

      if (data) {
        // Sort data to match the order in compareIds
        const sortedData = data.sort((a, b) => compareIds.indexOf(a.id) - compareIds.indexOf(b.id));
        setPrograms(sortedData as ProgramWithInstitution[]);
      }
      setLoading(false);
    }

    fetchPrograms();
  }, [compareIds]);

  if (!mounted) return null;

  if (compareIds.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <EmptyState 
            title="قائمة المقارنة فارغة"
            message="قم بتصفح البرامج الأكاديمية وأضف ما يصل إلى 3 برامج للمقارنة بينها."
            actionText="تصفح البرامج"
          />
        </div>
      </div>
    );
  }

  const degreeMap: Record<string, string> = {
    bachelor: "بكالوريوس",
    master: "ماجستير",
    phd: "دكتوراه",
    diploma: "دبلوم",
    certificate: "شهادة",
    course: "دورة",
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <Link href="/programs" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-semibold mb-4 transition-colors">
              <ArrowLeft size={18} />
              العودة للبرامج
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">مقارنة البرامج</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">قارن بين البرامج المختارة لاتخاذ القرار الأفضل لمستقبلك.</p>
          </div>
          <button 
            onClick={clearCompare}
            className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-xl font-semibold transition-colors border border-red-200 dark:border-red-800/30 bg-white dark:bg-gray-800"
          >
            <Trash2 size={18} />
            إفراغ القائمة
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].slice(0, compareIds.length).map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 h-[600px] animate-pulse">
                <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
                <div className="space-y-4">
                  <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
                  <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
                  <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => {
              const metadata = program.metadata as any;
              const duration = metadata?.duration_raw || metadata?.["المدة الدراسية"] || "غير محدد";
              const fees = metadata?.fees_raw || metadata?.["الرسوم الدراسية"] || "غير محدد";
              const studyType = metadata?.study_type || metadata?.["نوع الدراسة"] || "غير محدد";
              const city = program.institutions?.city || metadata?.city || metadata?.["المدينة أو مقر الدراسة"] || "غير محدد";

              return (
                <div key={program.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-brand-300 dark:hover:border-brand-700 transition-colors shadow-sm relative group">
                  <button 
                    onClick={() => toggleCompare(program.id)}
                    className="absolute top-3 end-3 z-10 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                    title="إزالة من المقارنة"
                  >
                    <XCircle size={20} />
                  </button>
                  
                  {/* Image Header */}
                  <div className="relative h-48 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    {program.cover_image_url ? (
                      <Image src={program.cover_image_url} alt={program.title_ar} fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-50 dark:from-brand-900/40 dark:to-brand-800/20 text-brand-500/50">
                        <BookOpen size={48} className="opacity-50" />
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      {program.institutions?.logo_url ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-gray-100 shrink-0 relative">
                          <Image src={program.institutions.logo_url} alt="Logo" fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-600">
                          <Building2 size={20} className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg line-clamp-1">{program.title_ar}</h3>
                        <p className="text-brand-600 dark:text-brand-400 text-sm font-semibold truncate">{program.institutions?.name_ar}</p>
                      </div>
                    </div>

                    <div className="space-y-4 mt-8">
                      {/* Comparison Items */}
                      <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-700/50 pb-3">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 w-1/3 shrink-0">
                          <GraduationCap size={16} />
                          <span className="text-sm font-semibold">الدرجة</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 text-end">
                          {degreeMap[program.degree_level] || program.degree_level}
                        </span>
                      </div>

                      <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-700/50 pb-3">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 w-1/3 shrink-0">
                          <MapPin size={16} />
                          <span className="text-sm font-semibold">المدينة</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 text-end">{city}</span>
                      </div>

                      <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-700/50 pb-3">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 w-1/3 shrink-0">
                          <BookOpen size={16} />
                          <span className="text-sm font-semibold">نظام الدراسة</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 text-end">{studyType}</span>
                      </div>

                      <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-700/50 pb-3">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 w-1/3 shrink-0">
                          <Clock size={16} />
                          <span className="text-sm font-semibold">المدة</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 text-end">{duration}</span>
                      </div>

                      <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-700/50 pb-3">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 w-1/3 shrink-0">
                          <Banknote size={16} />
                          <span className="text-sm font-semibold">الرسوم</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 text-end line-clamp-2">{fees}</span>
                      </div>

                      <div className="flex items-start justify-between pb-3">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 w-1/3 shrink-0">
                          <Star size={16} />
                          <span className="text-sm font-semibold">التقييم</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-bold text-gray-900 dark:text-gray-100">
                          <Star size={14} className={program.average_rating > 0 ? "fill-yellow-500 text-yellow-500" : "text-gray-300"} />
                          {program.average_rating > 0 ? program.average_rating.toFixed(1) : "جديد"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <Link href={`/programs/${program.id}`} className="btn-primary w-full justify-center py-3">
                        عرض التفاصيل بالكامل
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Empty Slot Placeholder */}
            {compareIds.length < 3 && (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center p-8 text-center text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors h-[600px]">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <BookOpen size={32} className="text-gray-400" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">أضف برنامجاً آخر</h3>
                <p className="text-sm mb-6 max-w-xs">يمكنك مقارنة ما يصل إلى 3 برامج في وقت واحد للحصول على رؤية أوضح.</p>
                <Link href="/programs" className="btn-ghost">
                  تصفح البرامج
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
