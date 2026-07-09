// @ts-nocheck
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getSmartCoverImage } from "@/utils/imageHelpers";
import Link from "next/link";
import { ArrowRight, MapPin, Clock, Banknote, Building2, Download, Heart, Share2, Star, Eye, MessageSquare, GraduationCap } from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { CompareButton } from "@/components/CompareButton";
import { RatingForm } from "@/components/RatingForm";
import ShareButton from "@/components/ShareButton";
import { ContactButton } from "@/components/ContactButton";

import type { ProgramWithDetails } from "@/types/database";

export const dynamic = "force-dynamic"; // Ensure personalized data (favorites, ratings) is fresh per user

export default async function ProgramDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch Program + Institution
  const { data: program } = await supabase
    .from("programs")
    .select(`*, institutions(*)`)
    .eq("id", id)
    .single() as { data: ProgramWithDetails | null };

  if (!program) return notFound();

  // Update view count safely (fire and forget)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).rpc('increment_program_views', { p_program_id: id }).then();
  } catch (e) {
    console.error("Failed to increment views", e);
  }

  // Fetch user interactions if logged in
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  let isFavorite = false;
  let userRating = null;

  if (user) {
    const { data: fav } = await supabase
      .from("favorites")
      .select("program_id")
      .eq("user_id", user.id)
      .eq("program_id", id)
      .maybeSingle();
    if (fav) isFavorite = true;

    const { data: rating } = await supabase
      .from("ratings")
      .select("*")
      .eq("user_id", user.id)
      .eq("program_id", id)
      .maybeSingle();
    if (rating) userRating = rating;
  }

  // Fetch comments (ratings with reviews)
  const { data: comments } = await supabase
    .from("ratings")
    .select(`
      rating,
      review,
      created_at,
      user_profiles ( full_name, avatar_url )
    `)
    .eq("program_id", id)
    .not("review", "is", null)
    .order("created_at", { ascending: false });

  const metadata = program.metadata as any || {};
  
  // Format Metadata to filter out redundant fields we already show in the header
  const excludeKeys = ["source_file", "source_folder", "files_count", "duration_raw", "fees_raw", "city", "study_style", "career_opportunities", "admission_requirements", "required_documents", "study_plan_data"];
  const dynamicFields = Object.entries(metadata).filter(([key, value]) => !excludeKeys.includes(key) && value);

  // Quick info
  const duration = metadata.duration_raw || metadata["المدة الدراسية"];
  const fees = metadata.fees_raw || metadata["الرسوم الدراسية"];
  const city = metadata.city || metadata["المدينة أو مقر الدراسة"];
  const style = metadata.study_style || metadata["نمط الدراسة"];

  return (
    <div className="bg-bg-base min-h-screen pb-20">
      {/* Header / Cover */}
      <div className="w-full h-[300px] md:h-[400px] relative bg-brand-900 border-b border-border">
        <Image 
          src={program.cover_image_url || getSmartCoverImage(program.title_ar)} 
          alt={program.title_ar} 
          fill 
          className="object-cover opacity-60"
          priority
        />
        
        {/* Breadcrumb & Navigation */}
        <div className="absolute top-0 start-0 w-full p-4 md:p-8 flex items-center justify-between z-10">
          <Link href="/programs" className="inline-flex items-center gap-2 text-white/80 hover:text-white backdrop-blur-sm bg-black/20 px-4 py-2 rounded-lg transition-colors">
            <ArrowRight size={18} />
            العودة للبرامج
          </Link>
          <div className="flex gap-2">
            <ShareButton />
            <div className="hidden md:block">
              <FavoriteButton 
                programId={program.id} 
                initialCount={program.favorites_count} 
                initialIsFavorite={isFavorite}
                variant="button"
              />
            </div>
          </div>
        </div>

        {/* Title Area */}
        <div className="absolute bottom-0 start-0 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-32 pb-8 px-4 md:px-8 z-10 text-white">
          <div className="container mx-auto">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="badge bg-brand-600 text-white border-none shadow-lg">{program.degree_level}</span>
              {program.average_rating > 0 && (
                <span className="flex items-center gap-1 text-yellow-400 font-bold bg-black/40 px-3 py-1 rounded-full text-sm">
                  <Star size={14} className="fill-current" /> {Number(program.average_rating).toFixed(1)}
                  <span className="text-white/60 font-normal ms-1">({program.ratings_count})</span>
                </span>
              )}
              <span className="flex items-center gap-1 text-white/80 bg-black/40 px-3 py-1 rounded-full text-sm">
                <Eye size={14} /> {program.views_count + 1}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-3 drop-shadow-md leading-tight">{program.title_ar}</h1>
            <div className="flex items-center gap-2 text-white/80 font-medium text-lg">
              <Building2 size={20} />
              {(program.institutions as any)?.name_ar} 
              {program.faculty_ar && <span className="opacity-70"> — {program.faculty_ar}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 md:mt-12 flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 space-y-10">
          
          {/* Quick Info Cards - Bento Grid Style */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {duration && (
              <div className="card p-5 flex flex-col items-center justify-center text-center gap-3 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-900/10 dark:to-bg-surface border border-blue-100 dark:border-blue-800/30 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center shadow-inner"><Clock size={24} /></div>
                <div>
                  <span className="block text-xs text-text-muted mb-1">المدة الدراسية</span>
                  <span className="block text-sm font-bold text-text-primary">{duration}</span>
                </div>
              </div>
            )}
            {fees && (
              <div className="card p-5 flex flex-col items-center justify-center text-center gap-3 bg-gradient-to-br from-green-50/50 to-white dark:from-green-900/10 dark:to-bg-surface border border-green-100 dark:border-green-800/30 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 flex items-center justify-center shadow-inner"><Banknote size={24} /></div>
                <div>
                  <span className="block text-xs text-text-muted mb-1">الرسوم التقريبية</span>
                  <span className="block text-sm font-bold text-text-primary">{fees}</span>
                </div>
              </div>
            )}
            {city && (
              <div className="card p-5 flex flex-col items-center justify-center text-center gap-3 bg-gradient-to-br from-orange-50/50 to-white dark:from-orange-900/10 dark:to-bg-surface border border-orange-100 dark:border-orange-800/30 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 flex items-center justify-center shadow-inner"><MapPin size={24} /></div>
                <div>
                  <span className="block text-xs text-text-muted mb-1">المدينة</span>
                  <span className="block text-sm font-bold text-text-primary">{city}</span>
                </div>
              </div>
            )}
            {style && (
              <div className="card p-5 flex flex-col items-center justify-center text-center gap-3 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-900/10 dark:to-bg-surface border border-purple-100 dark:border-purple-800/30 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center shadow-inner"><GraduationCap size={24} /></div>
                <div>
                  <span className="block text-xs text-text-muted mb-1">نمط الدراسة</span>
                  <span className="block text-sm font-bold text-text-primary">{style}</span>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {program.description_ar && (
            <section className="card p-6 md:p-8">
              <h2 className="section-label">نبذة عن البرنامج</h2>
              <div className="prose prose-brand dark:prose-invert max-w-none text-text-secondary leading-loose">
                {program.description_ar.split("\n").map((line, i) => (
                  <p key={i} className="mb-4">{line}</p>
                ))}
              </div>
            </section>
          )}

          {/* Structured Data (Admission, Jobs) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(metadata.admission_requirements || metadata["شروط الالتحاق"]) && (
              <div className="card p-6 md:p-8 border-t-4 border-t-brand-500">
                <h3 className="font-bold text-lg mb-4 text-text-primary flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-brand-500"></div> شروط القبول
                </h3>
                <p className="text-text-secondary leading-relaxed text-sm">
                  {metadata.admission_requirements || metadata["شروط الالتحاق"]}
                </p>
              </div>
            )}
            {(metadata.career_opportunities || metadata["مجالات العمل المتاحة"]) && (
              <div className="card p-6 md:p-8 border-t-4 border-t-purple-500">
                <h3 className="font-bold text-lg mb-4 text-text-primary flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div> مجالات العمل
                </h3>
                <p className="text-text-secondary leading-relaxed text-sm">
                  {metadata.career_opportunities || metadata["مجالات العمل المتاحة"]}
                </p>
              </div>
            )}
          </section>

          {/* Dynamic Extra Metadata (The magic JSONB part) */}
          {dynamicFields.length > 0 && (
            <section className="card p-6 md:p-8">
              <h2 className="section-label">معلومات إضافية</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-start border-collapse">
                  <tbody>
                    {dynamicFields.map(([key, val], idx) => (
                      <tr key={key} className={`border-b border-border/50 last:border-0 ${idx % 2 === 0 ? "bg-bg-elevated/30" : ""}`}>
                        <th className="py-4 px-4 text-start font-semibold text-text-primary w-1/3 md:w-1/4 align-top">{key}</th>
                        <td className="py-4 px-4 text-text-secondary leading-relaxed break-words whitespace-pre-wrap">{String(val)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* User Interaction Section: Rating Form */}
          <section id="rating-section" className="scroll-mt-24">
            <h2 className="section-label mb-6 flex items-center gap-2">
              <MessageSquare size={20} className="text-brand-500" /> رأيك يهمنا
            </h2>
            <RatingForm 
              programId={program.id} 
              initialRating={userRating?.rating || 0}
              initialReview={userRating?.review || ""}
              isAuthenticated={!!user}
            />
          </section>

          {/* Comments Section */}
          {comments && comments.length > 0 && (
            <section className="mt-8">
              <h3 className="font-bold text-xl mb-6">التعليقات ({comments.length})</h3>
              <div className="space-y-4">
                {comments.map((comment, idx) => (
                  <div key={idx} className="bg-bg-card border border-border p-5 rounded-2xl">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-lg shrink-0 relative overflow-hidden border border-brand-200">
                          {(comment.user_profiles as any)?.avatar_url ? (
                            <img src={(comment.user_profiles as any).avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
                          ) : (
                            ((comment.user_profiles as any)?.full_name?.[0] || "م").toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-text-primary">{(comment.user_profiles as any)?.full_name || "مستخدم موثق"}</div>
                          <div className="text-xs text-text-muted">{new Date(comment.created_at).toLocaleDateString('ar-YE')}</div>
                        </div>
                      </div>
                      <div className="flex items-center text-yellow-400" dir="ltr">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < comment.rating ? "fill-current" : "text-border"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                      {comment.review}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Sidebar / Sticky Actions */}
        <div className="lg:w-[350px] shrink-0">
          <div className="sticky top-24 space-y-6">
            
            {/* Action Card */}
            <div className="card p-6 flex flex-col gap-4">
              <h3 className="font-bold text-lg mb-2">إجراءات سريعة</h3>
              
              {program.study_plan_pdf_url ? (
                <a 
                  href={program.study_plan_pdf_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary w-full justify-center py-3"
                >
                  <Download size={20} />
                  تنزيل الخطة الدراسية (PDF)
                </a>
              ) : (
                <button disabled className="btn-primary w-full justify-center py-3 opacity-50 cursor-not-allowed grayscale">
                  <Download size={20} />
                  الخطة الدراسية غير متوفرة
                </button>
              )}

              <ContactButton 
                programId={program.id} 
                institutionId={program.institution_id} 
                isAuthenticated={!!user} 
                institutionWebsite={(program.institutions as any)?.website}
                institutionEmail={(program.institutions as any)?.email}
              />

              <FavoriteButton programId={program.id} initialCount={program.favorites_count} initialIsFavorite={isFavorite} />
              
              <CompareButton programId={program.id} variant="button" />
            </div>

            {/* Institution Card */}
            <div className="card p-6">
              <h3 className="font-bold mb-4 text-text-muted text-sm uppercase tracking-wider">عن المؤسسة</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-bg-elevated flex items-center justify-center shrink-0 border border-border">
                  <Building2 size={32} className="text-text-muted" />
                </div>
                <div>
                  <h4 className="font-bold text-text-primary leading-snug">{(program.institutions as any)?.name_ar}</h4>
                  <span className="badge badge-purple mt-2 text-[10px]">مؤسسة مسجلة</span>
                </div>
              </div>
              <Link href={`/programs?institution_id=${program.institution_id}`} className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-semibold inline-flex items-center gap-1">
                عرض كل برامج المؤسسة <ArrowRight size={14} />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
