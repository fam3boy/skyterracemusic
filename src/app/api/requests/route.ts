import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, artist, youtube_url, story, requester_name, requester_contact } = body;

    // Rate Limiting (Throttling) - Wrapped in try-catch to prevent failure if table is missing
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    try {
      const throttleRes = await sql`
        SELECT * FROM request_throttles WHERE ip_address = ${ip}
      `;

      const now = new Date();
      if (throttleRes.rowCount > 0) {
        const throttle = throttleRes.rows[0];
        const lastRequest = new Date(throttle.last_request_at);
        const diffMs = now.getTime() - lastRequest.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < 1 && throttle.request_count >= 3) {
          return NextResponse.json({ 
            error: '짧은 시간 동안 너무 많은 신청을 하셨습니다. 잠시 후 다시 시도해주세요.' 
          }, { status: 429 });
        }

        if (diffHours >= 1) {
          await sql`UPDATE request_throttles SET request_count = 1, last_request_at = ${now.toISOString()} WHERE ip_address = ${ip}`;
        } else {
          await sql`UPDATE request_throttles SET request_count = request_count + 1, last_request_at = ${now.toISOString()} WHERE ip_address = ${ip}`;
        }
      } else {
        await sql`INSERT INTO request_throttles (ip_address) VALUES (${ip})`;
      }
    } catch (e) {
      console.warn('Throttling check bypassed (table might be missing):', e);
    }

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
