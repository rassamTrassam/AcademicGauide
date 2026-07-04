// @ts-nocheck
"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateInstitutionSettings(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "غير مصرح لك بالقيام بهذا الإجراء" };
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("institution_id")
    .eq("id", user.id)
    .single();

  if (!profile?.institution_id) {
    return { error: "لم يتم العثور على المؤسسة الخاصة بك" };
  }

  const adminName = formData.get("adminName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const logoFile = formData.get("logo") as File | null;

  try {
    // Update admin name
    if (adminName) {
      await supabase
        .from("user_profiles")
        .update({ full_name: adminName })
        .eq("id", user.id);
    }

    // Update institution details
    const updates: any = {};
    if (email) updates.email = email;
    if (phone) updates.phone = phone;

    // Handle logo upload
    if (logoFile && logoFile.size > 0) {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${profile.institution_id}-logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const buffer = Buffer.from(await logoFile.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from("program-assets")
        .upload(filePath, buffer, {
          contentType: logoFile.type,
          upsert: true
        });

      if (uploadError) {
        console.error("Logo upload error:", uploadError);
        return { error: uploadError.message || "فشل في رفع الشعار" };
      }

      const { data: publicUrlData } = supabase.storage
        .from("program-assets")
        .getPublicUrl(filePath);

      updates.logo_url = publicUrlData.publicUrl;
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from("institutions")
        .update(updates)
        .eq("id", profile.institution_id);

      if (updateError) {
        return { error: "فشل في تحديث بيانات المؤسسة" };
      }
    }

    revalidatePath("/", "layout");
    return { success: true };

  } catch (error) {
    console.error("Settings update error:", error);
    return { error: "حدث خطأ غير متوقع" };
  }
}

export async function updateStudentSettings(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "غير مصرح لك بالقيام بهذا الإجراء" };
  }

  const fullName = formData.get("fullName") as string;

  if (!fullName || fullName.trim().length < 3) {
    return { error: "يرجى إدخال اسم صحيح" };
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({ full_name: fullName.trim() })
    .eq("id", user.id);

  if (error) {
    return { error: "فشل في تحديث البيانات" };
  }

  revalidatePath("/profile/settings");
  revalidatePath("/profile");
  return { success: true };
}

export async function updateUserAvatar(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "غير مصرح لك بالقيام بهذا الإجراء" };
  }

  const image = formData.get("image") as File | null;
  if (!image) {
    return { error: "يرجى اختيار صورة" };
  }

  try {
    const ext = image.name.split(".").pop() || "jpg";
    const path = `${user.id}/profile-${Date.now()}.${ext}`;

    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, buffer, {
        contentType: image.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Avatar upload failed:", uploadError);
      return { error: "فشل في رفع الصورة" };
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(path);

    const { error: dbError } = await supabase
      .from("user_profiles")
      .update({ avatar_url: publicUrlData.publicUrl })
      .eq("id", user.id);

    if (dbError) {
      console.error("Avatar DB update failed:", dbError);
      return { error: "فشل في تحديث الصورة في قاعدة البيانات" };
    }

    // Update the auth user metadata so the frontend session gets the new avatar immediately
    await supabase.auth.updateUser({
      data: { avatar_url: publicUrlData.publicUrl }
    });

    revalidatePath("/profile/settings");
    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/admin");
    return { success: true, avatarUrl: publicUrlData.publicUrl };
  } catch (err: any) {
    console.error("Avatar update error:", err);
    return { error: "حدث خطأ غير متوقع" };
  }
}
