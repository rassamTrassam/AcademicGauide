// @ts-nocheck
"use server";

import { createAdminClient, createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Ensures the caller is a super_admin securely using the auth context.
 */
export async function verifySuperAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== "super_admin") {
    throw new Error("غير مصرح لك بإجراء هذه العملية.");
  }
  return user;
}

/**
 * Updates a user's role and assigns them to an institution if applicable.
 */
export async function updateUserAccess(userId: string, role: string, institutionId: string | null) {
  try {
    const supabase = await createClient();
    await verifySuperAdmin(supabase);

    const adminClient = await createAdminClient();

    // 1. Update the user's role in auth.users (user_metadata)
    const { error: authError } = await adminClient.auth.admin.updateUserById(userId, {
      user_metadata: { role }
    });

    if (authError) {
      console.error("Error updating auth user metadata:", authError);
      return { error: "حدث خطأ أثناء تحديث صلاحية المستخدم في المصادقة." };
    }

    // 2. Sync role + institution to user_profiles
    // institution_id must be null for super_admin and student — only org_admin gets linked
    const { error: profileError } = await adminClient
      .from("user_profiles")
      .update({
        role: role as any,
        institution_id: role === "org_admin" ? institutionId : null,
        approval_status: "approved" as any,
      } as any)
      .eq("id", userId);

    if (profileError) {
      console.error("Error updating user_profiles:", profileError);
      return { error: "حدث خطأ أثناء ربط المستخدم بالجهة التعليمية." };
    }

    revalidatePath("/admin/users");
    return { success: true, message: "تم تحديث الصلاحيات بنجاح!" };
  } catch (err: any) {
    return { error: err.message || "حدث خطأ غير متوقع." };
  }
}
