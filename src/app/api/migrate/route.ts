import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Add image column to theme_tracks
    await sql`ALTER TABLE theme_tracks ADD COLUMN IF NOT EXISTS image TEXT;`;
    
    // 3. Alter ID type to TEXT to support short alphanumeric IDs
    await sql`ALTER TABLE song_requests ALTER COLUMN id TYPE TEXT;`;
    
    return NextResponse.json({ message: "Successfully migrated schema for short IDs and image columns." });
  } catch (error: any) {
    console.error('Migration failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
