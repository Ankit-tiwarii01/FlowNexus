import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const transport = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: env.SMTP_USER && env.SMTP_PASSWORD
        ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
        : undefined,
    })
  : null;

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  if (!transport) {
    if (env.NODE_ENV !== 'test') console.info(`[email] Welcome email skipped for ${to}; SMTP is not configured.`);
    return;
  }

  await transport.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: 'Welcome to FlowNexus',
    text: `Hi ${name}, welcome to FlowNexus. Your workspace is ready.`,
    html: `<p>Hi ${name},</p><p>Welcome to <strong>FlowNexus</strong>. Your workspace is ready.</p>`,
  });
}
