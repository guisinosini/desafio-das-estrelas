import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { patientEmail, patientName, serviceName, professionalName, sessions } = await req.json();

    if (!patientEmail || !patientName || !serviceName) {
      return NextResponse.json({ error: "Dados insuficientes." }, { status: 400 });
    }

    // Configuração do Nodemailer para GMAIL
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const sessionsHtml = sessions.map((s: any, i: number) => `
      <li style="margin-bottom: 8px;">
        <strong>Sessão ${i + 1}:</strong> ${s.date} às ${s.time}
      </li>
    `).join("");

    console.log(`📤 [Booking Email] Enviando via GMAIL para: ${patientEmail}`);

    await transporter.sendMail({
      from: `"Instituto Kamaleon" <${process.env.SMTP_USER}>`,
      to: patientEmail,
      subject: `Confirmação de Agendamento: ${serviceName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h1 style="color: #001a14; font-size: 24px;">Olá, ${patientName}!</h1>
          <p>Seu agendamento no <strong>Instituto Kamaleon</strong> foi confirmado.</p>
          <div style="margin: 20px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
            <p><strong>Serviço:</strong> ${serviceName}</p>
            <p><strong>Profissional:</strong> ${professionalName}</p>
            <ul style="list-style: none; padding: 0;">${sessionsHtml}</ul>
          </div>
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">Instituto Kamaleon</p>
        </div>
      `,
    });

    console.log("✅ [Booking Email] Enviando com sucesso via GMAIL!");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("💥 [Booking Email] Erro GMAIL:", error);
    return NextResponse.json({ error: "Erro ao enviar e-mail.", details: error.message }, { status: 500 });
  }
}
