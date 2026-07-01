// @ts-nocheck
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ProgramCard } from "@/components/ProgramCard";
import { EmptyState } from "@/components/EmptyState";
import { Heart } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfileFavoritesPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch favorites with program details
  const { data: favorites, error } = await supabase
    .from("favorites")
    .select(`
      program_id,
      programs (
        *,
        institutions (
          name_ar,
          city
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch favorites:", error);
  }

  // Extract programs from favorites
  const programs = (favorites || [])
    .map(fav => {
      // Supabase returns an array for one-to-many, but one-to-one/many-to-one usually returns object/array depending on setup.
      const prog = Array.isArray(fav.programs) ? fav.programs[0] : fav.programs;
      if (!prog) return null;
      return {
        ...prog,
        institutions: Array.isArray(prog.institutions) ? prog.institutions[0] : prog.institutions
      };
    })
    .filter(Boolean);

  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
          <Heart size={24} className="fill-current" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">المفضلة</h1>
          <p className="text-text-secondary mt-1">البرامج التعليمية التي قمت بحفظها للرجوع إليها لاحقاً.</p>
        </div>
      </div>

      {programs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program: any) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      ) : (
        <EmptyState 
          title="قائمة المفضلة فارغة"
          message="لم تقم بإضافة أي برامج إلى مفضلتك حتى الآن. استكشف البرامج المتاحة واحفظ ما يثير اهتمامك."
          actionText="استكشف البرامج"
          actionHref="/programs"
        />
      )}
    </div>
  );
}
