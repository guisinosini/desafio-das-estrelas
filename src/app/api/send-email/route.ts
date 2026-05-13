import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { to, subject, body } = await req.json();
    if (!to || !subject || !body) {
      return NextResponse.json({ error: 'Campos to, subject e body são obrigatórios.' }, { status: 400 });
    }
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('⚠️ Credenciais SMTP ausentes.');
      return NextResponse.json({ error: 'Configuração de e‑mail incompleta.' }, { status: 500 });
    }
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.sendMail({
      from: `"Desafio das Estrelas" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: `<div style="font-family:sans-serif;color:#111;line-height:1.5;">
        ${body.replace(/\n/g, '<br/>')}
      </div>`,
    });
    console.log(`📧 Email enviado para ${to}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Erro ao enviar email:', error);
    return NextResponse.json({ error: 'Falha no envio de email.', details: error.message }, { status: 500 });
  }
}
