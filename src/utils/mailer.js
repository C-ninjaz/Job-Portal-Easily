import fs from "fs";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  // Fallback to JSON transport for development
  return nodemailer.createTransport({ jsonTransport: true });
}

const transporter = createTransport();

export async function sendApplicationEmail({ to, job, applicant }) {
  const templatePath = path.join(
    __dirname,
    "..",
    "..",
    "views",
    "html",
    "mailTemplate.html"
  );
  let html = "<p>Thanks for applying!</p>";
  try {
    html = fs.readFileSync(templatePath, "utf-8");
  } catch {}
  // Simple interpolation
  html = html
    .replaceAll("Dear User", `Dear ${applicant?.name || "Applicant"}`)
    .replaceAll(
      "applying to a job at Easily",
      `applying to ${job?.company_name || "our company"}`
    );

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || "no-reply@easily.dev",
    to,
    subject: "Application Received - Easily",
    html,
  });
  return info;
}
