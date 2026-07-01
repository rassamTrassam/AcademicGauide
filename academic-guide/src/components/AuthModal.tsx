"use client";

import { useAppStore } from "@/store/useAppStore";
import { X, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal } = useAppStore();

  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={closeAuthModal}
      />
      
      <div className="card w-full max-w-md p-8 relative z-10 animate-fade-up">
        <button 
          onClick={closeAuthModal}
          className="absolute top-4 end-4 p-2 text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-8 mt-2">
          <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/40 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn size={32} />
          </div>
          <h2 className="text-2xl font-bold text-text-primary">تسجيل الدخول مطلوب</h2>
          <p className="text-text-secondary mt-2">يجب عليك تسجيل الدخول أولاً للقيام بهذا الإجراء وحفظ بياناتك.</p>
        </div>

        <div className="space-y-4">
          <Link 
            href="/login" 
            onClick={closeAuthModal}
            className="btn-primary w-full justify-center py-3"
          >
            تسجيل الدخول
          </Link>
          <Link 
            href="/register" 
            onClick={closeAuthModal}
            className="btn-ghost w-full justify-center py-3 border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-400"
          >
            إنشاء حساب جديد <UserPlus size={18} className="ms-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
