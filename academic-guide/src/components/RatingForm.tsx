"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { submitRating } from "@/app/actions/interactions";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";

interface RatingFormProps {
  programId: string;
  initialRating?: number;
  initialReview?: string;
  isAuthenticated: boolean;
}

export function RatingForm({ programId, initialRating = 0, initialReview = "", isAuthenticated }: RatingFormProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState(initialReview);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  
  const pathname = usePathname();
  const router = useRouter();
  const { openAuthModal } = useAppStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    if (rating === 0) {
      setMessage({ type: "error", text: "يرجى اختيار عدد النجوم للتقييم." });
      return;
    }

    setMessage(null);
    startTransition(async () => {
      const result = await submitRating(programId, rating, review, pathname);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else if (result.success) {
        setMessage({ type: "success", text: result.message || "تم الحفظ بنجاح!" });
      }
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl">
      <h3 className="text-xl font-bold mb-4">{initialRating > 0 ? "تحديث تقييمك" : "أضف تقييمك"}</h3>
      
      {message && (
        <div className={`p-3 rounded-lg mb-4 text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating Selection */}
        <div className="flex items-center gap-2 mb-2" dir="ltr">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none transition-transform hover:scale-110"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => {
                if (!isAuthenticated) {
                  openAuthModal();
                  return;
                }
                setRating(star);
              }}
            >
              <Star
                size={32}
                className={`transition-colors ${
                  star <= (hoveredRating || rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-text-muted"
                }`}
              />
            </button>
          ))}
          <span className="ms-4 text-sm text-gray-600 dark:text-gray-400" dir="rtl">
            {rating > 0 ? `(${rating}/5)` : "اختر التقييم"}
          </span>
        </div>

        {/* Review Textarea */}
        <div className="space-y-2">
          <label htmlFor="review" className="block text-sm font-medium text-gray-900 dark:text-gray-100">
            رأيك بالبرنامج (اختياري)
          </label>
          <textarea
            id="review"
            rows={3}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            disabled={isPending || !isAuthenticated}
            placeholder={isAuthenticated ? "شاركنا تجربتك ورأيك بالتفصيل..." : "يجب تسجيل الدخول لإضافة تعليق"}
            className="w-full bg-white text-gray-900 border-gray-300 dark:bg-gray-900 dark:text-white dark:border-gray-700 rounded-xl p-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none placeholder-gray-500 dark:placeholder-gray-400"
            onClick={() => {
              if (!isAuthenticated) openAuthModal();
            }}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending || rating === 0}
          className="btn-primary w-full md:w-auto"
        >
          {isPending ? "جاري الحفظ..." : "حفظ التقييم"}
        </button>
      </form>
    </div>
  );
}
