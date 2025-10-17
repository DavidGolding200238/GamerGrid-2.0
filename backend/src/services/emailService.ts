import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const frontendBase = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
  const verificationUrl = `${frontendBase}/api/auth/verify?token=${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify your GamerGrid account',
    html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
  });
}

export async function sendResetEmail(email: string, token: string) {
  const frontendBase = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
  const resetUrl = `${frontendBase}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset your GamerGrid password',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`,
  });
}