import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, artist, youtube_url, story, requester_name, requester_contact } = body;

    // Get active theme
    const themeRes = await sql`
      SELECT id FROM monthly_themes WHERE is_active = true LIMIT 1
    `;
    const themeId = themeRes.rows[0]?.id;

    const result = await sql`
      INSERT INTO song_requests (
        theme_id, title, artist, youtube_url, story, requester_name, requester_contact, status
      ) VALUES (
        ${themeId}, ${title}, ${artist}, ${youtube_url}, ${story}, ${requester_name}, ${requester_contact}, 'pending'
      )
      RETURNING id
    `;

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Request submission error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const themeId = searchParams.get('theme_id');
  const title = searchParams.get('title');
  const artist = searchParams.get('artist');

  if (themeId && title && artist) {
    const result = await sql`
      SELECT id FROM song_requests 
      WHERE theme_id = ${themeId} 
      AND title ILIKE ${title} 
      AND artist ILIKE ${artist} 
      AND status != 'deleted'
      LIMIT 1
    `;
    
    // Also check theme_tracks
    const trackResult = await sql`
      SELECT id FROM theme_tracks 
      WHERE theme_id = ${themeId} 
      AND title ILIKE ${title} 
      AND artist ILIKE ${artist}
      LIMIT 1
    `;

    return NextResponse.json({ 
      isDuplicate: result.rowCount > 0 || trackResult.rowCount > 0 
    });
  }

  return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
}
