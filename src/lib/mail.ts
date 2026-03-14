import { Resend } from 'resend';

export async function sendWeeklyReport({
  to,
  subject,
  html,
  text
}: {
  to: string;
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
      from: 'Sky Terrace <onboarding@resend.dev>', // In production, use registered domain
      to: [to],
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
