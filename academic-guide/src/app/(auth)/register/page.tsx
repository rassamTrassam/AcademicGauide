"use client";

import {
  UserPlus, BookOpen, Mail, Lock, User, Loader2, Building,
  Phone, Briefcase, ImageIcon, FileText, Upload, CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, useRef, ChangeEvent } from "react";
import { signUpAction, getGoogleOAuthUrl } from "@/app/actions/auth";

// ── File Upload Field Component ────────────────────────────────────────────────
interface FileUploadFieldProps {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
  disabled?: boolean;
}

function FileUploadField({ id, name, label, required, hint, disabled }: FileUploadFieldProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : null);
  };

  return (
    <div>
      <label className="block text-sm font-semibold mb-2 text-text-primary" htmlFor={id}>
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
        {!required && <span className="text-text-muted text-xs mr-1">(اختياري)</span>}
      </label>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        className={`relative flex items-center gap-3 p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all
          ${fileName
            ? "border-green-400 bg-green-50 dark:bg-green-900/10"
            : "border-border-strong hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/10"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        <div className={`p-2 rounded-lg ${fileName ? "bg-green-100 text-green-600" : "bg-brand-100 text-brand-600"}`}>
          {fileName ? <CheckCircle size={20} /> : <Upload size={20} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">
            {fileName || "انقر لرفع الصورة أو PDF"}
          </p>
          {hint && !fileName && (
            <p className="text-xs text-text-muted mt-0.5">{hint}</p>
          )}
        </div>
        <ImageIcon size={16} className="text-text-muted flex-shrink-0" />
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
          required={required}
          className="sr-only"
          onChange={handleChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

// ── Main Register Page ─────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "org_admin">("student");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isOAuthPending, setIsOAuthPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const isLoading = isPending || isOAuthPending;

  // ── Google OAuth ─────────────────────────────────────────────────────────
  const handleGoogleRegister = async () => {
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
      }
    } catch {
      setError("فشل الاتصال بخدمة Google، يرجى المحاولة مرة أخرى");
      setIsOAuthPending(false);
    }
  };

  // ── Email/Password + File Submission ─────────────────────────────────────
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Use the actual form element (includes file inputs)
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await signUpAction(formData);
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        if (result.message) setSuccessMsg(result.message);
        router.push(result.redirectTo || "/");
        router.refresh();
      }
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fade-up py-12">
      <div className="card w-full max-w-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/40 text-brand-600 mb-4">
            <UserPlus size={32} />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">إنشاء حساب جديد</h1>
          <p className="text-text-secondary mt-2">
            {role === "student"
              ? "انضم إلى مجتمع الدليل الأكاديمي اليمني"
              : "سجّل مؤسستك التعليمية في المنصة"}
          </p>
        </div>

        {/* Role Tabs */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-3 text-text-primary">نوع الحساب</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              id="tab-student"
              onClick={() => { setRole("student"); setError(null); }}
              className={`flex flex-col items-center justify-center gap-2 p-3 border-2 rounded-xl transition-all font-semibold text-sm ${
                role === "student"
                  ? "border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400"
                  : "border-border-strong text-text-secondary hover:border-brand-400"
              }`}
            >
              <User size={22} />
              طالب
            </button>
            <button
              type="button"
              id="tab-org-admin"
              onClick={() => { setRole("org_admin"); setError(null); }}
              className={`flex flex-col items-center justify-center gap-2 p-3 border-2 rounded-xl transition-all font-semibold text-sm ${
                role === "org_admin"
                  ? "border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400"
                  : "border-border-strong text-text-secondary hover:border-brand-400"
              }`}
            >
              <Building size={22} />
              جهة تعليمية
            </button>
          </div>
        </div>

        {/* Org_Admin info banner */}
        {role === "org_admin" && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-700/40 rounded-xl">
            <p className="text-sm text-amber-800 dark:text-amber-300 font-semibold">
              📋 سيتم مراجعة طلبك من قِبل فريق الدليل الأكاديمي قبل تفعيل الوصول الكامل إلى لوحة التحكم.
            </p>
          </div>
        )}

        {/* Error / Success */}
        {error && (
          <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl text-red-600 dark:text-red-400 text-sm font-semibold">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-5 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl text-green-700 dark:text-green-400 text-sm font-semibold">
            {successMsg}
          </div>
        )}

        {/* ── STUDENT SECTION ── */}
        {role === "student" && (
          <>
            {/* Google OAuth */}
            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={isLoading}
              id="google-register-btn"
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
              {isOAuthPending ? "جاري الاتصال بـ Google..." : "التسجيل بـ Google"}
            </button>

            <div className="relative flex items-center gap-4 mb-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-muted font-medium">أو عبر البريد الإلكتروني</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          </>
        )}

        {/* ── SHARED FORM ── */}
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          <input type="hidden" name="role" value={role} />

          {/* Display Name (both roles) */}
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="reg-name">
              {role === "org_admin" ? "اسم الحساب / اسم المسؤول" : "الاسم الكامل"}
              <span className="text-red-500 mr-1">*</span>
            </label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={18} />
              <input
                id="reg-name"
                name="name"
                type="text"
                required
                className="input-base pr-10"
                placeholder={role === "org_admin" ? "جامعة تعز — قسم القبول" : "أحمد محمد"}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* ── Org_Admin exclusive fields ── */}
          {role === "org_admin" && (
            <>
              {/* Full Name (4 parts) */}
              <div>
                <label className="block text-sm font-semibold mb-2" htmlFor="full-name-4-parts">
                  الاسم الرباعي الكامل <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={18} />
                  <input
                    id="full-name-4-parts"
                    name="full_name_4_parts"
                    type="text"
                    required
                    className="input-base pr-10"
                    placeholder="أحمد محمد علي الصالح"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Institution Name */}
              <div>
                <label className="block text-sm font-semibold mb-2" htmlFor="institution-name">
                  اسم الجامعة / المعهد <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <BookOpen className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={18} />
                  <input
                    id="institution-name"
                    name="institution_name_request"
                    type="text"
                    required
                    className="input-base pr-10"
                    placeholder="جامعة تعز"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-sm font-semibold mb-2" htmlFor="job-title">
                  المسمى الوظيفي <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={18} />
                  <input
                    id="job-title"
                    name="job_title"
                    type="text"
                    required
                    className="input-base pr-10"
                    placeholder="رئيس قسم القبول والتسجيل"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Personal Contact */}
              <div>
                <label className="block text-sm font-semibold mb-2" htmlFor="personal-contact">
                  رقم أو إيميل شخصي <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={18} />
                  <input
                    id="personal-contact"
                    name="personal_contact"
                    type="text"
                    required
                    className="input-base pr-10"
                    placeholder="+967 7xxxxxxxx"
                    dir="ltr"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Institution Contact */}
              <div>
                <label className="block text-sm font-semibold mb-2" htmlFor="institution-contact">
                  رقم أو إيميل الجهة التعليمية <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={18} />
                  <input
                    id="institution-contact"
                    name="institution_contact"
                    type="text"
                    required
                    className="input-base pr-10"
                    placeholder="info@university.edu.ye"
                    dir="ltr"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Document Uploads Section */}
              <div className="space-y-3 p-4 bg-bg-elevated/50 rounded-xl border border-border">
                <p className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <FileText size={16} className="text-brand-600" />
                  وثائق التحقق
                </p>

                <FileUploadField
                  id="id-image"
                  name="id_image"
                  label="صورة الهوية الشخصية"
                  required
                  hint="JPG أو PNG أو PDF — حتى 10 ميجابايت"
                  disabled={isLoading}
                />
                <FileUploadField
                  id="work-id-image"
                  name="work_id_image"
                  label="صورة بطاقة العمل"
                  hint="JPG أو PNG أو PDF — حتى 10 ميجابايت"
                  disabled={isLoading}
                />
                <FileUploadField
                  id="auth-letter-image"
                  name="auth_letter_image"
                  label="صورة تصريح / توصية معمدة"
                  hint="JPG أو PNG أو PDF — حتى 10 ميجابايت"
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="reg-email">
              البريد الإلكتروني <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={18} />
              <input
                id="reg-email"
                name="email"
                type="email"
                required
                className="input-base pr-10"
                placeholder={role === "org_admin" ? "admin@university.edu.ye" : "student@example.com"}
                dir="ltr"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="reg-password">
              كلمة المرور <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={18} />
              <input
                id="reg-password"
                name="password"
                type="password"
                required
                minLength={6}
                className="input-base pr-10"
                placeholder="••••••••"
                dir="ltr"
                disabled={isLoading}
              />
            </div>
            <p className="mt-1 text-xs text-text-muted">يجب أن لا تقل عن 6 أحرف</p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="register-submit-btn"
            disabled={isLoading}
            className="btn-primary w-full justify-center py-3 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {role === "org_admin" ? "جاري رفع المستندات وإنشاء الحساب..." : "جاري إنشاء الحساب..."}
              </>
            ) : (
              <>
                <UserPlus size={18} />
                {role === "org_admin" ? "تقديم طلب التسجيل" : "إنشاء حساب"}
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-text-secondary">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="text-brand-600 font-semibold hover:underline">
            سجل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
