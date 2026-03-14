import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role client to bypass RLS for automation
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  // Check auth header (e.g., CRON secret)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    
    // Calculate last Thursday 19:00 to this Thursday 18:59:59
    // This is a simplification; for production, use a more robust date-fns logic
    const dayOfWeek = now.getDay(); // 0 is Sunday, 4 is Thursday
    const currentThursday = new Date(now);
    currentThursday.setHours(19, 0, 0, 0);
    
    if (dayOfWeek < 4 || (dayOfWeek === 4 && now.getHours() < 19)) {
       currentThursday.setDate(currentThursday.getDate() - (dayOfWeek + 3));
    }
    
    const end = new Date(currentThursday);
    const start = new Date(end);
    start.setDate(start.getDate() - 7);

    // Fetch approved requests
    const { data: approvedSongs, error } = await supabaseAdmin
      .from('song_requests')
      .select('id, title, artist, approved_at, story')
      .eq('status', 'approved')
      .gte('approved_at', start.toISOString())
      .lt('approved_at', end.toISOString());

    if (error) throw error;

    // Simulation of mail sending
    console.log(`Aggregated ${approvedSongs?.length} songs for weekly mail`);
    
    const mailBody = approvedSongs?.map((s, i) => `${i+1}. ${s.title} - ${s.artist} (Approved: ${s.approved_at})`).join('\n') || 'No songs approved this week.';

    // Log the event
    const { error: logError } = await supabaseAdmin
      .from('weekly_mail_logs')
      .insert({
        recipient_email: process.env.WEEKLY_MAIL_RECIPIENT || 'broadcasting@hyundai.com',
        subject: `[SKY TERRACE] 주간 신청곡 목록 (${start.toLocaleDateString()} - ${end.toLocaleDateString()})`,
        body_text: mailBody,
        request_ids: approvedSongs?.map(s => s.id) || []
      });

    if (logError) throw logError;

    return NextResponse.json({ 
      success: true, 
      count: approvedSongs?.length,
      period: `${start.toISOString()} ~ ${end.toISOString()}`
    });
  } catch (err: any) {
    console.error('Weekly mail aggregation failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
