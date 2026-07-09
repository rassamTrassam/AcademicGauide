const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = "postgresql://postgres.sijqyfbrkitbdtnksckr:Rassam%2304353097@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres";

async function runMigration() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const filePath = path.join(__dirname, '..', 'supabase', 'migrations', '20260709193400_add_contact_message_status.sql');
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log("Applying add_contact_message_status migration...");
    await client.query(sql);
    console.log("✅ migration applied successfully!");
  } catch (err) {
    console.error("❌ Failed:", err.message);
  } finally {
    await client.end();
  }
}

runMigration();
