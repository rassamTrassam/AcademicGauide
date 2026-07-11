"use client";

import { useEffect, useState } from "react";
import { getPendingApprovals, updateApprovalStatus, getSignedDocUrl } from "@/app/actions/admin";
import { Check, X, FileText, ExternalLink, AlertCircle } from "lucide-react";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [docError, setDocError] = useState<string | null>(null);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    setLoading(true);
    const data = await getPendingApprovals();
    setApprovals(data);
    setLoading(false);
  };

  const handleUpdate = async (id: string, status: "approved" | "rejected") => {
    if (!confirm(`هل أنت متأكد من ${status === "approved" ? "قبول" : "رفض"} هذا الطلب؟`)) return;
    
    setApprovals(prev => prev.filter(p => p.id !== id));
    await updateApprovalStatus(id, status);
  };

  const [docUrl, setDocUrl] = useState<{ url: string; label: string } | null>(null);

  const handleViewDoc = async (path: string | null, docLabel: string) => {
    setDocError(null);
    setDocUrl(null);

    if (!path) {
      setDocError(`لم يتم رفع ${docLabel} من قِبل المستخدم.`);
      return;
    }

    const result = await getSignedDocUrl(path);

    if (result.url) {
      // Store URL in state first (for fallback display)
      setDocUrl({ url: result.url, label: docLabel });

      // Try to open via <a> element — this bypasses popup blockers
      try {
        const a = document.createElement("a");
        a.href = result.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch {
        // Fallback: URL is already in state as a clickable link
      }
    } else {
      setDocError(`فشل في عرض ${docLabel}: ${result.error || "خطأ غير معروف"} — المسار: ${path}`);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-text-muted">جاري تحميل الطلبات...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">طلبات التسجيل المعلقة</h1>
        <p className="text-text-secondary mt-1">مراجعة واعتماد حسابات مدراء الجهات التعليمية</p>
      </div>

      {docError && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-xl text-red-700 dark:text-red-400 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">خطأ في عرض الوثيقة</p>
            <p className="mt-0.5 font-mono text-xs break-all">{docError}</p>
          </div>
          <button onClick={() => setDocError(null)} className="mr-auto text-red-400 hover:text-red-600 text-lg leading-none">×</button>
        </div>
      )}

      {docUrl && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-xl text-sm">
          <FileText size={18} className="text-blue-500 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-blue-700 dark:text-blue-400">تم إنشاء رابط {docUrl.label}</p>
            <p className="text-text-muted text-xs mt-0.5">إذا لم تفتح النافذة تلقائياً، انقر على الرابط أدناه:</p>
          </div>
          <a
            href={docUrl.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white shrink-0"
            onClick={() => setDocUrl(null)}
          >
            <ExternalLink size={14} />
            فتح الوثيقة
          </a>
          <button onClick={() => setDocUrl(null)} className="text-text-muted hover:text-text-primary text-lg leading-none">×</button>
        </div>
      )}

      {approvals.length === 0 ? (
        <div className="card p-12 text-center text-text-muted">
          لا توجد طلبات معلقة حالياً.
        </div>
      ) : (
        <div className="grid gap-6">
          {approvals.map((req) => (
            <div key={req.id} className="card p-6 flex flex-col md:flex-row gap-6 justify-between">
              <div className="space-y-4 flex-1">
                <div>
                  <h3 className="font-bold text-lg text-brand-600">{req.institution_name_request}</h3>
                  <div className="text-sm font-semibold text-text-secondary mt-1">المسؤول: {req.full_name_4_parts || req.full_name}</div>
                  <div className="text-sm text-text-muted">المسمى الوظيفي: {req.job_title}</div>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm bg-bg-surface p-4 rounded-xl border border-border">
                  <div>
                    <span className="text-text-muted block text-xs">التواصل الشخصي</span>
                    <span className="font-medium">{req.personal_contact}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-xs">تواصل الجهة</span>
                    <span className="font-medium">{req.institution_contact}</span>
                  </div>
                </div>

                <div className="flex gap-3 flex-wrap">
                  <button 
                    onClick={() => handleViewDoc(req.id_image_url, "هوية المسؤول")}
                    className={`btn-ghost py-2 text-sm border ${
                      req.id_image_url 
                        ? "border-brand-400 text-brand-600 hover:bg-brand-50" 
                        : "border-border text-text-muted opacity-60"
                    }`}
                  >
                    <FileText size={16} />
                    هوية المسؤول
                    {req.id_image_url && <ExternalLink size={14} className="ms-1" />}
                  </button>
                  <button 
                    onClick={() => handleViewDoc(req.auth_letter_image_url, "خطاب التفويض")}
                    className={`btn-ghost py-2 text-sm border ${
                      req.auth_letter_image_url 
                        ? "border-brand-400 text-brand-600 hover:bg-brand-50" 
                        : "border-border text-text-muted opacity-60"
                    }`}
                  >
                    <FileText size={16} />
                    خطاب التفويض
                    {req.auth_letter_image_url && <ExternalLink size={14} className="ms-1" />}
                  </button>
                  {req.work_id_image_url && (
                    <button 
                      onClick={() => handleViewDoc(req.work_id_image_url, "بطاقة العمل")}
                      className="btn-ghost py-2 text-sm border border-brand-400 text-brand-600 hover:bg-brand-50"
                    >
                      <FileText size={16} />
                      بطاقة العمل
                      <ExternalLink size={14} className="ms-1" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex md:flex-col gap-3 justify-center shrink-0">
                <button 
                  onClick={() => handleUpdate(req.id, "approved")}
                  className="btn-primary bg-green-500 hover:bg-green-600 border-none px-6"
                >
                  <Check size={18} /> قبول الطلب
                </button>
                <button 
                  onClick={() => handleUpdate(req.id, "rejected")}
                  className="btn-ghost bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/40 border-none px-6"
                >
                  <X size={18} /> رفض الطلب
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
