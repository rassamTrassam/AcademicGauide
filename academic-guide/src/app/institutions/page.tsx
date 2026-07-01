// @ts-nocheck
import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { Building2, MapPin, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "دليل الجامعات والمعاهد | الدليل الأكاديمي اليمني",
  description: "تصفح كافة الجامعات والمعاهد اليمنية المسجلة في الدليل الأكاديمي اليمني.",
};

export default async function InstitutionsPage() {
  const supabase = await createClient();

  const { data: institutions, error } = await supabase
    .from("institutions")
    .select("*, programs(count)")
    .eq("is_active", true)
    .order("name_ar");

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">حدث خطأ أثناء تحميل البيانات</h1>
        <p className="text-gray-600 mb-8">يرجى المحاولة مرة أخرى لاحقاً.</p>
        <Link href="/" className="btn-primary">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-12 lg:py-20 relative overflow-hidden">
        <div className="absolute top-0 start-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 end-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl text-center mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-6">
              دليل الجامعات والمعاهد اليمنية
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
              تصفح نخبة من أفضل المؤسسات التعليمية في اليمن. اختر المؤسسة التي تناسب طموحاتك واستكشف البرامج المتاحة فيها.
            </p>
          </div>
        </div>
      </div>

      {/* Institutions Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {institutions?.map((institution) => (
            <Link 
              key={institution.id} 
              href={`/programs?institution_id=${institution.id}`}
              className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-brand-300 dark:hover:border-brand-700 transition-colors shadow-sm hover:shadow-lg group flex flex-col h-full"
            >
              <div className="relative h-32 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 border-b border-gray-100 dark:border-gray-700">
                {institution.cover_url && (
                  <Image src={institution.cover_url} alt={institution.name_ar} fill className="object-cover opacity-50 mix-blend-overlay group-hover:opacity-75 transition-opacity" />
                )}
                
                {/* Logo overlapping the header */}
                <div className="absolute -bottom-10 start-6 w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-1 overflow-hidden z-10 transition-transform group-hover:scale-105">
                  {institution.logo_url ? (
                    <div className="w-full h-full relative rounded-xl overflow-hidden bg-white">
                      <Image src={institution.logo_url} alt={institution.name_ar} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center">
                      <Building2 size={24} className="text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 pt-14 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                  {institution.name_ar}
                </h3>
                
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-medium mb-6">
                  <MapPin size={16} className="text-brand-500" />
                  {institution.city || "اليمن"}
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-gray-100 dark:border-gray-700/50 pt-4">
                  <div className="text-sm">
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {/* @ts-ignore */}
                      {institution.programs?.[0]?.count || 0}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ms-1">برنامج متاح</span>
                  </div>
                  <div className="text-brand-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    عرض البرامج <ArrowLeft size={16} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {(!institutions || institutions.length === 0) && (
          <div className="text-center py-20">
            <Building2 size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">لا توجد مؤسسات حالياً</h3>
            <p className="text-gray-500 dark:text-gray-400">نعمل على إضافة المزيد من الجامعات والمعاهد قريباً.</p>
          </div>
        )}
      </div>
    </div>
  );
}
