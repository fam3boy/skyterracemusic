import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Add image column to theme_tracks
    await sql`ALTER TABLE theme_tracks ADD COLUMN IF NOT EXISTS image TEXT;`;
    
    // 4. Update weekly_mail_logs schema
    await sql`ALTER TABLE weekly_mail_logs ADD COLUMN IF NOT EXISTS summary_data JSONB;`;
    await sql`ALTER TABLE weekly_mail_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`;
    
    return NextResponse.json({ message: "Successfully migrated schema for short IDs, images, and reports." });
  } catch (error: any) {
    console.error('Migration failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
