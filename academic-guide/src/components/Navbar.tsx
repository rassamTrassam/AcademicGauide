"use client";

import Link from "next/link";
import { Moon, Sun, Menu, Search, User, BookOpen, LogOut, LayoutDashboard } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/utils/supabase/client";
import { signOutAction } from "@/app/actions/auth";

import { useRouter } from "next/navigation";

interface NavbarProps {
  initialUser?: any;
}

export function Navbar({ initialUser = null }: NavbarProps) {
  const { isDarkMode, toggleDarkMode, toggleMobileSidebar } = useAppStore();
  const [user, setUser] = useState<any>(initialUser);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();
  const router = useRouter();

  // Sync state if server user changes (e.g. after login/logout + router.refresh)
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = () => {
    startTransition(async () => {
      await signOutAction();
      await supabase.auth.signOut(); // Ensure client clears state
      setIsDropdownOpen(false);
      router.refresh();
      router.push("/");
    });
  };

  const role = user?.user_metadata?.role;
  const name = user?.user_metadata?.name || "مستخدم";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-bg-surface/80 backdrop-blur">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden p-2 text-text-secondary hover:text-text-primary"
            onClick={toggleMobileSidebar}
            aria-label="القائمة"
          >
            <Menu size={24} />
          </button>
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-brand-100 text-brand-700 p-2 rounded-lg group-hover:bg-brand-600 group-hover:text-white transition-colors">
              <BookOpen size={24} />
            </div>
            <span className="font-bold text-xl hidden sm:inline-block">دليل الأكاديمي</span>
          </Link>
        </div>

        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <form action="/programs" className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              name="q"
              type="search" 
              placeholder="ابحث عن جامعة، تخصص، أو برنامج..." 
              className="input-base pr-10"
            />
          </form>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={toggleDarkMode} 
            className="p-2 rounded-full hover:bg-bg-elevated text-text-secondary transition-colors"
            aria-label="تبديل الوضع الليلي"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 btn-ghost py-2"
              >
                <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs">
                  {name.charAt(0)}
                </div>
                <span className="hidden sm:inline font-semibold">{name.split(" ")[0]}</span>
              </button>

              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                  <div className="absolute end-0 top-full mt-2 w-48 bg-bg-surface border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-fade-up" style={{animationDuration: '0.2s'}}>
                    {role === "super_admin" && (
                      <Link 
                        href="/admin" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-brand-600 hover:bg-brand-50 transition-colors border-b border-border/50 font-bold"
                      >
                        <LayoutDashboard size={16} />
                        إدارة النظام
                      </Link>
                    )}
                    {role === "org_admin" && (
                      <Link 
                        href="/dashboard" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-text-primary hover:bg-bg-elevated transition-colors border-b border-border/50"
                      >
                        <LayoutDashboard size={16} />
                        لوحة التحكم
                      </Link>
                    )}
                    {(role === "student" || !role) && (
                      <Link 
                        href="/profile" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-text-primary hover:bg-bg-elevated transition-colors border-b border-border/50"
                      >
                        <User size={16} />
                        حسابي
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      disabled={isPending}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-start disabled:opacity-50"
                    >
                      <LogOut size={16} />
                      {isPending ? "جاري الخروج..." : "تسجيل الخروج"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn-primary">
              تسجيل الدخول
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
