// @ts-nocheck
"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Upload a File to the verification_docs bucket and return its public URL */
async function uploadVerificationDoc(
  adminClient: Awaited<ReturnType<typeof createAdminClient>>,
  userId: string,
  file: File,
  fileKey: string
): Promise<string | null> {
  try {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/${fileKey}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error } = await adminClient.storage
      .from("verification_docs")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error(`❌ Upload failed [${fileKey}]:`, error.message);
      return null;
    }

    // Return the storage path (we will sign URLs on demand, not store public URLs)
    return path;
  } catch (err: any) {
    console.error(`❌ Upload error [${fileKey}]:`, err?.message);
    return null;
  }
}

// ─── signUpAction ─────────────────────────────────────────────────────────────

export async function signUpAction(formData: FormData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const name = formData.get("name")?.toString().trim();
  const role = formData.get("role")?.toString() || "student";

  console.log("📝 signUpAction called:", { email, name, role, hasPassword: !!password });

  // ── Basic validation ───────────────────────────────────────────────────────
  if (!email || !password || !name) {
    return { error: "يرجى تعبئة جميع الحقول المطلوبة" };
  }
  if (password.length < 6) {
    return { error: "كلمة المرور يجب أن لا تقل عن 6 أحرف" };
  }

  // ── Org_Admin extra validation ─────────────────────────────────────────────
  if (role === "org_admin") {
    const fullName4Parts = formData.get("full_name_4_parts")?.toString().trim();
    const institutionName = formData.get("institution_name_request")?.toString().trim();
    const jobTitle = formData.get("job_title")?.toString().trim();
    const personalContact = formData.get("personal_contact")?.toString().trim();
    const institutionContact = formData.get("institution_contact")?.toString().trim();
    const idImage = formData.get("id_image") as File | null;

    if (!fullName4Parts || !institutionName || !jobTitle || !personalContact || !institutionContact) {
      return { error: "يرجى تعبئة جميع الحقول الإلزامية للتسجيل كجهة تعليمية" };
    }
    if (!idImage || idImage.size === 0) {
      return { error: "صورة الهوية الشخصية مطلوبة" };
    }
  }

  try {
    const adminClient = await createAdminClient();

    // ── Create auth user ────────────────────────────────────────────────────
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      email_confirm: true,
    });

    console.log("📊 Admin createUser result:", {
      userId: data?.user?.id,
      errorCode: error?.code,
      errorMsg: error?.message,
    });

    if (error) {
      if (
        error.message?.includes("already been registered") ||
        error.message?.includes("already exists")
      ) {
        return { error: "هذا البريد الإلكتروني مسجل مسبقاً، يرجى تسجيل الدخول" };
      }
      return { error: `خطأ في إنشاء الحساب: ${error.message}` };
    }

    if (!data?.user) {
      return { error: "فشل إنشاء الحساب، يرجى المحاولة مرة أخرى" };
    }

    const userId = data.user.id;

    // ── Org_Admin: upload docs + update profile ────────────────────────────
    if (role === "org_admin") {
      const fullName4Parts = formData.get("full_name_4_parts")?.toString().trim() ?? null;
      const institutionName = formData.get("institution_name_request")?.toString().trim() ?? null;
      const jobTitle = formData.get("job_title")?.toString().trim() ?? null;
      const personalContact = formData.get("personal_contact")?.toString().trim() ?? null;
      const institutionContact = formData.get("institution_contact")?.toString().trim() ?? null;

      const idImage = formData.get("id_image") as File | null;
      const workIdImage = formData.get("work_id_image") as File | null;
      const authLetterImage = formData.get("auth_letter_image") as File | null;

      // Upload mandatory ID image
      const idImageUrl = idImage && idImage.size > 0
        ? await uploadVerificationDoc(adminClient, userId, idImage, "id_image")
        : null;

      // Upload optional documents
      const workIdImageUrl = workIdImage && workIdImage.size > 0
        ? await uploadVerificationDoc(adminClient, userId, workIdImage, "work_id_image")
        : null;
      const authLetterImageUrl = authLetterImage && authLetterImage.size > 0
        ? await uploadVerificationDoc(adminClient, userId, authLetterImage, "auth_letter_image")
        : null;

      // Upsert profile with all verification data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: profileError } = await (adminClient as any)
        .from("user_profiles")
        .upsert({
          id: userId,
          full_name: name,
          approval_status: "pending" as const,
          full_name_4_parts: fullName4Parts,
          institution_name_request: institutionName,
          job_title: jobTitle,
          personal_contact: personalContact,
          institution_contact: institutionContact,
          id_image_url: idImageUrl,
          work_id_image_url: workIdImageUrl,
          auth_letter_image_url: authLetterImageUrl,
        });

      if (profileError) {
        console.error("❌ Profile upsert error:", profileError.message);
        // Don't fail the whole signup — user is created, profile can be fixed later
      }

      // Sign in the org_admin immediately (they'll be redirected to pending page)
      const supabase = await createClient();
      await supabase.auth.signInWithPassword({ email, password });

      revalidatePath("/", "layout");
      return { success: true, redirectTo: "/pending-approval" };
    }

    // ── Student: sign in immediately ───────────────────────────────────────
    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.warn("⚠️ Account created but auto-login failed:", signInError.message);
      return { success: true, redirectTo: "/login", message: "تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول." };
    }

    revalidatePath("/", "layout");
    return { success: true, redirectTo: "/profile" };

  } catch (err: any) {
    console.error("❌ Unexpected error in signUpAction:", err);
    return { error: `خطأ غير متوقع: ${err?.message || "يرجى المحاولة مرة أخرى"}` };
  }
}

// ─── signInAction ─────────────────────────────────────────────────────────────

export async function signInAction(formData: FormData) {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  console.log("🔑 signInAction called:", { email, hasPassword: !!password });

  if (!email || !password) {
    return { error: "البريد الإلكتروني وكلمة المرور مطلوبان" };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.code === "email_not_confirmed") {
        return { error: "يرجى تأكيد بريدك الإلكتروني أولاً" };
      }
      return { error: "البريد الإلكتروني أو كلمة المرور خاطئة" };
    }

    // Check if org_admin is still pending
    const role = data.user?.user_metadata?.role;
    if (role === "org_admin") {
      // Fetch approval status from user_profiles
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("approval_status")
        .eq("id", data.user!.id)
        .single<{ approval_status: string }>();

      if (profile?.approval_status === "pending" || profile?.approval_status === "rejected") {
        revalidatePath("/", "layout");
        return { success: true, redirectTo: "/pending-approval" };
      }
      revalidatePath("/", "layout");
      return { success: true, redirectTo: "/dashboard" };
    }

    if (role === "super_admin") {
      revalidatePath("/", "layout");
      return { success: true, redirectTo: "/admin" };
    }

    revalidatePath("/", "layout");
    return { success: true, redirectTo: "/profile" };

  } catch (err: any) {
    console.error("❌ Unexpected error in signInAction:", err);
    return { error: `خطأ في الاتصال: ${err?.message || "يرجى المحاولة مرة أخرى"}` };
  }
}

// ─── signOutAction ────────────────────────────────────────────────────────────

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { success: true };
}

// ─── getOAuthUrl (Google) ─────────────────────────────────────────────────────

export async function getGoogleOAuthUrl() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });
  if (error) return { error: error.message };
  return { url: data.url };
}
