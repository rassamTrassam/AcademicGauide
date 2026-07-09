import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, CheckSquare, Building2, Users, FileText, MessageSquare, HelpCircle } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session || session.user.user_metadata.role !== "super_admin") {
    redirect("/"); // Not a super admin
  }

  const navItems = [
    { name: "الرئيسية", href: "/admin", icon: LayoutDashboard },
    { name: "طلبات التسجيل", href: "/admin/approvals", icon: CheckSquare },
    { name: "المؤسسات التعليمية", href: "/admin/institutions", icon: Building2 },
    { name: "البرامج", href: "/admin/programs", icon: FileText },
    { name: "المستخدمين", href: "/admin/users", icon: Users },
    { name: "طلبات الدعم والتواصل", href: "/admin/contact-messages", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-bg-base flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-bg-surface border-e border-border flex flex-col shrink-0">
        <div className="p-6 border-b border-border">
          <h2 className="font-bold text-xl text-brand-600">لوحة تحكم النظام</h2>
          <p className="text-xs text-text-muted mt-1">مدير النظام (Super Admin)</p>
        </div>
        <nav className="p-4 flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:text-brand-600 hover:bg-brand-50 transition-colors font-medium"
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Admin Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
