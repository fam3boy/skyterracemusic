import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const themeRes = await sql`
      SELECT id, title, description, background_base64 
      FROM monthly_themes 
      WHERE is_active = true 
      AND deleted_at IS NULL 
      LIMIT 1
    `;
    return NextResponse.json(themeRes.rows[0] || null);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
