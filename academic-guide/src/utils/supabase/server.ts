import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Supabase server client — استخدم هذا في Server Components و Route Handlers
 * Use this in Server Components, Server Actions, and Route Handlers
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — cookies can only be set in middleware or Route Handlers
          }
        },
      },
    }
  );
}

/**
 * Supabase admin client — للعمليات الإدارية (تجاوز RLS)
 * Use ONLY in server-side code. Never expose SERVICE_ROLE_KEY to the client.
 */
export async function createAdminClient() {
  const { createClient: createSupabaseAdminClient } = await import(
    "@supabase/supabase-js"
  );
  return createSupabaseAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
