const { createPool } = require('@vercel/postgres');

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
    
    console.log('Migration successful!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
