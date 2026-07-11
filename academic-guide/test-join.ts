import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function test() {
  // Use a raw query on programs to see if we can read it
  const { data: pData, error: pError } = await supabase.from("programs").select("id").limit(1);
  console.log("Programs check:", pData?.length, pError);

  // Check the structure of the favorites table
  const { data, error } = await supabase
    .from("favorites")
    .select(`
      program_id,
      programs (*)
    `)
    .limit(1);

  console.log("Favorites join error:", error);
}

test();
