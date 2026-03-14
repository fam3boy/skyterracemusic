import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const result = await sql`
      SELECT * FROM song_requests WHERE id = ${id} LIMIT 1
    `;

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Fetch request error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
