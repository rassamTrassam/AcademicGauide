"use client";

import { Star } from "lucide-react";
import { useTransition } from "react";
import { toggleFeaturedStatus } from "@/app/actions/programs";
import { useRouter } from "next/navigation";

interface ToggleFeaturedButtonProps {
  programId: string;
  isFeatured: boolean;
}

export function ToggleFeaturedButton({ programId, isFeatured }: ToggleFeaturedButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = () => {
    startTransition(async () => {
      await toggleFeaturedStatus(programId, !isFeatured);
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={isFeatured ? "إزالة من المميزة" : "تمييز البرنامج"}
      className={`p-2 rounded-full transition-all duration-200 disabled:opacity-50 ${
        isFeatured
          ? "text-yellow-500 hover:text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
          : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/10"
      }`}
    >
      <Star size={18} className={isFeatured ? "fill-yellow-500" : ""} />
    </button>
  );
}
