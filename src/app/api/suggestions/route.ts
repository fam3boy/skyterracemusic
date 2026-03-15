import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');

    if (!q || q.length < 2) {
      return NextResponse.json([]);
    }

    // Search in theme_tracks (current theme) and recently approved song_requests
    const result = await sql`
      WITH combined AS (
        SELECT title, artist FROM theme_tracks
        UNION
        SELECT title, artist FROM song_requests WHERE status = 'approved'
      )
      SELECT DISTINCT title, artist 
      FROM combined
      WHERE title ILIKE ${'%' + q + '%'} 
      OR artist ILIKE ${'%' + q + '%'}
      LIMIT 10
    `;

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Fetch suggestions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
