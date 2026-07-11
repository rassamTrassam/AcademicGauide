"use client";

import { useEffect, useState } from "react";
import { getPendingApprovals, updateApprovalStatus, getSignedDocUrl } from "@/app/actions/admin";
import { Check, X, FileText, ExternalLink } from "lucide-react";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleViewDoc = async (path: string | null, docLabel: string) => {
    if (!path) {
      alert(`لم يتم رفع ${docLabel} من قِبل المستخدم.`);
      return;
    }
    const result = await getSignedDocUrl(path);
    if (result.url) {
      window.open(result.url, "_blank");
    } else {
      alert(`فشل في عرض ${docLabel}.\nالسبب: ${result.error || "خطأ غير معروف"}\nالمسار: ${path}`);
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
