import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const resTemplates = await sql`UPDATE admin_templates SET type = 'REJECT' WHERE type = 'HOLD' RETURNING id`;
    const resRequests = await sql`UPDATE song_requests SET status = 'rejected' WHERE status = 'hold' RETURNING id`;
    return NextResponse.json({
      templatesMigrated: resTemplates.rowCount,
      requestsMigrated: resRequests.rowCount,
      success: true
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
