import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart, Star, MessageSquare, BookOpen, ArrowLeft } from "lucide-react";
import { ProgramCard } from "@/components/ProgramCard";

export const dynamic = "force-dynamic";

export default async function ProfileOverviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch some quick stats
  const [favoritesRes, reviewsRes, messagesRes, recentProgramsRes] = await Promise.all([
    supabase.from("favorites").select("program_id", { count: "exact" }).eq("user_id", user.id),
    supabase.from("ratings").select("program_id", { count: "exact" }).eq("user_id", user.id),
    supabase.from("conversations").select("id", { count: "exact" }).eq("student_id", user.id),
    supabase.from("programs").select("*, institutions(name_ar, city)").eq("status", "published").order("created_at", { ascending: false }).limit(3)
  ]);

  const favoritesCount = favoritesRes.count || 0;
  const reviewsCount = reviewsRes.count || 0;
  const conversationsCount = messagesRes.count || 0;
  
  const recentPrograms = (recentProgramsRes.data || []).map(prog => ({
    ...prog,
    institutions: Array.isArray(prog.institutions) ? prog.institutions[0] : prog.institutions
  }));

  return (
    <div className="animate-fade-up">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">نظرة عامة</h1>
        <p className="text-text-secondary mt-1">مرحباً بك في لوحة التحكم الخاصة بك. يمكنك متابعة نشاطك واستكشاف برامج جديدة.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link href="/profile/favorites" className="bg-bg-card border border-border p-5 rounded-2xl flex items-center gap-4 hover:border-brand-500 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Heart size={24} />
          </div>
          <div>
            <p className="text-sm text-text-secondary font-medium">البرامج المفضلة</p>
            <p className="text-2xl font-bold text-text-primary">{favoritesCount}</p>
          </div>
        </Link>
        <Link href="/profile/reviews" className="bg-bg-card border border-border p-5 rounded-2xl flex items-center gap-4 hover:border-brand-500 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 text-yellow-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Star size={24} />
          </div>
          <div>
            <p className="text-sm text-text-secondary font-medium">التقييمات</p>
            <p className="text-2xl font-bold text-text-primary">{reviewsCount}</p>
          </div>
        </Link>
        <Link href="/profile/messages" className="bg-bg-card border border-border p-5 rounded-2xl flex items-center gap-4 hover:border-brand-500 transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <MessageSquare size={24} />
          </div>
          <div>
            <p className="text-sm text-text-secondary font-medium">المراسلات</p>
            <p className="text-2xl font-bold text-text-primary">{conversationsCount}</p>
          </div>
        </Link>
      </div>

      {/* Browse Programs Section */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">أحدث البرامج المضافة</h2>
        <Link href="/programs" className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
          تصفح كل البرامج
          <ArrowLeft size={16} />
        </Link>
      </div>
      
      {recentPrograms.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentPrograms.map((program: any) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      ) : (
        <div className="bg-bg-card border border-border p-8 rounded-2xl text-center">
          <BookOpen size={48} className="mx-auto text-text-muted mb-4" />
          <h3 className="text-lg font-bold text-text-primary mb-2">لا توجد برامج حالياً</h3>
          <p className="text-text-secondary mb-4">ترقب إضافة برامج جديدة قريباً.</p>
        </div>
      )}
    </div>
  );
}
