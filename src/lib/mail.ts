import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
