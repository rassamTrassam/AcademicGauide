"use client";

import { Scale } from "lucide-react";
import { useCompareStore } from "@/store/useCompareStore";
import { useEffect, useState } from "react";

export function CompareButton({ programId, variant = "icon" }: { programId: string; variant?: "icon" | "button" }) {
  const { compareIds, toggleCompare } = useCompareStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return variant === "icon" ? (
      <button disabled className="p-1 text-gray-400">
        <Scale size={16} />
      </button>
    ) : (
      <button disabled className="btn-ghost py-3 justify-center opacity-50">
        <Scale size={20} />
        أضف للمقارنة
      </button>
    );
  }

  const isSelected = compareIds.includes(programId);
  const isMaxReached = !isSelected && compareIds.length >= 3;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleCompare(programId);
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        disabled={isMaxReached}
        title={isSelected ? "إزالة من المقارنة" : isMaxReached ? "الحد الأقصى للمقارنة هو 3" : "أضف للمقارنة"}
        className={`p-1 flex items-center transition-colors ${
          isSelected ? "text-brand-600" : isMaxReached ? "text-gray-300 dark:text-gray-700 cursor-not-allowed" : "text-gray-400 hover:text-brand-500"
        }`}
      >
        <Scale size={16} />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isMaxReached}
      className={`btn-ghost w-full justify-center py-3 ${
        isSelected ? "text-brand-600 bg-brand-50 dark:bg-brand-900/20" : isMaxReached ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <Scale size={20} />
      {isSelected ? "تمت الإضافة للمقارنة" : isMaxReached ? "المقارنة ممتلئة (3/3)" : "أضف للمقارنة"}
    </button>
  );
}
