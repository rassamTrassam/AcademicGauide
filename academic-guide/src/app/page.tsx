import Link from "next/link";
import { ArrowLeft, Search, GraduationCap, Building2, Map, HeartPulse, Cpu, HardHat, Briefcase, BookOpen } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { ProgramCard } from "@/components/ProgramCard";

import type { ProgramWithInstitution } from "@/types/database";

export default async function HomePage() {
  const supabase = await createClient();
  
  // Fetch featured programs first
  const { data: featuredFirst } = await supabase
    .from("programs")
    .select(`*, institutions(name_ar)`)
    .eq("is_featured", true)
    .eq("status", "active")
    .limit(6) as { data: ProgramWithInstitution[] | null };

  let featuredPrograms = featuredFirst || [];

  // If we have fewer than 6 featured, fill the rest with newest programs
  if (featuredPrograms.length < 6) {
    const featuredIds = featuredPrograms.map(p => p.id);
    const remaining = 6 - featuredPrograms.length;
    
    let fillQuery = supabase
      .from("programs")
      .select(`*, institutions(name_ar)`)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(remaining);
    
    if (featuredIds.length > 0) {
      // Exclude already-fetched featured programs
      for (const fid of featuredIds) {
        fillQuery = fillQuery.neq("id", fid);
      }
    }

    const { data: fillers } = await fillQuery as { data: ProgramWithInstitution[] | null };
    if (fillers) {
      featuredPrograms = [...featuredPrograms, ...fillers];
    }
  }

  // Get total stats
  const { count: programsCount } = await supabase.from("programs").select("*", { count: "exact", head: true });
  const { count: institutionsCount } = await supabase.from("institutions").select("*", { count: "exact", head: true });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-bg-surface border-b border-border pt-20 pb-32">
        {/* Background Gradients */}
        <div className="absolute top-0 start-1/2 -translate-x-1/2 w-full max-w-[1000px] h-full opacity-30 pointer-events-none">
          <div className="absolute -top-24 start-0 w-96 h-96 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 dark:opacity-20 animate-blob"></div>
          <div className="absolute top-0 end-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 dark:opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 start-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-50 dark:opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center animate-fade-up">
          <span className="badge badge-blue mb-6 mx-auto px-4 py-1 text-sm border border-brand-200 dark:border-brand-800">
            أول وأكبر دليل جامعي في اليمن 🇾🇪
          </span>
          <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
            مستقبلك الأكاديمي يبدأ <span className="gradient-text">من هنا</span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            استكشف، قارن، واختر من بين مئات البرامج الأكاديمية والتخصصات في مختلف الجامعات اليمنية بضغطة زر.
          </p>
          
          {/* Main Search */}
          <form action="/programs" className="max-w-2xl mx-auto relative group flex shadow-2xl rounded-2xl overflow-hidden focus-within:ring-4 ring-brand-500/20 transition-all border border-border">
            <div className="bg-bg-surface flex-1 flex items-center px-4">
              <Search className="text-text-muted shrink-0" size={24} />
              <input 
                type="text" 
                name="q"
                placeholder="عن ماذا تبحث؟ (مثال: طب عام، هندسة حاسوب...)"
                className="w-full bg-transparent border-none outline-none py-5 px-3 text-lg text-text-primary placeholder:text-text-muted"
              />
            </div>
            <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white px-8 md:px-12 font-bold text-lg transition-colors">
              بحث
            </button>
          </form>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-16 text-text-muted">
            <div className="flex items-center gap-2">
              <GraduationCap size={24} className="text-brand-500" />
              <span className="font-bold text-xl text-text-primary">{programsCount || "+100"}</span>
              <span>برنامج دراسي</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 size={24} className="text-purple-500" />
              <span className="font-bold text-xl text-text-primary">{institutionsCount || 7}</span>
              <span>مؤسسات تعليمية</span>
            </div>
            <div className="flex items-center gap-2">
              <Map size={24} className="text-pink-500" />
              <span className="font-bold text-xl text-text-primary">4</span>
              <span>مدن يمنية</span>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Category Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">تصفح حسب المجال</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              اكتشف التخصصات الأكاديمية المختلفة والبرامج المتاحة في كل مجال لتحديد مسارك التعليمي الأنسب.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { id: "الطب والصحة", icon: HeartPulse, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-100 dark:border-red-900/30" },
              { id: "الحاسوب وتقنية المعلومات", icon: Cpu, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-100 dark:border-blue-900/30" },
              { id: "الهندسة", icon: HardHat, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-100 dark:border-amber-900/30" },
              { id: "العلوم الإدارية", icon: Briefcase, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20", border: "border-emerald-100 dark:border-emerald-900/30" },
              { id: "الآداب والعلوم الإنسانية", icon: BookOpen, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-100 dark:border-purple-900/30" },
            ].map((cat) => (
              <Link 
                href={`/programs?category=${cat.id}`} 
                key={cat.id}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${cat.bg} ${cat.border} group`}
              >
                <div className={`w-16 h-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300 ${cat.color}`}>
                  <cat.icon size={32} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-center">{cat.id}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Programs Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="section-label mb-2">برامج مميزة</h2>
            <p className="text-text-secondary">تصفح البرامج الأكثر إقبالاً وبحثاً من قبل الطلاب</p>
          </div>
          <Link href="/programs" className="hidden sm:flex items-center gap-2 text-brand-600 font-bold hover:underline">
            عرض كل البرامج <ArrowLeft size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPrograms?.map((program) => (
            <ProgramCard key={program.id} program={program as any} />
          ))}
        </div>
        
        <div className="mt-10 text-center sm:hidden">
          <Link href="/programs" className="btn-ghost w-full justify-center">
            عرض كل البرامج <ArrowLeft size={18} />
          </Link>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-brand-900 text-white py-16 mt-auto relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4">هل أنت ممثل لجامعة؟</h2>
          <p className="text-brand-200 max-w-2xl mx-auto mb-8 text-lg">
            انضم إلى منصتنا وقم بإدارة صفحة جامعتك وبرامجك الأكاديمية للوصول إلى آلاف الطلاب المهتمين.
          </p>
          <button className="bg-white text-brand-900 px-8 py-3 rounded-xl font-bold hover:bg-brand-50 transition-colors shadow-lg shadow-black/20">
            تواصل معنا للانضمام
          </button>
        </div>
      </section>
    </div>
  );
}
