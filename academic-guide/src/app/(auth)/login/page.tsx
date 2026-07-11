"use client";

import { LogIn, BookOpen, Mail, Lock, Loader2, User, Building } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signInAction, getGoogleOAuthUrl } from "@/app/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "org_admin">("student");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isOAuthPending, setIsOAuthPending] = useState(false);

  // ── Email/Password Login ───────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await signInAction(formData);
      if (result.error) {
        setError(result.error);
      } else {
        router.push(result.redirectTo || "/");
        router.refresh();
      }
    });
  };

  // ── Google OAuth ───────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setIsOAuthPending(true);
    setError(null);
    try {
      const result = await getGoogleOAuthUrl();
      if (result.error) {
        setError(result.error);
        setIsOAuthPending(false);
        return;
      }
      if (result.url) {
        window.location.href = result.url;
        // Don't reset isOAuthPending — browser is navigating away
      }
    } catch {
      setError("فشل الاتصال بخدمة Google، يرجى المحاولة مرة أخرى");
      setIsOAuthPending(false);
    }
  };

  const isLoading = isPending || isOAuthPending;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fade-up">
      <div className="card w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/40 text-brand-600 mb-4">
            <BookOpen size={32} />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">مرحباً بك مجدداً</h1>
          <p className="text-text-secondary mt-2">قم بتسجيل الدخول للاستمرار في الدليل الأكاديمي</p>
        </div>



        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-red-600 dark:text-red-400 text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Google OAuth — Students only */}
        {role === "student" && (
          <>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              id="google-login-btn"
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-border-strong rounded-xl font-semibold text-text-primary hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed mb-4"
            >
              {isOAuthPending ? (
                <Loader2 size={20} className="animate-spin text-brand-600" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {isOAuthPending ? "جاري الاتصال بـ Google..." : "تسجيل الدخول بـ Google"}
            </button>

            {/* Divider */}
            <div className="relative flex items-center gap-4 mb-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-muted font-medium">أو عبر البريد الإلكتروني</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          </>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="hidden" name="role" value={role} />

          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="login-email">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={18} />
              <input
                id="login-email"
                name="email"
                type="email"
                required
                className="input-base pr-10"
                placeholder={role === "org_admin" ? "admin@university.edu.ye" : "student@example.com"}
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold" htmlFor="login-password">
                كلمة المرور
              </label>
              <a href="#" className="text-xs text-brand-600 hover:underline">نسيت كلمة المرور؟</a>
            </div>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={18} />
              <input
                id="login-password"
                name="password"
                type="password"
                required
                className="input-base pr-10"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            disabled={isLoading}
            className="btn-primary w-full justify-center py-3 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
            {isPending ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
          
          {role === "student" && (
            <p className="text-xs text-text-muted mt-4 text-center leading-relaxed">
              ملاحظة: إذا قمت بإنشاء حسابك عبر Google، يرجى الاستمرار بتسجيل الدخول عبر Google، أو تعيين كلمة مرور من إعدادات حسابك أولاً.
            </p>
          )}
        </form>

        <div className="mt-8 text-center text-sm text-text-secondary">
          ليس لديك حساب؟{" "}
          <Link href="/register" className="text-brand-600 font-semibold hover:underline">
            سجل الآن
          </Link>
        </div>
      </div>
    </div>
  );
}
