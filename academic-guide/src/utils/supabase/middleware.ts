import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

/**
 * Supabase middleware client — يُحدّث جلسة المستخدم في كل طلب
 * Updates the session cookie on every request to keep auth state fresh.
 * Also enforces:
 *  - Protected route redirect for unauthenticated users
 *  - Pending org_admin redirect away from /dashboard
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — IMPORTANT: do not remove this
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ── 1. Unauthenticated users blocked from protected paths ──────────────────
  const protectedPaths = ["/profile", "/favorites", "/dashboard"];
  const isProtectedPath = protectedPaths.some((p) => pathname.startsWith(p));

  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // ── 2. Pending org_admin blocked from /dashboard ───────────────────────────
  // Only check on /dashboard routes to avoid extra DB calls on every page
  if (user && pathname.startsWith("/dashboard")) {
    const role = user.user_metadata?.role;

    if (role === "org_admin") {
      // Fetch approval status from user_profiles
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("approval_status")
        .eq("id", user.id)
        .single<{ approval_status: string }>();

      if (profile?.approval_status === "pending" || profile?.approval_status === "rejected") {
        const url = request.nextUrl.clone();
        url.pathname = "/pending-approval";
        return NextResponse.redirect(url);
      }
    }
  }

  // ── 3. Prevent logged-in users from accessing /pending-approval if approved
  if (user && pathname === "/pending-approval") {
    const role = user.user_metadata?.role;
    if (role !== "org_admin") {
      // Students have no business on the pending page
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
