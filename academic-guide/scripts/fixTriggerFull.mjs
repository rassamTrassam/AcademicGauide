import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sijqyfbrkitbdtnksckr.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpanF5ZmJya2l0YmR0bmtzY2tyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTQ2MjE5MSwiZXhwIjoyMDk3MDM4MTkxfQ.oPkfxzvRYmcgw3J3Rc_BxkN8HGBiYSboVEQxrKTYblw';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const client = new pg.Client({
  host: 'aws-1-ap-southeast-2.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.sijqyfbrkitbdtnksckr',
  password: 'Rassam#04353097',
  ssl: { rejectUnauthorized: false }
});

await client.connect();
console.log('✅ Connected\n');

// Check the current trigger function
const triggerCheck = await client.query(`
  SELECT prosrc, proowner::regrole as owner, prosecdef
  FROM pg_proc
  WHERE proname = 'handle_new_user';
`);
console.log('🔧 Current trigger function:');
console.log('Owner:', triggerCheck.rows[0]?.owner);
console.log('Security Definer:', triggerCheck.rows[0]?.prosecdef);
console.log('Source:', triggerCheck.rows[0]?.prosrc?.substring(0, 300));

// Set the trigger owner to postgres (superuser)
console.log('\n🔧 Setting trigger function owner to postgres...');
await client.query(`ALTER FUNCTION handle_new_user() OWNER TO postgres;`);
console.log('✅ Done');

// Recreate trigger with proper permissions
const fixSQL = `
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url)
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
$$;

ALTER FUNCTION handle_new_user() OWNER TO postgres;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
`;

await client.query(fixSQL);
console.log('✅ Trigger recreated with proper permissions!');

await client.end();

// Test user creation
console.log('\n🧪 Testing user creation via admin API...');
const { data, error } = await supabase.auth.admin.createUser({
  email: 'triggertest_' + Date.now() + '@example.com',
  password: 'Test1234!',
  email_confirm: true,
  user_metadata: { name: 'Trigger Test', role: 'student' }
});

if (error) {
  console.log('❌ Still failing:', JSON.stringify(error));
} else {
  console.log('✅ User created successfully! ID:', data.user.id);
  // Clean up
  await supabase.auth.admin.deleteUser(data.user.id);
  console.log('🗑️  Test user cleaned up');
  console.log('\n🎉 TRIGGER IS FIXED! Registration should now work.');
}
