"use client";

import { useCompareStore } from "@/store/useCompareStore";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Scale, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getSmartCoverImage } from "@/utils/imageHelpers";

export function FloatingCompareDock() {
  const { compareIds, clearCompare } = useCompareStore();
  const [mounted, setMounted] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchComparePrograms() {
      if (compareIds.length === 0) {
        setPrograms([]);
        return;
      }
      const supabase = createClient();
      const { data } = await supabase
        .from("programs")
        .select("id, title_ar, cover_image_url")
        .in("id", compareIds);

      if (data) {
        setPrograms(data);
      }
    }

    if (mounted) {
      fetchComparePrograms();
    }
  }, [compareIds, mounted]);

  if (!mounted || compareIds.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border border-gray-200 dark:border-gray-700 shadow-2xl rounded-full p-2 flex items-center gap-4">
        
        {/* Avatars */}
        <div className="flex items-center ms-2 -space-x-3 space-x-reverse">
          {programs.map((prog, i) => (
            <div key={prog.id} className="relative w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden bg-gray-100 z-10" style={{ zIndex: 10 - i }}>
              <Image 
                src={prog.cover_image_url || getSmartCoverImage(prog.title_ar)}
                alt={prog.title_ar}
                fill
                className="object-cover"
              />
            </div>
          ))}
          {/* Empty Slots */}
          {Array.from({ length: Math.max(0, 3 - programs.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-center z-0 border-dashed">
              <span className="text-gray-400 text-xs">+</span>
            </div>
          ))}
        </div>

        <div className="hidden sm:block text-sm font-semibold text-gray-700 dark:text-gray-200">
          {programs.length} من 3 برامج
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link 
            href="/compare"
            className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-colors shadow-lg shadow-brand-500/30"
          >
            <Scale size={16} />
            قارن الآن
          </Link>
          <button 
            onClick={() => clearCompare()}
            className="p-2 text-gray-400 hover:text-red-500 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
            title="إلغاء المقارنة"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
