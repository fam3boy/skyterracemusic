import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Add image column to theme_tracks
    await sql`ALTER TABLE theme_tracks ADD COLUMN IF NOT EXISTS image TEXT;`;
    
    // 2. Add image column to song_requests
    await sql`ALTER TABLE song_requests ADD COLUMN IF NOT EXISTS image TEXT;`;
    
    return NextResponse.json({ message: "Successfully added image column to theme_tracks and song_requests." });
  } catch (error: any) {
    console.error('Migration failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
