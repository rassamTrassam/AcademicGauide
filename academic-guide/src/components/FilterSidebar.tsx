"use client";

import { Search, Filter, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";

const CITIES = ["صنعاء", "عدن", "تعز", "حضرموت", "الحديدة", "إب"];
const STUDY_TYPES = [
  { id: "", label: "الكل" },
  { id: "حضوري منتظم", label: "حضوري منتظم" },
  { id: "عن بعد", label: "عن بعد" },
];
const DEGREE_LEVELS = [
  { id: "", label: "الكل" },
  { id: "bachelor", label: "بكالوريوس" },
  { id: "master", label: "ماجستير" },
  { id: "diploma", label: "دبلوم" },
  { id: "course", label: "دورة تدريبية" },
];
const SORT_OPTIONS = [
  { id: "created_at", label: "الأحدث" },
  { id: "average_rating", label: "الأعلى تقييماً" },
  { id: "views_count", label: "الأكثر مشاهدة" },
];

export function FilterSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Local state for debounced search
  const initialSearch = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Helper to update query params
  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      let hasChanges = false;

      Object.entries(updates).forEach(([name, value]) => {
        if (value === null || value === "") {
          if (params.has(name)) {
            params.delete(name);
            hasChanges = true;
          }
        } else {
          if (params.get(name) !== value) {
            params.set(name, value);
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        params.set("page", "1"); // Reset page on filter change
      }
      return { str: params.toString(), hasChanges };
    },
    [searchParams]
  );

  const handleFilterChange = (key: string, value: string) => {
    const { str, hasChanges } = createQueryString({ [key]: value });
    if (hasChanges) {
      router.push(pathname + "?" + str, { scroll: false });
    }
  };

  // Effect to update URL when debounced search changes
  useEffect(() => {
    const { str, hasChanges } = createQueryString({ q: debouncedSearchTerm });
    if (hasChanges) {
      router.push(pathname + "?" + str, { scroll: false });
    }
  }, [debouncedSearchTerm, createQueryString, pathname, router]);

  const currentLevel = searchParams.get("level") || "";
  const currentCity = searchParams.get("city") || "";
  const currentStudyType = searchParams.get("study_type") || "";
  const currentSort = searchParams.get("sort") || "created_at";

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden w-full mb-4 btn-ghost justify-center border-border-strong"
      >
        <SlidersHorizontal size={18} />
        تصفية النتائج
      </button>

      {/* Sidebar Container */}
      <div
        className={`
        fixed inset-y-0 start-0 z-50 w-[280px] bg-white dark:bg-gray-900 border-e border-gray-200 dark:border-gray-800 shadow-2xl transform transition-transform duration-300 md:relative md:w-full md:border-none md:shadow-none md:translate-x-0 md:bg-transparent
        ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}
      >
        <div className="h-full overflow-y-auto p-5 md:p-0">
          <div className="flex items-center justify-between mb-6 md:hidden">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Filter size={20} />
              الفلاتر
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-text-muted hover:text-text-primary rounded-full hover:bg-bg-elevated"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Search Box */}
            <div>
              <label className="block text-sm font-semibold mb-2">بحث بالاسم</label>
              <div className="relative">
                <Search
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                  size={16}
                />
                <input
                  type="text"
                  className="input-base pr-9"
                  placeholder="اسم البرنامج..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <hr className="border-border" />

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-semibold mb-2">ترتيب حسب</label>
              <select
                className="input-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                value={currentSort}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
              >
                {SORT_OPTIONS.map((sort) => (
                  <option key={sort.id} value={sort.id}>
                    {sort.label}
                  </option>
                ))}
              </select>
            </div>

            <hr className="border-border" />

            {/* City Filter */}
            <div>
              <label className="block text-sm font-semibold mb-2">المدينة</label>
              <select
                className="input-base bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                value={currentCity}
                onChange={(e) => handleFilterChange("city", e.target.value)}
              >
                <option value="">كل المدن</option>
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <hr className="border-border" />

            {/* Degree Level Filter */}
            <div>
              <label className="block text-sm font-semibold mb-3">الدرجة العلمية</label>
              <div className="space-y-2">
                {DEGREE_LEVELS.map((level) => (
                  <label key={level.id} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="degreeLevel"
                        value={level.id}
                        checked={currentLevel === level.id}
                        onChange={(e) => handleFilterChange("level", e.target.value)}
                        className="peer appearance-none w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full checked:border-blue-600 checked:border-[6px] transition-all bg-white dark:bg-gray-900"
                      />
                    </div>
                    <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                      {level.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="border-border" />

            {/* Study Type Filter */}
            <div>
              <label className="block text-sm font-semibold mb-3">نوع الدراسة</label>
              <div className="space-y-2">
                {STUDY_TYPES.map((type) => (
                  <label key={type.id} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="studyType"
                        value={type.id}
                        checked={currentStudyType === type.id}
                        onChange={(e) => handleFilterChange("study_type", e.target.value)}
                        className="peer appearance-none w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full checked:border-blue-600 checked:border-[6px] transition-all bg-white dark:bg-gray-900"
                      />
                    </div>
                    <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                      {type.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
