// @ts-nocheck
import { createClient } from "@/utils/supabase/server";
import { ProgramCard } from "@/components/ProgramCard";
import { FilterSidebar } from "@/components/FilterSidebar";
import { EmptyState } from "@/components/EmptyState";
import Link from "next/link";
import React from "react";
import type { Tables } from "@/types/database";

type ProgramWithInstitution = Tables<"programs"> & {
  institutions: { name_ar: string; city: string | null } | null;
};

export const revalidate = 0; // Dynamic page

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  const q = typeof params.q === "string" ? params.q : "";
  const level = typeof params.level === "string" ? params.level : "";
  const city = typeof params.city === "string" ? params.city : "";
  const studyType = typeof params.study_type === "string" ? params.study_type : "";
  const sort = typeof params.sort === "string" ? params.sort : "created_at";
  const institution_id = typeof params.institution_id === "string" ? params.institution_id : "";
  
  const page = typeof params.page === "string" ? parseInt(params.page) : 1;
  const limit = 12;
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  // Always use !inner join to filter on institutions if needed, 
  // since every program MUST have an institution.
  let query = supabase
    .from("programs")
    .select(`*, institutions!inner(name_ar, city)`, { count: "exact" });

  if (q) {
    query = query.ilike("title_ar", `%${q}%`);
  }
  if (level) {
    query = query.eq("degree_level", level);
  }
  if (city) {
    query = query.eq("institutions.city", city);
  }
  if (studyType) {
    // We assume the metadata stores it exactly as study_type. 
    // In PostgreSQL JSONB, exact matches can be checked like this:
    query = query.eq("metadata->>study_type", studyType);
  }
  if (institution_id) {
    query = query.eq("institution_id", institution_id);
  }

  // Sorting
  switch (sort) {
    case "average_rating":
      query = query.order("average_rating", { ascending: false }).order("created_at", { ascending: false });
      break;
    case "views_count":
      query = query.order("views_count", { ascending: false }).order("created_at", { ascending: false });
      break;
    case "created_at":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  // Execute query with pagination
  const { data: programs, count, error } = await query
    .range(start, end) as { data: ProgramWithInstitution[] | null; count: number | null; error: unknown };

  const totalPages = count ? Math.ceil(count / limit) : 0;

  // URL Helper for Pagination
  const buildPaginationUrl = (pageNum: number) => {
    const urlParams = new URLSearchParams();
    if (q) urlParams.set("q", q);
    if (level) urlParams.set("level", level);
    if (city) urlParams.set("city", city);
    if (studyType) urlParams.set("study_type", studyType);
    if (institution_id) urlParams.set("institution_id", institution_id);
    if (sort && sort !== "created_at") urlParams.set("sort", sort);
    urlParams.set("page", pageNum.toString());
    return `/programs?${urlParams.toString()}`;
  };

  return (
    <div className="bg-bg-base min-h-screen">
      <div className="bg-bg-surface border-b border-border py-8 shadow-sm relative z-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-text-primary mb-2">استكشف البرامج</h1>
          <p className="text-text-secondary text-sm md:text-base">
            {count !== null ? `تم العثور على ${count} برنامج متاح` : "جاري البحث..."}
            {q && <span className="font-semibold text-brand-600"> لـ &quot;{q}&quot;</span>}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0 md:sticky md:top-24 z-20">
            <React.Suspense fallback={<div className="h-[500px] bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>}>
              <FilterSidebar />
            </React.Suspense>
          </aside>

          {/* Results Grid */}
          <main className="flex-1 w-full min-w-0">
            {error ? (
              <div className="p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800 shadow-sm">
                <p className="font-bold mb-1">حدث خطأ أثناء جلب البيانات</p>
                <p className="text-sm opacity-80">{(error as { message?: string })?.message || "خطأ غير معروف"}</p>
              </div>
            ) : programs && programs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                  {programs.map((program) => (
                    <ProgramCard key={program.id} program={program as any} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center flex-wrap gap-2 mt-12 mb-8">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNum = i + 1;
                      const isCurrent = page === pageNum;
                      return (
                        <Link
                          key={pageNum}
                          href={buildPaginationUrl(pageNum)}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg border font-bold transition-all duration-200 ${
                            isCurrent 
                              ? "bg-brand-600 text-white border-brand-600 shadow-md transform scale-105" 
                              : "bg-bg-surface text-text-secondary border-border hover:bg-bg-elevated hover:text-text-primary"
                          }`}
                        >
                          {pageNum}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <EmptyState 
                title="لا توجد نتائج مطابقة"
                message="جرب إزالة بعض الفلاتر أو استخدام كلمات بحث مختلفة للعثور على البرامج المناسبة."
                actionText="مسح الفلاتر"
              />
            )}
          </main>

        </div>
      </div>
    </div>
  );
}
