const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: "./academic-guide/.env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in academic-guide/.env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createSuperAdmin() {
  const email = "superadmin@gmail.com";
  const password = "admin123";

  console.log(`Creating Super Admin: ${email}...`);

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name: "Super Admin",
      role: "super_admin",
    },
  });

  if (error) {
    if (error.message.includes("already exists") || error.message.includes("already been registered")) {
      console.log(`✅ Super Admin account ${email} already exists.`);
    } else {
      console.error("❌ Failed to create Super Admin:", error.message);
    }
  } else {
    console.log(`✅ Super Admin created successfully!`);
    console.log(`User ID: ${data.user.id}`);
  }
}

createSuperAdmin();
