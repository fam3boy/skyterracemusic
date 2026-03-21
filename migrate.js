const { createPool } = require('@vercel/postgres');
const fs = require('fs');
const path = require('path');

// Manually load .env.local for local execution if POSTGRES_URL is missing
if (!process.env.POSTGRES_URL) {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[key] = value;
      }
    });
    console.log('Loaded credentials from .env.local');
  }
}

async function migrate() {
  const pool = createPool({
    connectionString: process.env.POSTGRES_URL
  });

  try {
    console.log('Starting migration...');
    // 1. Add image column to theme_tracks
    await pool.query('ALTER TABLE theme_tracks ADD COLUMN IF NOT EXISTS image TEXT;');
    console.log('Added image to theme_tracks');
    
    // 2. Add image column to song_requests
    await pool.query('ALTER TABLE song_requests ADD COLUMN IF NOT EXISTS image TEXT;');
    console.log('Added image to song_requests');

    // 3. Alter ID type to TEXT to support short alphanumeric IDs
    await pool.query('ALTER TABLE song_requests ALTER COLUMN id TYPE TEXT;');
    console.log('Altered song_requests ID type to TEXT');
    
    console.log('Migration successful!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
