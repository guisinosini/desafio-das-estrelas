import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    has_smtp_user: !!process.env.SMTP_USER,
    has_smtp_pass: !!process.env.SMTP_PASS,
    smtp_user_value: process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 3)}***` : "AUSENTE",
    node_env: process.env.NODE_ENV,
    message: "Se 'has_smtp_user' for false, a Vercel não está lendo sua variável. Faça um Redeploy."
  });
}
