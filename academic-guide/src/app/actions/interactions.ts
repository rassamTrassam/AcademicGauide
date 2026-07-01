"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Toggles a program in the user's favorites list.
 */
export async function toggleFavorite(programId: string, pathname: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "يجب تسجيل الدخول لإضافة التخصص إلى المفضلة." };
  }

  try {
    // Check if already favorited
    const { data: existing } = await supabase
      .from("favorites")
      .select("program_id")
      .eq("user_id", user.id)
      .eq("program_id", programId)
      .single();

    if (existing) {
      // Remove from favorites
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("program_id", programId);
      
      if (error) throw error;
      
      revalidatePath(pathname);
      return { success: true, isFavorited: false };
    } else {
      // Add to favorites
      const { error } = await supabase
        .from("favorites")
        .insert({
          user_id: user.id,
          program_id: programId,
        });

      if (error) throw error;

      revalidatePath(pathname);
      return { success: true, isFavorited: true };
    }
  } catch (error: any) {
    console.error("Error toggling favorite:", error);
    return { error: "حدث خطأ أثناء تحديث المفضلة." };
  }
}

/**
 * Submits or updates a user's rating and review for a program.
 */
export async function submitRating(programId: string, rating: number, review: string, pathname: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "يجب تسجيل الدخول لإضافة تقييم." };
  }

  if (rating < 1 || rating > 5) {
    return { error: "التقييم يجب أن يكون بين 1 و 5 نجوم." };
  }

  try {
    const { error } = await supabase
      .from("ratings")
      .upsert(
        {
          user_id: user.id,
          program_id: programId,
          rating,
          review: review.trim() || null,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id, program_id' }
      );

    if (error) throw error;

    revalidatePath(pathname);
    return { success: true, message: "تم حفظ التقييم بنجاح!" };
  } catch (error: any) {
    console.error("Error submitting rating:", error);
    return { error: "حدث خطأ أثناء حفظ التقييم." };
  }
}
