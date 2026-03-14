import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. All Status Counts
    const countsRes = await sql`
      SELECT 
        status, 
        COUNT(*)::int as count 
      FROM song_requests 
      GROUP BY status
    `;
    
    const counts = {
      pending: 0,
      approved: 0,
      hold: 0,
      deleted: 0,
      total: 0
    };

    countsRes.rows.forEach(row => {
      if (row.status in counts) {
        counts[row.status as keyof typeof counts] = row.count;
      }
      counts.total += row.count;
    });

    // 2. Active Theme
    const activeThemeRes = await sql`SELECT * FROM monthly_themes WHERE is_active = true LIMIT 1`;

    // 3. Weekly Approvals (Current Window)
    const now = new Date();
    const dayOfWeek = now.getDay(); 
    const nextThursday = new Date(now);
    nextThursday.setHours(19, 0, 0, 0);
    
    // If today is Thursday but before 19:00, nextThursday is today 19:00.
    // If today is Friday, nextThursday should be next Thursday.
    if (dayOfWeek > 4 || (dayOfWeek === 4 && now.getHours() >= 19)) {
       nextThursday.setDate(nextThursday.getDate() + (11 - dayOfWeek));
    } else {
       nextThursday.setDate(nextThursday.getDate() + (4 - dayOfWeek));
    }
    
    const startOfWindow = new Date(nextThursday);
    startOfWindow.setDate(startOfWindow.getDate() - 7);

    const weeklyApprovedRes = await sql`
      SELECT COUNT(*)::int 
      FROM song_requests 
      WHERE status = 'approved' 
      AND approved_at >= ${startOfWindow.toISOString()} 
      AND approved_at < ${nextThursday.toISOString()}
    `;

    return NextResponse.json({
      ...counts,
      approvedTotal: counts.approved, // For backward compatibility
      weeklyApproved: weeklyApprovedRes.rows[0].count,
      activeTheme: activeThemeRes.rows[0] || null
    });
  } catch (error: any) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
