import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const pendingRes = await sql`SELECT COUNT(*)::int FROM song_requests WHERE status = 'pending'`;
    const approvedRes = await sql`SELECT COUNT(*)::int FROM song_requests WHERE status = 'approved'`;
    const activeThemeRes = await sql`SELECT * FROM monthly_themes WHERE is_active = true LIMIT 1`;

    return NextResponse.json({
      pending: pendingRes.rows[0].count,
      approvedTotal: approvedRes.rows[0].count,
      activeTheme: activeThemeRes.rows[0] || null
    });
  } catch (error: any) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
