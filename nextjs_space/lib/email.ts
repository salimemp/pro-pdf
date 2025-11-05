
// Email utility for sending verification and reset emails
// In production, integrate with a real email service (SendGrid, AWS SES, etc.)

import crypto from 'crypto';

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function getTokenExpiry(hours: number = 24): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

// Simulated email sending (replace with real email service in production)
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`;
  
  console.log('\n📧 Email Verification');
  console.log('To:', email);
  console.log('Subject: Verify your email address');
  console.log('Link:', verificationUrl);
  console.log('\n');

  // In production, send actual email:
  // await emailService.send({
  //   to: email,
  //   subject: 'Verify your email address',
  //   html: `Click <a href="${verificationUrl}">here</a> to verify your email.`
  // });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
  
  console.log('\n📧 Password Reset');
  console.log('To:', email);
  console.log('Subject: Reset your password');
  console.log('Link:', resetUrl);
  console.log('\n');

  // In production, send actual email:
  // await emailService.send({
  //   to: email,
  //   subject: 'Reset your password',
  //   html: `Click <a href="${resetUrl}">here</a> to reset your password.`
  // });
}

// Generic email sending function for security notifications
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  console.log('\n📧 Email Notification');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('Content:', html.substring(0, 200) + '...');
  console.log('\n');

  // In production, send actual email using your preferred service:
  // await emailService.send({
  //   to,
  //   subject,
  //   html
  // });
}
