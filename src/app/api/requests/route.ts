import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

function generateShortId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Readable chars (no I, O, 0, 1)
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, artist, youtube_url, story, requester_name, requester_contact, image, captchaToken } = body;

    // 1. Fetch banned words from DB and check for profanity
    const bannedRes = await sql`SELECT pattern FROM banned_patterns WHERE type = 'WORD'`;
    let bannedWords = bannedRes.rows.map(r => r.pattern.toLowerCase());
    
    // Auto-seed initial dictionary if DB is empty (Self-healing migration)
    if (bannedWords.length === 0) {
      const INITIAL_DB = ['ㅅㅂ', '시발', '씨발', '개새끼', '존나', '병신', '미친', '지랄', '염병', '새끼', 'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', '한남', '김치녀', '된장녀', '맘충', '틀딱', '일베', '메갈', '이기야', '노무노무', '조센징', '짱깨', '쪽발이', '좌파', '우파', '빨갱이', '친일파', '문재인', '윤석열', '이재명', '김대중', '노무현', '박정희', '전두환', '신천지', '개독', '예수쟁이', '알라'];
      for (const word of INITIAL_DB) {
        try {
          await sql`INSERT INTO banned_patterns (type, pattern) VALUES ('WORD', ${word})`;
        } catch(e) { } // Ignore duplicates if constrained
      }
      bannedWords = INITIAL_DB;
    }

    const textToCheck = `${title} ${artist} ${story || ''} ${requester_name || ''}`.toLowerCase();
    const hasProfanity = bannedWords.some(word => textToCheck.includes(word));

    if (hasProfanity) {
      return NextResponse.json({ error: '신청 내용에 가이드라인 위반 단어(금칙어)가 포함되어 있어 접수할 수 없습니다.' }, { status: 400 });
    }

    // Verify Turnstile CAPTCHA
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';
    try {
      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${encodeURIComponent(turnstileSecret)}&response=${encodeURIComponent(captchaToken || '')}`
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return NextResponse.json({ error: '스팸 방지 인증에 실패했습니다. 다시 시도해 주세요.' }, { status: 400 });
      }
    } catch (e) {
      console.error('Turnstile verification error:', e);
      return NextResponse.json({ error: '캡챠 인증 통신에 실패했습니다.' }, { status: 500 });
    }

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

    const requestId = generateShortId();

    const result = await sql`
      INSERT INTO song_requests (
        id, theme_id, title, artist, youtube_url, story, requester_name, requester_contact, status, image
      ) VALUES (
        ${requestId}, ${themeId}, ${title}, ${artist}, ${youtube_url}, ${story}, ${requester_name}, ${requester_contact}, 'pending', ${image}
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

  return NextResponse.json({ error: '필수 파라미터가 누락되었습니다' }, { status: 400 });
}
