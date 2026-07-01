"use client";

import { useState } from "react";
import { User, Shield } from "lucide-react";
import UserAccessModal from "./UserAccessModal";

interface UsersTableClientProps {
  users: Record<string, any>[];
  institutions: Record<string, any>[];
}

export default function UsersTableClient({ users, institutions }: UsersTableClientProps) {
  const [selectedUser, setSelectedUser] = useState<any>(null);

  return (
    <>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="bg-bg-elevated/50 text-text-muted text-sm border-b border-border">
                <th className="font-semibold py-4 px-6 text-start">المستخدم</th>
                <th className="font-semibold py-4 px-6 text-start">البريد الإلكتروني</th>
                <th className="font-semibold py-4 px-6 text-start">الدور</th>
                <th className="font-semibold py-4 px-6 text-start">المدينة</th>
                <th className="font-semibold py-4 px-6 text-start">تاريخ الانضمام</th>
                <th className="font-semibold py-4 px-6 text-start">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    لا يوجد مستخدمين حالياً.
                  </td>
                </tr>
              ) : (
                users.map((user: any) => {
                  // Fallbacks for display
                  const isOrg = user.institution_id || user.institution_name_request;
                  // If we don't have the auth.users role directly, we guess it. 
                  // But we will have an 'email' column and a 'role' column when synced.
                  // For now, if they have an institution_id they act as org_admin.
                  let roleDisplay = "طالب";
                  let roleClass = "badge badge-purple";
                  
                  if (user.role === "super_admin") {
                    roleDisplay = "مشرف عام";
                    roleClass = "badge bg-red-100 text-red-700";
                  } else if (user.role === "org_admin" || user.institution_id || user.institution_name_request) {
                    roleDisplay = user.approval_status === "pending" ? "جهة تعليمية (معلق)" : "جهة تعليمية";
                    roleClass = user.approval_status === "pending" ? "badge bg-orange-100 text-orange-600" : "badge-blue";
                  }

                  return (
                    <tr key={user.id} className="border-b border-border/50 last:border-0 hover:bg-bg-elevated/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/20 text-brand-600 flex items-center justify-center shrink-0">
                            {user.full_name ? user.full_name.charAt(0).toUpperCase() : <User size={20} />}
                          </div>
                          <div className="font-semibold text-text-primary">{user.full_name || "مستخدم جديد"}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-text-secondary" dir="ltr">
                        {user.email || "-"}
                      </td>
                      <td className="py-4 px-6">
                        <span className={roleClass}>
                          {roleDisplay}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-text-secondary">{user.city || "غير محدد"}</td>
                      <td className="py-4 px-6 text-text-secondary">
                        {new Date(user.created_at).toLocaleDateString('ar-YE')}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors"
                        >
                          <Shield size={16} />
                          إدارة الصلاحيات
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <UserAccessModal 
          user={selectedUser} 
          institutions={institutions} 
          onClose={() => setSelectedUser(null)} 
        />
      )}
    </>
  );
}
