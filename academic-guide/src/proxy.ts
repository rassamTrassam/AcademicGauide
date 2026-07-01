import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * proxy.ts — Yemen Educational Marketplace
 * Main routing proxy / middleware.
 *
 * Responsibilities:
 *  1. Refresh Supabase session on every request (@supabase/ssr requirement)
 *  2. Block unauthenticated users from protected routes
 *  3. Redirect logged-in users away from auth pages (login/register)
 *  4. Enforce dashboard access: org_admin only + approved status
 *  5. Redirect pending/rejected org_admins to /pending-approval
 */
export async function proxy(request: NextRequest) {
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

  // ── Refresh session (IMPORTANT: do not remove) ────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const path = url.pathname;
  const role = user?.user_metadata?.role || "student";

  // ── 1. Redirect logged-in users away from auth pages ─────────────────────
  if (user && (path.startsWith("/login") || path.startsWith("/register"))) {
    if (role === "org_admin") {
      // Check if pending first
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("approval_status")
        .eq("id", user.id)
        .single<{ approval_status: string }>();

      url.pathname =
        profile?.approval_status === "pending" || profile?.approval_status === "rejected"
          ? "/pending-approval"
          : "/dashboard";
    } else {
      url.pathname = "/profile";
    }
    return NextResponse.redirect(url);
  }

  // ── 2. Dashboard access control ───────────────────────────────────────────
  if (path.startsWith("/dashboard")) {
    // Not logged in
    if (!user) {
      url.pathname = "/login";
      url.searchParams.set("redirectTo", path);
      return NextResponse.redirect(url);
    }

    // Not an org_admin
    if (role !== "org_admin") {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    // Org_admin but pending/rejected — fetch status only on dashboard routes
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("approval_status")
      .eq("id", user.id)
      .single<{ approval_status: string }>();

    if (
      profile?.approval_status === "pending" ||
      profile?.approval_status === "rejected"
    ) {
      url.pathname = "/pending-approval";
      return NextResponse.redirect(url);
    }
  }

  // ── 3. Block non-org_admin users from /pending-approval ──────────────────
  if (path === "/pending-approval" && user && role !== "org_admin") {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // ── 4. Block unauthenticated from /favorites, /profile ───────────────────
  const privateRoutes = ["/favorites", "/profile"];
  if (!user && privateRoutes.some((r) => path.startsWith(r))) {
    url.pathname = "/login";
    url.searchParams.set("redirectTo", path);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - static assets (svg, png, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
