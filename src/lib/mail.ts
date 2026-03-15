import { Resend } from 'resend';

export async function sendWeeklyReport({
  to,
  cc,
  bcc,
  subject,
  html,
  text
}: {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  html: string;
  text: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not defined');
    return { success: false, error: 'Missing API key' };
  }

  const resend = new Resend(apiKey);

  try {
    const data = await resend.emails.send({
      from: 'Sky Terrace <onboarding@resend.dev>',
      to: to.split(',').map(e => e.trim()),
      cc: cc ? cc.split(',').map(e => e.trim()) : undefined,
      bcc: bcc ? bcc.split(',').map(e => e.trim()) : undefined,
      subject: subject,
      html: html,
      text: text,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}
