import nodemailer from 'nodemailer';
import 'dotenv/config';
import { getOutreachEmailHTML } from '../templates/outreachEmail.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOutreachEmail(hospital) {
  const subject = `Smart Indoor Navigation for ${hospital.name} — Proven at District Hospital Sagar`;
  await transporter.sendMail({
    from: `"Kalpana TechLabs" <${process.env.GMAIL_USER}>`,
    to: hospital.email,
    replyTo: process.env.GMAIL_USER,
    subject,
    html: getOutreachEmailHTML(hospital.name, process.env.SITE_URL),
  });
  return subject;
}
