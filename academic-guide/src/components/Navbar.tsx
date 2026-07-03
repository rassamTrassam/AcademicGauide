"use client";

import Link from "next/link";
import { Moon, Sun, Menu, Search, User, BookOpen, LogOut, LayoutDashboard, X, Home, Building2, Mail, Heart, Settings, MessageSquare } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/utils/supabase/client";
import { signOutAction } from "@/app/actions/auth";

import { useRouter } from "next/navigation";

interface NavbarProps {
  initialUser?: any;
}

export function Navbar({ initialUser = null }: NavbarProps) {
  const { isDarkMode, toggleDarkMode } = useAppStore();
  const [user, setUser] = useState<any>(initialUser);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    startTransition(async () => {
      await signOutAction();
      await supabase.auth.signOut(); // Ensure client clears state
      setIsDropdownOpen(false);
      setIsMobileMenuOpen(false);
      router.refresh();
      router.push("/");
    });
  };

  const role = user?.user_metadata?.role;
  const name = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "مستخدم";

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-bg-surface/80 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-text-secondary hover:text-text-primary"
              onClick={() => setIsMobileMenuOpen(true)}
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
                    <div className="fixed inset-0 z-40 hidden md:block" onClick={() => setIsDropdownOpen(false)}></div>
                    <div className="absolute end-0 top-full mt-2 w-48 bg-bg-surface border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-fade-up hidden md:block" style={{animationDuration: '0.2s'}}>
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
              <Link href="/login" className="btn-primary hidden md:inline-flex">
                تسجيل الدخول
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden flex">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          {/* Drawer */}
          <div className="relative w-4/5 max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-slide-in-right border-s border-border">
            
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="bg-brand-100 text-brand-700 p-2 rounded-lg">
                  <BookOpen size={20} />
                </div>
                <span className="font-bold text-lg text-gray-900 dark:text-white">دليل الأكاديمي</span>
              </Link>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6">
              
              {/* General Links */}
              <div className="space-y-1">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium">
                  <Home size={18} className="text-gray-400" />
                  الرئيسية
                </Link>
                <Link href="/programs" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium">
                  <BookOpen size={18} className="text-gray-400" />
                  البرامج والتخصصات
                </Link>
                <Link href="/institutions" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium">
                  <Building2 size={18} className="text-gray-400" />
                  الجامعات والمؤسسات
                </Link>
                <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium">
                  <Mail size={18} className="text-gray-400" />
                  تواصل معنا
                </Link>
              </div>

              {/* User Section */}
              <div className="border-t border-border pt-6">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-4 mb-2">
                      <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 flex items-center justify-center font-bold text-lg">
                        {name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {role === "super_admin" && (
                        <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors font-bold">
                          <LayoutDashboard size={18} />
                          إدارة النظام
                        </Link>
                      )}
                      {role === "org_admin" && (
                        <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium">
                          <LayoutDashboard size={18} />
                          لوحة التحكم
                        </Link>
                      )}
                      {(role === "student" || !role) && (
                        <>
                          <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium">
                            <User size={18} className="text-gray-400" />
                            الملف الشخصي
                          </Link>
                          <Link href="/profile/messages" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium">
                            <MessageSquare size={18} className="text-gray-400" />
                            المراسلات
                          </Link>
                          <Link href="/profile/favorites" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium">
                            <Heart size={18} className="text-gray-400" />
                            المفضلة
                          </Link>
                          <Link href="/profile/settings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium">
                            <Settings size={18} className="text-gray-400" />
                            الإعدادات
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="px-4 space-y-3">
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="btn-primary w-full justify-center py-3">
                      تسجيل الدخول
                    </Link>
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="btn-secondary w-full justify-center py-3">
                      إنشاء حساب
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Logout */}
            {user && (
              <div className="p-4 border-t border-border">
                <button 
                  onClick={handleLogout}
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 font-bold transition-colors disabled:opacity-50"
                >
                  <LogOut size={18} />
                  {isPending ? "جاري الخروج..." : "تسجيل الخروج"}
                </button>
              </div>
            )}
            
          </div>
        </div>
      )}
    </>
  );
}
