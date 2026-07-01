"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isDarkMode } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [isDarkMode, mounted]);

  // To prevent hydration mismatch, we don't render until mounted, 
  // or we render a div that has the same initial class.
  // We'll just render children but the class won't be applied on the server.
  // A slight flash might occur on initial load if dark mode is cached, 
  // but it's acceptable for now without a complex script tag injection.
  
  return <>{children}</>;
}
