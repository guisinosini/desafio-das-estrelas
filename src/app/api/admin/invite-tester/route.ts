import { NextResponse } from 'next/server';
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  console.log("📩 [Invite Tester - GMAIL] Requisição recebida");

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "E-mail ausente." }, { status: 400 });
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("❌ [Invite Tester] Credenciais SMTP ausentes no .env.local");
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
      debug: false,
      logger: false,
      connectionTimeout: 10000, 
    });

    const subject = "🚀 Você ganhou acesso VIP ao Desafio das Estrelas!";

    const contentHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #051210; color: #ffffff; border-radius: 24px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 48px; line-height: 1; margin-bottom: 20px;">🌌</div>
          <h1 style="color: #2dd4bf; font-size: 28px; margin-bottom: 10px;">Missão Aprovada!</h1>
          <p style="color: #94a3b8; font-size: 16px; line-height: 1.6;">O Controle da Missão selecionou você para uma jornada especial. Você acaba de ganhar um <strong>Período de Teste VIP</strong> no <strong>Desafio das Estrelas</strong>.</p>
        </div>

        <div style="background-color: rgba(255,255,255,0.05); padding: 30px; border-radius: 20px; border: 1px solid rgba(168, 85, 247, 0.4); margin-bottom: 30px; box-shadow: 0 4px 30px rgba(168, 85, 247, 0.1);">
          <h2 style="color: #c084fc; font-size: 20px; margin-top: 0; text-align: center; font-style: italic;">Seu Acesso Tester 🎟️</h2>
          
          <p style="color: #cbd5e1; line-height: 1.6; margin-top: 20px; text-align: center;">
            Com este convite, você poderá explorar todas as missões, cadastrar seus pequenos astronautas e vivenciar a experiência completa da plataforma gamificada.
          </p>
          <p style="color: #94a3b8; font-size: 14px; text-align: center; margin-top: 15px;">
            Basta criar a sua conta utilizando este e-mail (<strong>${email}</strong>) e seu acesso será liberado automaticamente após o cadastro.
          </p>
        </div>

        <div style="text-align: center; margin-top: 40px;">
          <a href="https://www.desafioestrelas.com/" style="display: inline-block; background: linear-gradient(135deg, #a855f7, #9333ea); color: #ffffff; padding: 18px 36px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 10px 25px rgba(168, 85, 247, 0.4);">
            🚀 Iniciar Minha Jornada
          </a>
        </div>
        
        <div style="text-align: center; margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
          <p style="color: #475569; font-size: 12px;">
            Instituto Kamaleon • Desafio das Estrelas<br>
            Prepare-se para decolar!
          </p>
        </div>
      </div>
    `;

    console.log(`📤 [Invite Tester] Enviando e-mail VIP para: ${email}`);

    await transporter.sendMail({
      from: `"Controle da Missão" <${process.env.SMTP_USER}>`,
      to: email,
      subject: subject,
      html: contentHtml,
    });

    console.log("✅ [Invite Tester] E-mail enviado com sucesso!");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("💥 [Invite Tester] Erro fatal:", error);
    return NextResponse.json({ 
      error: "Falha no envio do e-mail.", 
      message: error.message
    }, { status: 500 });
  }
}
