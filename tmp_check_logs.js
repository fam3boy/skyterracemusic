const { sql } = require('@vercel/postgres');
require('dotenv').config({ path: '.env.local' });

async function checkLogs() {
  try {
    const result = await sql`SELECT status, recipient_email, error_message, created_at FROM weekly_mail_logs ORDER BY created_at DESC LIMIT 5;`;
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error('Error querying logs:', error);
  }
}

checkLogs();
