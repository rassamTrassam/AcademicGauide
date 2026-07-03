// @ts-nocheck
import Link from "next/link";
import { User, Heart, Star, Settings, MessageSquare, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/profile");
  }

  // Allow only regular users/students
  // Default to student if role is null/undefined (e.g. old OAuth users)
  const role = user.user_metadata?.role;
  if (role && role !== "student") {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("full_name")
    .eq("id", user.id)
    .single<{ full_name: string | null }>();

  const displayName = profile?.full_name || user.user_metadata?.name || "طالب";

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-bg-elevated/50">
      {/* Sidebar */}
      <aside className="w-64 bg-bg-surface border-e border-border hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="font-bold text-lg text-text-primary mb-1">حسابي</h2>
          <p className="text-xs text-text-muted truncate">
            {displayName}
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-bg-elevated hover:text-text-primary text-text-secondary transition-colors"
          >
            <User size={18} />
            نظرة عامة
          </Link>
          <Link
            href="/profile/messages"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
          >
            <MessageSquare size={18} />
            المراسلات
          </Link>
          <Link
            href="/profile/favorites"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
          >
            <Heart size={18} />
            المفضلة
          </Link>
          <Link
            href="/profile/reviews"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
          >
            <Star size={18} />
            تقييماتي
          </Link>
          <Link
            href="/profile/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors"
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
