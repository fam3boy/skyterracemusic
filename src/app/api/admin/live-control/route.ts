import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, action } = await req.json();

    if (!id || action !== 'play_next') {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Mark the current track as "played" so it drops from the Live Queue
    await sql`
      UPDATE song_requests 
      SET status = 'played' 
      WHERE id = ${id} AND status = 'approved'
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
