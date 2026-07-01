// @ts-nocheck
"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

// Helper to generate a slug
function generateSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Helper to upload a file to program-assets
async function uploadProgramAsset(
  supabase: any,
  institutionId: string,
  programId: string,
  file: File,
  type: "cover" | "study_plan"
): Promise<string | null> {
  try {
    const ext = file.name.split(".").pop() || (type === "cover" ? "jpg" : "pdf");
    const path = `${institutionId}/${programId}-${type}-${Date.now()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from("program-assets")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error(`❌ File upload failed [${type}]:`, error.message);
      return null;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("program-assets")
      .getPublicUrl(path);

    return publicUrlData.publicUrl;
  } catch (err: any) {
    console.error(`❌ Upload error [${type}]:`, err?.message);
    return null;
  }
}

// ─── Verify Org Admin ────────────────────────────────────────────────────────
async function verifyOrgAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("يجب تسجيل الدخول كجهة تعليمية.");
  }

  // Check Super Admin first
  if (user.user_metadata?.role === "super_admin") {
    return { userId: user.id, institutionId: null, isSuperAdmin: true };
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("institution_id, approval_status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.approval_status !== "approved" || !profile.institution_id) {
    throw new Error("ليس لديك صلاحية لإدارة البرامج.");
  }

  return { userId: user.id, institutionId: profile.institution_id, isSuperAdmin: false };
}

// ─── Create Program ─────────────────────────────────────────────────────────

export async function createProgram(formData: FormData) {
  try {
    const supabase = await createClient();
    const { institutionId: orgInstitutionId, isSuperAdmin } = await verifyOrgAdmin(supabase);

    // If super admin, they MUST provide an institution_id from the form
    const institutionId = isSuperAdmin 
      ? formData.get("institution_id")?.toString()
      : orgInstitutionId;

    if (!institutionId) {
      return { error: "يرجى تحديد الجهة التعليمية." };
    }

    const title_ar = formData.get("title_ar")?.toString().trim();
    if (!title_ar) return { error: "اسم البرنامج مطلوب" };

    const description_ar = formData.get("description_ar")?.toString().trim() || null;
    const degree_level = formData.get("degree_level")?.toString() || "bachelor";
    const status = formData.get("status")?.toString() || "draft";
    
    // JSONB metadata fields
    const study_type = formData.get("study_type")?.toString().trim();
    const fees = formData.get("fees")?.toString().trim();
    const duration = formData.get("duration")?.toString().trim();

    const metadata: Record<string, any> = {};
    if (study_type) metadata.study_style = study_type;
    if (fees) metadata.fees_raw = fees;
    if (duration) metadata.duration_raw = duration;

    const programId = randomUUID();
    const slug = generateSlug(title_ar);

    // Handle files
    const coverFile = formData.get("cover_image") as File | null;
    const planFile = formData.get("study_plan_pdf") as File | null;

    let cover_image_url = null;
    let study_plan_pdf_url = null;

    if ((coverFile && coverFile.size > 0) || (planFile && planFile.size > 0)) {
      const adminClient = await createAdminClient();
      
      if (coverFile && coverFile.size > 0) {
        cover_image_url = await uploadProgramAsset(adminClient, institutionId, programId, coverFile, "cover");
      }
      if (planFile && planFile.size > 0) {
        study_plan_pdf_url = await uploadProgramAsset(adminClient, institutionId, programId, planFile, "study_plan");
      }
    }

    const { error } = await supabase.from("programs").insert({
      id: programId,
      institution_id: institutionId,
      title_ar,
      slug,
      description_ar,
      degree_level,
      status,
      metadata,
      cover_image_url,
      study_plan_pdf_url,
    });

    if (error) {
      console.error("Insert Error:", error);
      return { error: "حدث خطأ أثناء حفظ البرنامج. يرجى المحاولة لاحقاً." };
    }

    revalidatePath("/dashboard/programs");
    revalidatePath("/admin/programs");
    revalidatePath("/programs");
    return { success: true, message: "تم إضافة البرنامج بنجاح!" };
  } catch (err: any) {
    console.error("Create Program Error:", err);
    return { error: err.message || "حدث خطأ غير متوقع." };
  }
}

// ─── Update Program ─────────────────────────────────────────────────────────

export async function updateProgram(programId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { institutionId: orgInstitutionId, isSuperAdmin } = await verifyOrgAdmin(supabase);

    // Verify ownership
    const { data: existingProgram, error: fetchError } = await supabase
      .from("programs")
      .select("institution_id, metadata, cover_image_url, study_plan_pdf_url")
      .eq("id", programId)
      .single();

    if (fetchError || !existingProgram) {
      return { error: "البرنامج غير موجود." };
    }
    
    if (!isSuperAdmin && existingProgram.institution_id !== orgInstitutionId) {
      return { error: "لا يمكنك تعديل برنامج لا يتبع لمؤسستك." };
    }

    // Determine the final institution ID
    // If Super Admin changes it, use the new one, else keep the existing one
    const institutionId = isSuperAdmin 
      ? (formData.get("institution_id")?.toString() || existingProgram.institution_id)
      : orgInstitutionId;

    const title_ar = formData.get("title_ar")?.toString().trim();
    if (!title_ar) return { error: "اسم البرنامج مطلوب" };

    const description_ar = formData.get("description_ar")?.toString().trim() || null;
    const degree_level = formData.get("degree_level")?.toString() || "bachelor";
    const status = formData.get("status")?.toString() || "draft";
    
    // JSONB metadata fields - Merge without overwriting
    const study_type = formData.get("study_type")?.toString().trim();
    const fees = formData.get("fees")?.toString().trim();
    const duration = formData.get("duration")?.toString().trim();

    const metadata: Record<string, any> = { ...existingProgram.metadata };
    
    if (study_type) metadata.study_style = study_type;
    else delete metadata.study_style;
    
    if (fees) metadata.fees_raw = fees;
    else delete metadata.fees_raw;

    if (duration) metadata.duration_raw = duration;
    else delete metadata.duration_raw;

    // Handle files
    const coverFile = formData.get("cover_image") as File | null;
    const planFile = formData.get("study_plan_pdf") as File | null;

    let cover_image_url = existingProgram.cover_image_url;
    let study_plan_pdf_url = existingProgram.study_plan_pdf_url;

    if ((coverFile && coverFile.size > 0) || (planFile && planFile.size > 0)) {
      const adminClient = await createAdminClient();
      
      if (coverFile && coverFile.size > 0) {
        cover_image_url = await uploadProgramAsset(adminClient, institutionId, programId, coverFile, "cover");
      }
      if (planFile && planFile.size > 0) {
        study_plan_pdf_url = await uploadProgramAsset(adminClient, institutionId, programId, planFile, "study_plan");
      }
    }

    const { error } = await supabase
      .from("programs")
      .update({
        institution_id: institutionId,
        title_ar,
        slug: generateSlug(title_ar),
        description_ar,
        degree_level,
        status,
        metadata,
        cover_image_url,
        study_plan_pdf_url,
        updated_at: new Date().toISOString()
      })
      .eq("id", programId);

    if (error) {
      console.error("Update Error:", error);
      return { error: "حدث خطأ أثناء تحديث البرنامج. يرجى المحاولة لاحقاً." };
    }

    revalidatePath("/dashboard/programs");
    revalidatePath("/admin/programs");
    revalidatePath(`/programs/${programId}`);
    return { success: true, message: "تم تحديث البرنامج بنجاح!" };
  } catch (err: any) {
    console.error("Update Program Error:", err);
    return { error: err.message || "حدث خطأ غير متوقع." };
  }
}

// ─── Delete Program ─────────────────────────────────────────────────────────

export async function deleteProgram(programId: string) {
  try {
    const supabase = await createClient();
    const { institutionId: orgInstitutionId, isSuperAdmin } = await verifyOrgAdmin(supabase);

    // Verify ownership implicitly via RLS and explicit check
    const { data: existingProgram } = await supabase
      .from("programs")
      .select("institution_id")
      .eq("id", programId)
      .single();

    if (!existingProgram) return { error: "البرنامج غير موجود." };
    if (!isSuperAdmin && existingProgram.institution_id !== orgInstitutionId) {
      return { error: "لا تملك صلاحية لحذف هذا البرنامج." };
    }

    const { error } = await supabase
      .from("programs")
      .delete()
      .eq("id", programId);

    if (error) {
      console.error("Delete Error:", error);
      return { error: "حدث خطأ أثناء حذف البرنامج." };
    }

    revalidatePath("/dashboard/programs");
    revalidatePath("/admin/programs");
    revalidatePath("/programs");
    return { success: true, message: "تم حذف البرنامج بنجاح!" };
  } catch (err: any) {
    console.error("Delete Program Error:", err);
    return { error: err.message || "حدث خطأ غير متوقع." };
  }
}
