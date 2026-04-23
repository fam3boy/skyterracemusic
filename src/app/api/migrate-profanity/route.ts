import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

const PROFANITY_DB = [
  'ㅅㅂ', '시발', '씨발', '개새끼', '존나', '병신', '미친', '지랄', '염병', '새끼',
  'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy',
  '한남', '김치녀', '된장녀', '맘충', '틀딱', '일베', '메갈', '이기야', '노무노무',
  '조센징', '짱깨', '쪽발이',
  '좌파', '우파', '빨갱이', '친일파', '문재인', '윤석열', '이재명', '김대중', '노무현', '박정희', '전두환',
  '신천지', '개독', '예수쟁이', '알라'
];

export async function GET() {
  try {
    for (const word of PROFANITY_DB) {
      await sql`
        INSERT INTO banned_patterns (type, pattern)
        VALUES ('WORD', ${word})
        ON CONFLICT DO NOTHING
      `;
    }
    return NextResponse.json({ success: true, count: PROFANITY_DB.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
