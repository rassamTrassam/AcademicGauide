// @ts-nocheck
import type { Metadata } from "next";
import { Clock, CheckCircle, Mail, Phone, Building, ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import RealtimeApprovalListener from "./RealtimeApprovalListener";

export const metadata: Metadata = {
  title: "طلبك قيد المراجعة | دليل الأكاديمي اليمني",
  description: "طلب تسجيل مؤسستك التعليمية قيد المراجعة من فريق الدليل الأكاديمي.",
};

export default async function PendingApprovalPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Check current approval status
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("approval_status")
    .eq("id", session.user.id)
    .single();

  if (profile?.approval_status === "approved") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 animate-fade-up">
      <RealtimeApprovalListener userId={session.user.id} />
      <div className="w-full max-w-xl">

        {/* Main Card */}
        <div className="card p-10 text-center relative overflow-hidden">

          {/* Decorative background blobs */}
          <div
            aria-hidden="true"
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-[0.06] pointer-events-none"
            style={{ background: "radial-gradient(circle, var(--brand-500), transparent 70%)" }}
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full opacity-[0.06] pointer-events-none"
            style={{ background: "radial-gradient(circle, #8b5cf6, transparent 70%)" }}
          />

          {/* Icon */}
          <div className="relative inline-flex items-center justify-center mb-6">
            {/* Outer pulsing ring */}
            <span
              className="absolute inset-0 rounded-full animate-ping opacity-20"
              style={{ background: "var(--brand-500)" }}
            />
            <div className="relative w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, var(--brand-500), #8b5cf6)" }}
            >
              <Clock size={44} className="text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-black text-text-primary mb-3">
            طلبك قيد المراجعة
          </h1>
          <p className="text-text-secondary text-base leading-relaxed mb-8 max-w-sm mx-auto">
            شكراً لتقديمك طلب تسجيل مؤسستك التعليمية في <strong className="text-text-primary">دليل الأكاديمي اليمني</strong>.
            سيقوم فريقنا بمراجعة بياناتك والتحقق منها في أقرب وقت ممكن.
          </p>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-right">
            {[
              { icon: <CheckCircle size={18} className="text-green-500" />, title: "تم استلام الطلب", desc: "وصل طلبك بنجاح", done: true },
              { icon: <Clock size={18} className="text-amber-500" />, title: "قيد المراجعة", desc: "يراجعه فريقنا الآن", done: false },
              { icon: <Building size={18} className="text-text-muted" />, title: "تفعيل الحساب", desc: "ستصلك رسالة تأكيد", done: false },
            ].map((step, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border ${
                  step.done
                    ? "border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-900/10"
                    : i === 1
                    ? "border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/10"
                    : "border-border bg-bg-elevated/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {step.icon}
                  <span className="font-bold text-sm text-text-primary">{step.title}</span>
                </div>
                <p className="text-xs text-text-muted">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-border mb-8" />

          {/* Contact Section */}
          <div className="text-right">
            <p className="text-sm font-bold text-text-primary mb-4">
              للتواصل مع المطورين لتسريع الاعتماد:
            </p>
            <div className="space-y-3">
              <a
                href="tel:+967736288846"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-elevated transition-colors group"
                id="contact-phone-1"
              >
                <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                  <Phone size={16} className="text-green-600" />
                </div>
                <span className="font-semibold text-text-primary text-sm" dir="ltr">
                  +967 736 288 846
                </span>
              </a>

              <a
                href="tel:+967713801592"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-elevated transition-colors group"
                id="contact-phone-2"
              >
                <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                  <Phone size={16} className="text-green-600" />
                </div>
                <span className="font-semibold text-text-primary text-sm" dir="ltr">
                  +967 713 801 592
                </span>
              </a>

              <a
                href="mailto:academic.guide.yemen@gmail.com"
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-bg-elevated transition-colors group"
                id="contact-email"
              >
                <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-200 dark:group-hover:bg-brand-900/50 transition-colors">
                  <Mail size={16} className="text-brand-600" />
                </div>
                <span className="font-semibold text-text-primary text-sm" dir="ltr">
                  academic.guide.yemen@gmail.com
                </span>
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border my-8" />

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/"
              className="btn-ghost flex items-center gap-2 w-full sm:w-auto justify-center"
              id="back-to-home-btn"
            >
              <ArrowLeft size={16} />
              تصفح البرامج
            </Link>
            <div className="flex items-center gap-2 text-text-muted text-sm">
              <BookOpen size={14} />
              <span>يمكنك الاستمرار في تصفح المنصة حتى الموافقة</span>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-text-muted mt-6 leading-relaxed">
          في حال عدم تلقيك أي رد خلال 48 ساعة، يرجى التواصل معنا عبر الأرقام أعلاه.
          <br />
          دليل الأكاديمي اليمني — منصة تعليمية مستقلة لخدمة الطلاب.
        </p>
      </div>
    </div>
  );
}
