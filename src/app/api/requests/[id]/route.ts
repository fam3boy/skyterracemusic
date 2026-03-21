import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { sql } from '@vercel/postgres';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Support both Legacy UUID and New 8-char Alphanumeric ID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const shortIdRegex = /^[A-Z2-9]{8}$/; // Alphanumeric uppercase 8 chars
    
    if (!uuidRegex.test(id) && !shortIdRegex.test(id)) {
      return NextResponse.json({ error: '잘못된 신청 번호 형식입니다.' }, { status: 400 });
    }

    const result = await sql`
      SELECT * FROM song_requests WHERE id = ${id} LIMIT 1
    `;

    if (result.rowCount === 0) {
      return NextResponse.json({ error: '해당 신청 곡을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Fetch request error:', error);
    return NextResponse.json({ error: '요청을 처리하는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
