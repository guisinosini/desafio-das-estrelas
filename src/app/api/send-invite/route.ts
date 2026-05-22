import { NextResponse } from 'next/server';
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  console.log("📩 [Send Invite - GMAIL] Requisição recebida");

  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "E-mail ou código ausentes." }, { status: 400 });
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("❌ [Send Invite] Credenciais SMTP ausentes no .env.local");
      return NextResponse.json({ error: "Configuração de e-mail incompleta no servidor." }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      debug: true,
      logger: true,
      connectionTimeout: 10000, 
    });

    const subject = "🎟️ Convite Especial: Desafio das Estrelas";

    const contentHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #051210; color: #ffffff; border-radius: 24px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2dd4bf; font-size: 28px; margin-bottom: 10px;">Olá!</h1>
          <p style="color: #94a3b8; font-size: 16px;">O seu profissional de saúde acaba de liberar o seu acesso ao <strong>Desafio das Estrelas</strong>.</p>
        </div>
        <div style="background-color: rgba(255,255,255,0.05); padding: 30px; border-radius: 20px; border: 1px solid rgba(45, 212, 191, 0.2); margin-bottom: 30px;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0; text-align: center;">Seu Código de Acesso</h2>
          <div style="background-color: #000; padding: 15px; border-radius: 12px; text-align: center; margin-top: 15px;">
            <span style="color: #2dd4bf; font-size: 32px; font-weight: bold; letter-spacing: 4px; font-family: monospace;">${code}</span>
          </div>
          <p style="color: #cbd5e1; line-height: 1.6; margin-top: 20px; text-align: center;">
            Utilize este código durante o seu cadastro como Pai/Mentor para validar seu plano automaticamente e vincular sua conta ao profissional responsável.
          </p>
        </div>
        <div style="text-align: center; margin-top: 40px;">
          <a href="https://www.desafioestrelas.com/?code=${code}&email=${email}" style="background-color: #2dd4bf; color: #000000; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold;">Fazer Cadastro Agora</a>
        </div>
      </div>
    `;

    console.log(`📤 [Send Invite] Enviando via GMAIL para: ${email}`);

    await transporter.sendMail({
      from: `"Instituto Kamaleon" <${process.env.SMTP_USER}>`,
      to: email,
      subject: subject,
      html: contentHtml,
    });

    console.log("✅ [Send Invite] Convite enviado com sucesso!");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("💥 [Send Invite] Erro fatal:", error);
    return NextResponse.json({ 
      error: "Falha no envio do e-mail.", 
      message: error.message
    }, { status: 500 });
  }
}
