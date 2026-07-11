import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function test() {
  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .limit(10);

  console.log("Error:", error);
  console.log("Favorites table:", data);
}

test();
