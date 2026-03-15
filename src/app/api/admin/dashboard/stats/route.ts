import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const themeId = searchParams.get('theme_id');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const statusFilter = searchParams.get('status');

  try {
    let whereClause = `WHERE r.deleted_at IS NULL`;
    const params: any[] = [];

    if (themeId && themeId !== 'all') {
      params.push(themeId);
      whereClause += ` AND r.theme_id = $${params.length}`;
    }
    if (startDate) {
      params.push(startDate);
      whereClause += ` AND r.created_at >= $${params.length}`;
    }
    if (endDate) {
      params.push(`${endDate} 23:59:59`);
      whereClause += ` AND r.created_at <= $${params.length}`;
    }
    if (statusFilter && statusFilter !== 'all') {
      params.push(statusFilter);
      whereClause += ` AND r.status = $${params.length}`;
    }

    // 1. Core KPIs - Adjust query to include deleted items for counting
    const kpiRes = await sql.query(`
      SELECT 
        COUNT(*)::int as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END)::int as pending,
        COUNT(CASE WHEN status = 'approved' THEN 1 END)::int as approved,
        COUNT(CASE WHEN status = 'hold' THEN 1 END)::int as hold,
        COUNT(CASE WHEN status = 'deleted' OR deleted_at IS NOT NULL THEN 1 END)::int as deleted,
        COUNT(CASE WHEN youtube_url IS NOT NULL AND youtube_url != '' THEN 1 END)::int as with_link
      FROM song_requests r
      ${whereClause.replace('r.deleted_at IS NULL', '1=1')}
    `, params);
    const kpis = kpiRes.rows[0];

    // 2. Daily Trends
    const trendRes = await sql.query(`
      SELECT 
        TO_CHAR(date_trunc('day', r.created_at), 'YYYY-MM-DD') as date,
        COUNT(*)::int as count,
        COUNT(CASE WHEN status = 'approved' THEN 1 END)::int as approved_count
      FROM song_requests r
      ${whereClause}
      GROUP BY 1 ORDER BY 1 ASC
    `, params);

    // 3. Status Distribution
    const statusDist = [
      { name: '대기중', value: kpis.pending, color: '#FACC15' },
      { name: '승인완료', value: kpis.approved, color: '#10B981' },
      { name: '보류중', value: kpis.hold, color: '#3B82F6' },
      { name: '삭제됨', value: kpis.deleted, color: '#EF4444' }
    ];

    // 4. Top 10 Songs
    const topSongsRes = await sql.query(`
      SELECT title, artist, COUNT(*)::int as count
      FROM song_requests r
      ${whereClause}
      GROUP BY 1, 2
      ORDER BY 3 DESC
      LIMIT 10
    `, params);

    // 5. Top 10 Artists
    const topArtistsRes = await sql.query(`
      SELECT artist, COUNT(*)::int as count
      FROM song_requests r
      ${whereClause}
      GROUP BY 1
      ORDER BY 2 DESC
      LIMIT 10
    `, params);

    // 6. Source Distribution
    const sourceDist = [
      { name: '유튜브 링크', value: kpis.with_link },
      { name: '직접 입력', value: kpis.total - kpis.with_link }
    ];

    // 7. Theme Distribution
    const themeDistRes = await sql.query(`
      SELECT t.title as name, COUNT(r.id)::int as value
      FROM monthly_themes t
      LEFT JOIN song_requests r ON t.id = r.theme_id
      ${whereClause.replace('r.deleted_at IS NULL', '1=1').replace('WHERE', 'AND')}
      GROUP BY 1
      ORDER BY 2 DESC
    `, params);

    // 8. Hourly Distribution
    const hourlyRes = await sql.query(`
      SELECT EXTRACT(HOUR FROM created_at)::int as hour, COUNT(*)::int as count
      FROM song_requests r
      ${whereClause}
      GROUP BY 1
      ORDER BY 1 ASC
    `, params);

    // 9. Mail Trends - Fix table and column name
    const mailTrendRes = await sql`
      SELECT TO_CHAR(date_trunc('week', sent_at), 'YYYY-WW') as week, COUNT(*)::int as count
      FROM weekly_mail_logs
      WHERE status = 'success'
      GROUP BY 1 ORDER BY 1 ASC
      LIMIT 8
    `;

    return NextResponse.json({
      kpis: {
        ...kpis,
        approvalRate: kpis.total > 0 ? (kpis.approved / (kpis.total - kpis.deleted || 1)) * 100 : 0,
        deletionRate: kpis.total > 0 ? (kpis.deleted / kpis.total) * 100 : 0,
        linkRate: kpis.total > 0 ? (kpis.with_link / kpis.total) * 100 : 0
      },
      trends: trendRes.rows,
      statusDist,
      sourceDist,
      themeDist: themeDistRes.rows,
      topSongs: topSongsRes.rows,
      topArtists: topArtistsRes.rows,
      hourlyDist: hourlyRes.rows,
      mailTrends: mailTrendRes.rows
    });
  } catch (error: any) {
    console.error('Dashboard Stats Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
