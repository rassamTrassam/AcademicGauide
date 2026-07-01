// @ts-nocheck
import Link from "next/link";
import { LayoutDashboard, Users, FileText, Settings, LogOut, MessageSquare } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // ── Auth & Role Guard ──────────────────────────────────────────────────────
  // Middleware handles the primary redirect, but we add a server-component
  // fallback here as a defence-in-depth measure.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  // Only org_admin can access the dashboard
  const role = user.user_metadata?.role;
  if (role !== "org_admin") {
    redirect("/");
  }

  // Block pending or rejected org_admins
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("approval_status, full_name")
    .eq("id", user.id)
    .single<{ approval_status: string; full_name: string | null }>();

  if (profile?.approval_status === "pending" || profile?.approval_status === "rejected") {
    redirect("/pending-approval");
  }

  const displayName = profile?.full_name || user.user_metadata?.name || "مسؤول";

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900/50">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-e border-gray-200 dark:border-gray-800 hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">لوحة التحكم</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {displayName}
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold"
          >
            <LayoutDashboard size={18} />
            الرئيسية
          </Link>
          <Link
            href="/dashboard/programs"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <FileText size={18} />
            إدارة البرامج
          </Link>
          <Link
            href="/dashboard/messages"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <MessageSquare size={18} />
            طلبات المراسلة
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <Settings size={18} />
            الإعدادات
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 mt-auto">
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-start"
            >
              <LogOut size={18} />
              تسجيل خروج
            </button>
          </form>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
