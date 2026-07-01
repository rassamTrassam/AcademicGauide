"use client";

import Link from "next/link";
import { Scale, X } from "lucide-react";
import { useCompareStore } from "@/store/useCompareStore";
import { useEffect, useState } from "react";

export function CompareBar() {
  const { compareIds, clearCompare } = useCompareStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || compareIds.length === 0) return null;

  return (
    <div className="fixed bottom-0 start-0 end-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transform animate-fade-up">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 p-2 rounded-lg">
            <Scale size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100">المقارنة ({compareIds.length}/3)</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">لقد قمت بتحديد {compareIds.length} برامج للمقارنة.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={clearCompare}
            className="text-sm font-semibold text-gray-500 hover:text-red-500 transition-colors hidden sm:block"
          >
            مسح الكل
          </button>
          
          <Link href="/compare" className="btn-primary py-2.5 px-6">
            قارن الآن
          </Link>
          
          <button 
            onClick={clearCompare}
            className="p-2 sm:hidden text-gray-400 hover:text-red-500 rounded-full"
            title="مسح الكل"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
