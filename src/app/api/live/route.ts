import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Fetch the recently approved requests
    const res = await sql`
      SELECT id, title, artist, story, requester_name, image, youtube_url, approved_at 
      FROM song_requests 
      WHERE status = 'approved' 
      ORDER BY approved_at ASC 
      LIMIT ${limit}
    `;

    return NextResponse.json(res.rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
