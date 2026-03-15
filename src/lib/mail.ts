import nodemailer from 'nodemailer';

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
  // Use SMTP settings from environment variables
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM_EMAIL || 'onboarding@resend.dev';

  // Fallback check
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.error('SMTP configuration is missing (need SMTP_HOST, SMTP_USER, SMTP_PASS)');
    return { 
      success: false, 
      error: 'SMTP configuration is incomplete. Please check your environment variables.' 
    };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      password: smtpPass,
    },
  } as any);

  try {
    const info = await transporter.sendMail({
      from: `"Sky Terrace" <${smtpFrom}>`,
      to: to.split(',').map(e => e.trim()),
      cc: cc ? cc.split(',').map(e => e.trim()) : undefined,
      bcc: bcc ? bcc.split(',').map(e => e.trim()) : undefined,
      subject: subject,
      html: html,
      text: text,
    });

    return { success: true, data: info };
  } catch (error) {
    console.error('SMTP email sending failed:', error);
    return { success: false, error };
  }
}
