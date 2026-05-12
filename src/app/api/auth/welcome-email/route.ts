import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  console.log("📩 [Welcome Email - GMAIL] Requisição recebida");
  
  try {
    const body = await req.json();
    const record = body.record || body; 
    const { id, full_name, source } = record;

    if (!id) {
      return NextResponse.json({ error: "ID do usuário não fornecido." }, { status: 400 });
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(id);
    
    if (userError || !user) {
      console.error("❌ [Welcome Email] Usuário não encontrado:", userError);
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const patientEmail = user.email;
    const patientName = full_name || user.user_metadata?.full_name || "Astronauta";

    console.log(`🔑 [Welcome Email] Configurando SMTP para: ${process.env.SMTP_USER}`);

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("❌ [Welcome Email] Credenciais SMTP ausentes no .env.local");
      return NextResponse.json({ error: "Configuração de e-mail incompleta no servidor." }, { status: 500 });
    }

    // Configuração do Nodemailer para GMAIL mais robusta
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
      connectionTimeout: 10000, // 10 segundos
    });

    // ... (templates mantidos)
    const isDesafio = source === 'desafio_estrelas';
    const isRodaVida = source === 'roda_vida';

    let subject = "🌿 Bem-vindo ao Instituto Kamaleon - Sua Transformação Começa Aqui";
    if (isDesafio) subject = "🚀 Bem-vindo à sua nova Jornada de Conquistas!";
    if (isRodaVida) subject = "🎡 Sua Roda da Vida está pronta! Veja seu diagnóstico";

    let contentHtml = "";

    if (isDesafio) {
      contentHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #051210; color: #ffffff; border-radius: 24px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2dd4bf; font-size: 28px; margin-bottom: 10px;">Olá, Comandante ${patientName}!</h1>
            <p style="color: #94a3b8; font-size: 16px;">Sua conta no <strong>Desafio das Estrelas</strong> foi criada com sucesso.</p>
          </div>
          <div style="background-color: rgba(255,255,255,0.05); padding: 30px; border-radius: 20px; border: 1px solid rgba(45, 212, 191, 0.2); margin-bottom: 30px;">
            <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">O que vem agora?</h2>
            <p style="color: #cbd5e1; line-height: 1.6;">Você acaba de dar o primeiro passo para transformar a rotina do seu filho em uma aventura épica.</p>
          </div>
          <div style="text-align: center; margin-top: 40px;">
            <a href="https://desafio-das-estrelas.vercel.app/" style="background-color: #2dd4bf; color: #000000; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold;">Decolar Agora</a>
          </div>
        </div>
      `;
    } else if (isRodaVida) {
      contentHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; color: #0f172a; border-radius: 24px; border: 1px solid #e2e8f0;">
          <h1 style="color: #051210; text-align: center;">Olá, ${patientName}!</h1>
          <p style="text-align: center; font-size: 18px;">Parabéns por completar seu diagnóstico da <strong>Roda da Vida</strong>.</p>
          <div style="margin: 30px 0; padding: 25px; background-color: #f8fafc; border-radius: 20px; border-left: 4px solid #2dd4bf;">
            <p style="margin: 0; color: #475569;">Este é o primeiro passo para sair da estagnação e retomar o controle da sua jornada pessoal e profissional.</p>
          </div>
          <p style="text-align: center;">Acesse seu painel para ver o laudo completo e baixar seu plano de ação.</p>
          <div style="text-align: center; margin-top: 40px;">
            <a href="https://app.kamaleon.com.br/login" style="background-color: #051210; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold;">Ver meu Laudo</a>
          </div>
        </div>
      `;
    } else {
      contentHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f8fafc; color: #0f172a; border-radius: 24px; border: 1px solid #e2e8f0;">
          <h1 style="color: #051210; text-align: center;">Bem-vindo ao Instituto, ${patientName}!</h1>
          <p style="text-align: center;">Estamos felizes em fazer parte da sua jornada.</p>
          <div style="text-align: center; margin-top: 40px;">
            <a href="https://kamaleon-clinic-hub.vercel.app/patient" style="background-color: #051210; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold;">Agendar Primeira Sessão</a>
          </div>
        </div>
      `;
    }

    console.log(`📤 [Welcome Email] Enviando via GMAIL para: ${patientEmail}`);

    await transporter.sendMail({
      from: `"Instituto Kamaleon" <${process.env.SMTP_USER}>`,
      to: patientEmail,
      subject: subject,
      html: contentHtml,
    });

    console.log("✅ [Welcome Email] E-mail enviado com sucesso!");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("💥 [Welcome Email] Erro fatal:", error);
    return NextResponse.json({ 
      error: "Falha no envio do e-mail.", 
      message: error.message,
      code: error.code,
      command: error.command 
    }, { status: 500 });
  }
}
