import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await sql`SELECT key, value FROM system_settings WHERE key IN ('logo_mode', 'logo_base64', 'brand_text', 'current_theme')`;
    
    const settings = result.rows.reduce((acc: any, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Public branding fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch branding settings' }, { status: 500 });
  }
}
