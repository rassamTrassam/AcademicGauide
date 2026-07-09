"use client";

import { useState } from "react";
import { Shield, X, Save } from "lucide-react";
import { updateUserAccess } from "@/app/actions/admin-users";

interface UserAccessModalProps {
  user: any;
  institutions: any[];
  onClose: () => void;
}

export default function UserAccessModal({ user, institutions, onClose }: UserAccessModalProps) {
  // Determine current role based on user metadata or defaults
  // In a real app we'd fetch this from auth.users or a synced column.
  // For now, we use a basic heuristic if role isn't explicitly passed.
  const [role, setRole] = useState(user.role || (user.institution_name_request ? "org_admin" : "student"));
  const [institutionId, setInstitutionId] = useState(user.institution_id || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    
    if (role === "org_admin" && !institutionId) {
      setError("يرجى اختيار جهة تعليمية أولاً");
      return;
    }

    setLoading(true);
    const result = await updateUserAccess(user.id, role, role === "org_admin" ? institutionId : null);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(result.message || "تم الحفظ بنجاح");
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
        
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Shield size={24} className="text-brand-500" />
            إدارة صلاحيات المستخدم
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-semibold border border-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm font-semibold border border-green-200">
              {success}
            </div>
          )}

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">اسم المستخدم</p>
            <p className="font-bold text-gray-900 dark:text-gray-100">{user.full_name}</p>
            {user.email && <p className="text-sm text-gray-600 dark:text-gray-400" dir="ltr">{user.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">الدور / الصلاحية</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl p-3"
            >
              <option value="student">طالب (صلاحيات عادية)</option>
              <option value="org_admin">مسؤول جهة تعليمية</option>
              <option value="super_admin">مدير النظام</option>
            </select>
          </div>

          {role === "org_admin" && (
            <div className="animate-fade-in">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">ربط بجهة تعليمية</label>
              <select
                value={institutionId}
                onChange={(e) => setInstitutionId(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl p-3"
              >
                <option value="">-- اختر الجهة التعليمية --</option>
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.name_ar}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                سيتيح ذلك للمستخدم إدارة برامج هذه الجهة التعليمية والرد على المراسلات.
              </p>
            </div>
          )}

          {role === "super_admin" && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 p-4 rounded-xl text-sm">
              <p className="font-bold text-red-700 dark:text-red-400 mb-1">⚠️ تحذير أمني</p>
              <p className="text-red-600 dark:text-red-400">إعطاء صلاحية "مدير النظام" يمنح المستخدم تحكماً كاملاً بالنظام بدون قيود. سيتم تلقائياً إلغاء ربطه بأي جهة تعليمية.</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 flex gap-3">
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="btn-primary flex-1 py-3"
          >
            {loading ? "جاري الحفظ..." : (
              <>
                <Save size={18} className="ml-2" />
                حفظ الصلاحيات
              </>
            )}
          </button>
          <button onClick={onClose} className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-700 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            إلغاء
          </button>
        </div>

      </div>
    </div>
  );
}
