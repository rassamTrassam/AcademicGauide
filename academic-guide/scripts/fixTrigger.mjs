import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sijqyfbrkitbdtnksckr.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpanF5ZmJya2l0YmR0bmtzY2tyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTQ2MjE5MSwiZXhwIjoyMDk3MDM4MTkxfQ.oPkfxzvRYmcgw3J3Rc_BxkN8HGBiYSboVEQxrKTYblw';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const sql = `
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $func$
BEGIN
  INSERT INTO user_profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$func$;
`;

console.log('🔧 Fixing handle_new_user trigger...');

const { data, error } = await supabase.rpc('exec', { sql });

if (error) {
  console.log('⚠️  RPC exec not available, trying direct query...');
  
  // Alternative: use pg library directly
  const { default: pg } = await import('pg');
  const client = new pg.Client({
    connectionString: 'postgresql://postgres.sijqyfbrkitbdtnksckr:Rassam%2304353097@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  console.log('✅ Connected to PostgreSQL');
  
  await client.query(sql);
  console.log('✅ Trigger fixed successfully!');
  
  // Test by creating a user
  const testResult = await supabase.auth.admin.createUser({
    email: 'fixtest@example.com',
    password: 'Test1234!',
    email_confirm: true,
    user_metadata: { name: 'Fix Test', role: 'student' }
  });
  
  console.log('🧪 Test user creation:', testResult.error ? `❌ ${testResult.error.message}` : `✅ Success! ID: ${testResult.data?.user?.id}`);
  
  // Clean up test user
  if (testResult.data?.user?.id) {
    await supabase.auth.admin.deleteUser(testResult.data.user.id);
    console.log('🗑️  Test user cleaned up');
  }
  
  await client.end();
} else {
  console.log('✅ Trigger fixed via RPC!');
}
