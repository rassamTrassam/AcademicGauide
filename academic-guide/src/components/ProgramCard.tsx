import Image from "next/image";
import Link from "next/link";
import { Eye, Star, MapPin, Clock, Banknote, BookOpen } from "lucide-react";
import { Tables } from "@/types/database";
import { FavoriteButton } from "@/components/FavoriteButton";
import { CompareButton } from "@/components/CompareButton";
import { getSmartCoverImage } from "@/utils/imageHelpers";

// Define a type for the joined query result
type ProgramWithInstitution = Tables<"programs"> & {
  institutions: { name_ar: string; city: string | null } | null;
};

export function ProgramCard({ program }: { program: ProgramWithInstitution }) {
  const metadata = program.metadata as any;
  const degreeMap: Record<string, string> = {
    bachelor: "بكالوريوس",
    master: "ماجستير",
    phd: "دكتوراه",
    diploma: "دبلوم",
    certificate: "شهادة",
    course: "دورة",
  };

  const degreeText = degreeMap[program.degree_level] || program.degree_level;

  const degreeColorMap: Record<string, string> = {
    bachelor: "badge-blue",
    master: "badge-purple",
    diploma: "badge-green",
    course: "badge-orange",
  };
  const badgeClass = degreeColorMap[program.degree_level] || "badge-blue";

  // Extract key metadata for quick view
  const duration = metadata?.duration_raw || metadata?.["المدة الدراسية"] || null;
  const fees = metadata?.fees_raw || metadata?.["الرسوم الدراسية"] || null;
  const city = program.institutions?.city || metadata?.city || metadata?.["المدينة أو مقر الدراسة"] || null;
  const studyType = metadata?.study_type || metadata?.["نوع الدراسة"] || null;

  const coverImage = program.cover_image_url || getSmartCoverImage(program.title_ar);

  return (
    <div className="card group flex flex-col h-full overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      {/* Image Header */}
      <Link href={`/programs/${program.id}`} className="relative h-48 w-full overflow-hidden block shrink-0 bg-gray-100 dark:bg-gray-800">
        <Image
          src={coverImage}
          alt={program.title_ar}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 start-3 flex flex-col gap-2">
          <span className={`badge ${badgeClass} shadow-md backdrop-blur-md bg-white/95 dark:bg-black/70 px-3 py-1 rounded-full text-xs font-bold`}>
            {degreeText}
          </span>
        </div>

        {/* Rating Badge */}
        {program.average_rating > 0 && (
          <div className="absolute top-3 end-3 badge shadow-md backdrop-blur-md bg-white/95 dark:bg-black/70 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-full flex items-center gap-1 text-xs font-bold">
            <Star size={12} className="fill-current" />
            <span>{program.average_rating.toFixed(1)}</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">
          {program.institutions?.name_ar || "مؤسسة غير معروفة"}
        </div>

        <Link href={`/programs/${program.id}`} className="block mb-4">
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
            {program.title_ar}
          </h3>
        </Link>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 mt-auto pt-4 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400 font-medium">
          {city && (
            <div className="flex items-center gap-2" title={city}>
              <MapPin size={16} className="text-brand-500 shrink-0" />
              <span className="truncate">{city}</span>
            </div>
          )}
          {studyType && (
            <div className="flex items-center gap-2" title={studyType}>
              <BookOpen size={16} className="text-brand-500 shrink-0" />
              <span className="truncate">{studyType}</span>
            </div>
          )}
          {duration && (
            <div className="flex items-center gap-2" title={duration}>
              <Clock size={16} className="text-brand-500 shrink-0" />
              <span className="truncate">{duration}</span>
            </div>
          )}
          {fees && (
            <div className="flex items-center gap-2" title={fees}>
              <Banknote size={16} className="text-brand-500 shrink-0" />
              <span className="truncate">{fees}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="bg-gray-50 dark:bg-gray-900/50 px-5 py-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 shrink-0">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 font-medium">
            <Eye size={16} />
            <span>{program.views_count}</span>
          </div>
          <FavoriteButton programId={program.id} initialCount={program.favorites_count} variant="icon" />
          <CompareButton programId={program.id} variant="icon" />
        </div>
        <Link href={`/programs/${program.id}`} className="font-bold text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-1">
          التفاصيل
          <span className="text-lg leading-none">&larr;</span>
        </Link>
      </div>
    </div>
  );
}

