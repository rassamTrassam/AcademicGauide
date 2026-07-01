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
console.log('✅ Connected');

// Check user_profiles table schema
const schema = await client.query(`
  SELECT column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'user_profiles'
  ORDER BY ordinal_position;
`);
console.log('\n📋 user_profiles columns:');
console.table(schema.rows);

// Check for any NOT NULL constraints that might fail
const constraints = await client.query(`
  SELECT conname, pg_get_constraintdef(oid) as def
  FROM pg_constraint
  WHERE conrelid = 'public.user_profiles'::regclass;
`);
console.log('\n🔒 Constraints:');
console.table(constraints.rows);

// Try inserting directly to see the error
console.log('\n🧪 Testing direct insert into user_profiles...');
try {
  const testId = '00000000-0000-0000-0000-000000000001';
  const result = await client.query(`
    INSERT INTO user_profiles (id, full_name)
    VALUES ($1, $2)
    ON CONFLICT (id) DO NOTHING
    RETURNING *;
  `, [testId, 'Test User']);
  console.log('Direct insert result:', result.rows);
  
  // Clean up
  await client.query(`DELETE FROM user_profiles WHERE id = $1`, [testId]);
  console.log('✅ Cleaned up test row');
} catch (err) {
  console.log('❌ Direct insert error:', err.message);
}

await client.end();
