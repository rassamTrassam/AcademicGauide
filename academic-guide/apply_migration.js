const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = "postgresql://postgres.sijqyfbrkitbdtnksckr:Rassam%2304353097@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres";

async function runMigration() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const filePath = path.join(__dirname, '..', 'supabase', 'migrations', '20260704000000_fix_contact_rls.sql');
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log("Applying fix_contact_rls migration...");
    await client.query(sql);
    console.log("✅ fix_contact_rls applied successfully!");
  } catch (err) {
    console.error("❌ Failed:", err.message);
  } finally {
    await client.end();
  }
}

runMigration();
