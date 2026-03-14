import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendWeeklyReport } from '@/lib/mail';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const dayOfWeek = now.getDay(); 
    const currentThursday = new Date(now);
    currentThursday.setHours(19, 0, 0, 0);
    
    // Logic: If it's before Thursday 19:00, the "target" Thursday is last week.
    if (dayOfWeek < 4 || (dayOfWeek === 4 && now.getHours() < 19)) {
       currentThursday.setDate(currentThursday.getDate() - (dayOfWeek + 3));
    }
    
    const end = new Date(currentThursday);
    const start = new Date(end);
    start.setDate(start.getDate() - 7);

    // Fetch approved requests with theme info
    const result = await sql`
      SELECT sr.*, mt.title as theme_title
      FROM song_requests sr
      LEFT JOIN monthly_themes mt ON sr.theme_id = mt.id
      WHERE sr.status = 'approved' 
      AND sr.approved_at >= ${start.toISOString()} 
      AND sr.approved_at < ${end.toISOString()}
      ORDER BY sr.approved_at ASC
    `;

    const songs = result.rows;
    const recipient = process.env.WEEKLY_MAIL_RECIPIENT || 'broadcasting@hyundai.com';
    const subject = `[SKY TERRACE 주간 신청곡 리포트] ${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;

    // HTML Table Generation
    const tableRows = songs.map(s => `
      <tr style="border-bottom: 1px solid #edf2f7;">
        <td style="padding: 12px; font-weight: bold; color: #1a202c;">${s.title}</td>
        <td style="padding: 12px; color: #4a5568;">${s.artist}</td>
        <td style="padding: 12px; color: #4a5568;">${s.requester_name || 'Anonymous'}</td>
        <td style="padding: 12px; color: #4a5568; font-size: 11px;">
          ${s.story ? `<div style="font-style: italic; margin-bottom: 4px;">"${s.story}"</div>` : ''}
          ${s.admin_memo ? `<div style="color: #c05621; font-weight: bold;">[Admin Memo: ${s.admin_memo}]</div>` : ''}
        </td>
        <td style="padding: 12px; color: #4a5568; font-size: 11px;">${new Date(s.approved_at).toLocaleString()}</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #2d3748;">
        <h1 style="color: #004d41; border-bottom: 4px solid #004d41; padding-bottom: 10px; margin-bottom: 20px;">SKY TERRACE 주간 신청 리포트</h1>
        <div style="background: #f7fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; font-weight: bold; color: #004d41;">집계 기간: ${start.toLocaleString()} ~ ${end.toLocaleString()}</p>
          <p style="margin: 5px 0 0 0;">총 승인 건수: <strong>${songs.length}건</strong></p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead style="background: #004d41; color: white;">
            <tr>
              <th style="padding: 12px; text-align: left;">곡명</th>
              <th style="padding: 12px; text-align: left;">아티스트</th>
              <th style="padding: 12px; text-align: left;">신청자</th>
              <th style="padding: 12px; text-align: left;">사연 / 메모</th>
              <th style="padding: 12px; text-align: left;">승인시각</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="5" style="padding: 40px; text-align: center; color: #a0aec0;">해당 기간 승인된 곡이 없습니다.</td></tr>'}
          </tbody>
        </table>
        <div style="margin-top: 40px; font-size: 12px; color: #a0aec0; text-align: center; border-top: 1px solid #edf2f7; padding-top: 20px;">
          본 메일은 SKY TERRACE 관리 시스템에서 자동으로 발송되었습니다.
        </div>
      </div>
    `;

    const text = `[SKY TERRACE 주간 신청곡 리포트]\n기간: ${start.toLocaleString()} ~ ${end.toLocaleString()}\n총 ${songs.length}건\n\n` + 
                 songs.map((s, i) => `${i+1}. ${s.title} - ${s.artist} (Req: ${s.requester_name})`).join('\n');

    let mailStatus = 'success';
    let errorMessage = null;

    if (songs.length > 0) {
      const mailResult = await sendWeeklyReport({ to: recipient, subject, html, text });
      if (!mailResult.success) {
        mailStatus = 'fail';
        errorMessage = JSON.stringify(mailResult.error);
      }
    }

    // Log the event
    await sql`
      INSERT INTO weekly_mail_logs (
        recipient_email, subject, body_text, request_ids, status, error_message, period_start, period_end
      ) VALUES (
        ${recipient}, 
        ${subject}, 
        ${text}, 
        ${JSON.stringify(songs.map(s => s.id))},
        ${mailStatus},
        ${errorMessage},
        ${start.toISOString()},
        ${end.toISOString()}
      )
    `;

    return NextResponse.json({ 
      success: mailStatus === 'success', 
      count: songs.length,
      period: `${start.toISOString()} ~ ${end.toISOString()}`,
      logStatus: mailStatus
    });
  } catch (err: any) {
    console.error('Weekly mail process failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
