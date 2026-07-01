// @ts-nocheck
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";
import { Star } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProfileReviewsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: reviews, error } = await supabase
    .from("ratings")
    .select(`
      *,
      program:programs(id, title_ar)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch reviews:", error);
  }

  const formattedReviews = (reviews || []).map((rev: any) => ({
    ...rev,
    program: Array.isArray(rev.program) ? rev.program[0] : rev.program
  }));

  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-yellow-50 text-yellow-500 flex items-center justify-center">
          <Star size={24} className="fill-current" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">تقييماتي</h1>
          <p className="text-text-secondary mt-1">المراجعات والتقييمات التي قمت بكتابتها للبرامج التعليمية.</p>
        </div>
      </div>

      {formattedReviews.length > 0 ? (
        <div className="space-y-4">
          {formattedReviews.map((review: any) => (
            <div key={review.program_id} className="bg-bg-card border border-border p-5 rounded-2xl">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="text-xs text-text-muted">{new Date(review.created_at).toLocaleDateString('ar-YE')}</div>
                  <span className="text-text-muted">•</span>
                  <Link 
                    href={`/programs/${review.program?.id}`} 
                    className="font-bold text-brand-600 hover:underline text-sm truncate max-w-[200px] md:max-w-md"
                  >
                    {review.program?.title_ar}
                  </Link>
                </div>
                <div className="flex items-center text-yellow-400" dir="ltr">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < review.rating ? "fill-current" : "text-border"} />
                  ))}
                </div>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                {review.review || "لم يتم كتابة مراجعة نصية، تقييم بالنجوم فقط."}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          title="لا توجد تقييمات"
          message="لم تقم بتقييم أي برامج حتى الآن. رأيك يهمنا ويساعد الطلاب الآخرين!"
          actionText="استكشف البرامج"
          actionHref="/programs"
        />
      )}
    </div>
  );
}
