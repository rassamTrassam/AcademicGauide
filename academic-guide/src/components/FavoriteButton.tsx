"use client";

import { Heart } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect, useTransition } from "react";
import { toggleFavorite } from "@/app/actions/interactions";
import { usePathname } from "next/navigation";

export function FavoriteButton({ programId, initialCount = 0, initialIsFavorite = false, variant = "button" }: { programId: string, initialCount?: number, initialIsFavorite?: boolean, variant?: "button" | "icon" }) {
  const { openAuthModal } = useAppStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, [supabase]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      openAuthModal();
      return;
    }

    if (isPending) return;

    // Optimistic update
    const newIsFavorite = !isFavorite;
    setIsFavorite(newIsFavorite);
    setCount(prev => newIsFavorite ? prev + 1 : Math.max(0, prev - 1));

    startTransition(async () => {
      const result = await toggleFavorite(programId, pathname);
      if (result.error) {
        // Revert on error
        setIsFavorite(isFavorite);
        setCount(count);
        alert(result.error);
      } else if (result.isFavorited !== undefined) {
        setIsFavorite(result.isFavorited);
        // We let the optimistic count stay. Real count will sync on refresh.
      }
    });
  };

  if (variant === "icon") {
    return (
      <button 
        onClick={handleFavoriteClick} 
        disabled={isPending}
        className="flex items-center gap-1 hover:text-red-500 transition-colors z-10 relative"
      >
        <Heart size={14} className={isFavorite ? "text-red-500 fill-red-500" : (count > 0 ? "text-red-500 fill-red-500/20" : "")} />
        <span>{count}</span>
      </button>
    );
  }

  return (
    <button 
      onClick={handleFavoriteClick}
      disabled={isPending}
      className={`p-2 backdrop-blur-sm rounded-lg transition-colors flex items-center justify-center ${
        isFavorite 
          ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" 
          : "bg-black/20 text-white hover:bg-black/40"
      }`}
      title={isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
    >
      <Heart size={20} className={isFavorite ? "fill-current" : ""} />
    </button>
  );
}
