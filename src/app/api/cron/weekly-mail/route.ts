import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(req: NextRequest) {
  // Check auth header (e.g., CRON secret)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // In production, uncomment the line below
    // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    
    // Calculate last Thursday 19:00 to this Thursday 18:59:59
    const dayOfWeek = now.getDay(); 
    const currentThursday = new Date(now);
    currentThursday.setHours(19, 0, 0, 0);
    
    if (dayOfWeek < 4 || (dayOfWeek === 4 && now.getHours() < 19)) {
       currentThursday.setDate(currentThursday.getDate() - (dayOfWeek + 3));
    }
    
    const end = new Date(currentThursday);
    const start = new Date(end);
    start.setDate(start.getDate() - 7);

    // Fetch approved requests using raw SQL for date range
    const result = await sql`
      SELECT id, title, artist, approved_at, story 
      FROM song_requests 
      WHERE status = 'approved' 
      AND approved_at >= ${start.toISOString()} 
      AND approved_at < ${end.toISOString()}
    `;

    const approvedSongs = result.rows;

    // Simulation of mail sending
    console.log(`Aggregated ${approvedSongs.length} songs for weekly mail`);
    
    const mailBody = approvedSongs.map((s, i) => `${i+1}. ${s.title} - ${s.artist} (Approved: ${s.approved_at})`).join('\n') || 'No songs approved this week.';

    // Log the event
    await sql`
      INSERT INTO weekly_mail_logs (
        recipient_email, subject, body_text, request_ids
      ) VALUES (
        ${process.env.WEEKLY_MAIL_RECIPIENT || 'broadcasting@hyundai.com'}, 
        ${`[SKY TERRACE] 주간 신청곡 목록 (${start.toLocaleDateString()} - ${end.toLocaleDateString()})`}, 
        ${mailBody}, 
        ${JSON.stringify(approvedSongs.map(s => s.id))}
      )
    `;

    return NextResponse.json({ 
      success: true, 
      count: approvedSongs.length,
      period: `${start.toISOString()} ~ ${end.toISOString()}`
    });
  } catch (err: any) {
    console.error('Weekly mail aggregation failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
