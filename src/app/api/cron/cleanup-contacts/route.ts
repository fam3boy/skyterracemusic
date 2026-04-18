import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic'; // Ensure it runs dynamically without being cached

export async function GET(req: Request) {
  try {
    // Check for correct Vercel Cron header to ensure it's triggered securely by Vercel
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update contacts older than 30 days to NULL
    const result = await sql`
      UPDATE song_requests 
      SET requester_contact = NULL 
      WHERE created_at < NOW() - INTERVAL '30 days' 
      AND requester_contact IS NOT NULL
      RETURNING id
    `;

    return NextResponse.json({
      success: true,
      message: `${result.rowCount} records updated and contacts cleared.`,
    });
  } catch (error: any) {
    console.error('Failed to cleanup old contacts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
