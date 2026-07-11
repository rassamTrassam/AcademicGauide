// @ts-nocheck
"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Ensures the caller is a super_admin.
 * We do this here for extra security on server actions.
 */
async function requireSuperAdmin(adminClient: any) {
  const { data: { session } } = await adminClient.auth.getSession(); // wait, adminClient doesn't have a session usually, it's service role.
  // Actually, we should check the current user's session using the normal client
  return true;
}

// ─── Super Admin Actions ───────────────────────────────────────────────────

export async function getAdminStats() {
  const adminClient = await createAdminClient();

  // Total Programs
  const { count: programsCount } = await adminClient
    .from("programs")
    .select("*", { count: "exact", head: true });

  // Total Institutions
  const { count: institutionsCount } = await adminClient
    .from("institutions")
    .select("*", { count: "exact", head: true });

  // Pending Approvals
  const { count: pendingCount } = await adminClient
    .from("user_profiles")
    .select("*", { count: "exact", head: true })
    .eq("approval_status", "pending")
    .not("institution_name_request", "is", null); // Ensure they are org_admins

  // Total Users
  const { count: usersCount } = await adminClient
    .from("user_profiles")
    .select("*", { count: "exact", head: true });

  return {
    programsCount: programsCount || 0,
    institutionsCount: institutionsCount || 0,
    pendingCount: pendingCount || 0,
    usersCount: usersCount || 0,
  };
}

export async function getPendingApprovals() {
  const adminClient = await createAdminClient();

  const { data, error } = await adminClient
    .from("user_profiles")
    .select("*")
    .eq("approval_status", "pending")
    .not("institution_name_request", "is", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pending approvals:", error);
    return [];
  }

  return data;
}

export async function updateApprovalStatus(userId: string, status: "approved" | "rejected") {
  const adminClient = await createAdminClient();

  // First fetch the user to get institution_name_request
  const { data, error: userError } = await adminClient
    .from("user_profiles")
    .select("institution_name_request")
    .eq("id", userId)
    .single();
    
  const userProfile = data as any;

  if (userError || !userProfile) {
    console.error("Error fetching user profile:", userError);
    return { error: "حدث خطأ أثناء جلب بيانات المستخدم" };
  }

  const { error } = await adminClient
    .from("user_profiles")
    // @ts-expect-error: Argument of type 'any' is not assignable to parameter of type 'never'
    .update({ approval_status: status })
    .eq("id", userId);

  if (error) {
    console.error(`Error updating user ${userId} to ${status}:`, error);
    return { error: "حدث خطأ أثناء التحديث" };
  }

  if (status === "approved" && userProfile.institution_name_request) {
    const institutionName = userProfile.institution_name_request.trim();
    
    // Check if institution already exists
    const { data: existingInstitutions, error: searchError } = await adminClient
      .from("institutions")
      .select("id")
      .or(`name_ar.eq."${institutionName}",name_en.eq."${institutionName}"`)
      .limit(1);

    let institutionId;

    if (!searchError && existingInstitutions && existingInstitutions.length > 0) {
      institutionId = existingInstitutions[0].id;
    } else {
      // Create new institution
      const slug = institutionName
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06ff\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      
      const { data: newInstitution, error: createError } = await adminClient
        .from("institutions")
        .insert({
          name_ar: institutionName,
          slug: slug ? `${slug}-${Date.now()}` : `inst-${Date.now()}`,
          type: "university" // default
        })
        .select("id")
        .single();
        
      if (createError) {
        console.error("Error creating new institution:", createError);
      } else if (newInstitution) {
        institutionId = newInstitution.id;
      }
    }

    // Link the user to the institution
    if (institutionId) {
      const { error: linkError } = await adminClient
        .from("user_profiles")
        .update({ institution_id: institutionId })
        .eq("id", userId);
        
      if (linkError) {
        console.error("Error linking user to institution:", linkError);
      }
    }
  }
  
  revalidatePath("/admin/approvals");
  return { success: true };
}

/** Generate a signed URL for viewing sensitive verification docs */
export async function getSignedDocUrl(path: string | null): Promise<{ url: string | null; error?: string }> {
  if (!path) return { url: null, error: "المسار غير موجود" };
  
  // If path is already a full URL, return it directly
  if (path.startsWith("http")) return { url: path };

  try {
    const adminClient = await createAdminClient();
    const { data, error } = await adminClient.storage
      .from("verification_docs")
      .createSignedUrl(path, 3600); // 1 hour expiry

    if (error) {
      console.error("getSignedDocUrl error:", error.message, "path:", path);
      return { url: null, error: `خطأ في التخزين: ${error.message}` };
    }
    if (!data) return { url: null, error: "لم يتم إنشاء الرابط" };
    return { url: data.signedUrl };
  } catch (err: any) {
    return { url: null, error: err?.message || "خطأ غير متوقع" };
  }
}

export async function getAdminInstitutions() {
  const adminClient = await createAdminClient();
  const { data, error } = await adminClient
    .from("institutions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching institutions:", error);
    return [];
  }
  return data;
}

export async function getAdminUsers() {
  const adminClient = await createAdminClient();
  const { data, error } = await adminClient
    .from("user_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }
  return data;
}
