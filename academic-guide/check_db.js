const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: users } = await supabase.from('user_profiles').select('id, full_name, email, approval_status').ilike('full_name', '%superadmin%');
  console.log('Profiles with superadmin in name:', users);
}
run();
