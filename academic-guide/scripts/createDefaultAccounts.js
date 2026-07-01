const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: "./.env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createDefaultAccounts() {
  console.log("Fetching existing institutions...");
  const { data: institutions, error: instError } = await supabase
    .from("institutions")
    .select("id, name_ar, slug");

  if (instError || !institutions) {
    console.error("Failed to fetch institutions:", instError);
    process.exit(1);
  }

  console.log(`Found ${institutions.length} institutions.`);

  for (const inst of institutions) {
    const email = `${inst.slug}@gmail.com`;
    const password = "123456";

    console.log(`\nProcessing ${inst.name_ar} (${email})...`);

    // Create user in Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: `ممثل ${inst.name_ar}`,
        role: "org_admin",
        full_name: `ممثل ${inst.name_ar}`,
      },
    });

    let userId = null;

    if (authError) {
      if (authError.message.includes("already exists") || authError.message.includes("already been registered")) {
        console.log(`User ${email} already exists.`);
        // Try to fetch existing user id by email
        // Wait, supabase admin API doesn't have a direct getUserByEmail, we can list users or we might just assume it's there
        // Actually, let's list users and find it
        const { data: usersData } = await supabase.auth.admin.listUsers();
        const existingUser = usersData.users.find(u => u.email === email);
        if (existingUser) {
          userId = existingUser.id;
        }
      } else {
        console.error(`❌ Failed to create user for ${inst.name_ar}:`, authError.message);
        continue;
      }
    } else {
      console.log(`✅ User created for ${inst.name_ar}.`);
      userId = authData.user.id;
    }

    if (userId) {
      // Ensure user_profiles is updated with institution_id and approved status
      console.log(`Linking user ${userId} to institution ${inst.id}...`);
      
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          approval_status: "approved",
          institution_id: inst.id
        })
        .eq("id", userId);

      if (profileError) {
        console.error(`❌ Failed to update profile for ${email}:`, profileError.message);
      } else {
        console.log(`✅ Profile updated and linked successfully.`);
      }
    }
  }

  console.log("\nFinished processing all institutions.");
}

createDefaultAccounts();
