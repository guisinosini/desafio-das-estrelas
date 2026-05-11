import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { type, appointmentId, details } = await req.json();

    if (!appointmentId && !details) {
      return NextResponse.json({ error: "Dados insuficientes." }, { status: 400 });
    }

    // 1. Fetch complete data about the appointment if only ID is provided
    let appointmentData = details;
    if (appointmentId && !details) {
      const { data, error } = await supabaseAdmin
        .from("appointments")
        .select(`
          *,
          patient:patients(*),
          professional:professionals(*),
          service:services(*)
        `)
        .eq("id", appointmentId)
        .single();
      
      if (error || !data) throw new Error("Agendamento não encontrado.");
      appointmentData = data;
    }

    const { patient, professional, service, start_time } = appointmentData;
    const patientEmail = patient?.email;
    const professionalEmail = professional?.email;

    if (!patientEmail || !professionalEmail) {
      console.warn("⚠️ [Email Notification] E-mail ausente para paciente ou profissional.");
      // Se tiver pelo menos um, podemos tentar enviar, mas o ideal é ter ambos
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const dateFormatted = new Date(start_time).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const timeFormatted = new Date(start_time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });

    let patientSubject = "";
    let professionalSubject = "";
    let patientHtml = "";
    let professionalHtml = "";

    const baseUrl = "https://kamaleon-clinic-hub.vercel.app";

    if (type === "scheduled") {
      patientSubject = "✅ Sessão Confirmada - Instituto Kamaleon";
      professionalSubject = "📅 Novo Agendamento Recebido";
      
      patientHtml = `
        <div style="font-family: sans-serif; color: #0f172a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 24px;">
          <h2 style="color: #051210;">Olá, ${patient.full_name}!</h2>
          <p>Sua sessão de <strong>${service.name}</strong> foi confirmada com sucesso.</p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 16px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Especialista:</strong> ${professional.full_name}</p>
            <p style="margin: 5px 0;"><strong>Data:</strong> ${dateFormatted}</p>
            <p style="margin: 5px 0;"><strong>Horário:</strong> ${timeFormatted}h</p>
          </div>
          <p>Você poderá acessar a sala virtual 20 minutos antes do horário pelo seu painel.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${baseUrl}/patient/appointments" style="background-color: #051210; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold;">Ver Meus Agendamentos</a>
          </div>
        </div>
      `;

      professionalHtml = `
        <div style="font-family: sans-serif; color: #0f172a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 24px;">
          <h2 style="color: #051210;">Olá, ${professional.full_name}!</h2>
          <p>Você tem um novo agendamento de <strong>${service.name}</strong>.</p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 16px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Paciente:</strong> ${patient.full_name}</p>
            <p style="margin: 5px 0;"><strong>Data:</strong> ${dateFormatted}</p>
            <p style="margin: 5px 0;"><strong>Horário:</strong> ${timeFormatted}h</p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${baseUrl}/professional/appointments" style="background-color: #051210; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold;">Ver Minha Agenda</a>
          </div>
        </div>
      `;
    } 
    else if (type === "rescheduled") {
      patientSubject = "🕒 Sua Sessão foi Reagendada";
      professionalSubject = "🕒 Alteração de Horário: Sessão Reagendada";

      patientHtml = `
        <div style="font-family: sans-serif; color: #0f172a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 24px;">
          <h2 style="color: #051210;">Olá, ${patient.full_name}.</h2>
          <p>O horário da sua sessão de <strong>${service.name}</strong> com <strong>${professional.full_name}</strong> foi alterado.</p>
          <div style="background-color: #fff7ed; padding: 20px; border-radius: 16px; margin: 20px 0; border: 1px solid #ffedd5;">
            <p style="margin: 5px 0; color: #9a3412;"><strong>Novo Horário Confirmado:</strong></p>
            <p style="margin: 5px 0;"><strong>Data:</strong> ${dateFormatted}</p>
            <p style="margin: 5px 0;"><strong>Horário:</strong> ${timeFormatted}h</p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${baseUrl}/patient/appointments" style="background-color: #051210; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold;">Acessar Painel</a>
          </div>
        </div>
      `;

      professionalHtml = `
        <div style="font-family: sans-serif; color: #0f172a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 24px;">
          <h2 style="color: #051210;">Olá, ${professional.full_name}.</h2>
          <p>A sessão de <strong>${service.name}</strong> com o paciente <strong>${patient.full_name}</strong> foi reagendada.</p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 16px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Novo Horário:</strong> ${dateFormatted} às ${timeFormatted}h</p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${baseUrl}/professional/appointments" style="background-color: #051210; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold;">Ver Minha Agenda</a>
          </div>
        </div>
      `;
    }
    else if (type === "cancelled") {
      patientSubject = "❌ Sessão Cancelada - Instituto Kamaleon";
      professionalSubject = "❌ Aviso de Cancelamento de Sessão";

      patientHtml = `
        <div style="font-family: sans-serif; color: #0f172a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 24px;">
          <h2 style="color: #051210;">Olá, ${patient.full_name}.</h2>
          <p>Lamentamos informar que sua sessão de <strong>${service.name}</strong> agendada para <strong>${dateFormatted} às ${timeFormatted}h</strong> foi cancelada.</p>
          ${details?.reason ? `<p><strong>Motivo:</strong> ${details.reason}</p>` : ""}
          <p>Se houver dúvidas ou desejar reagendar, entre em contato com nosso suporte.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${baseUrl}/patient/booking" style="background-color: #2dd4bf; color: #000000; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold;">Agendar Nova Sessão</a>
          </div>
        </div>
      `;

      professionalHtml = `
        <div style="font-family: sans-serif; color: #0f172a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 24px;">
          <h2 style="color: #051210;">Olá, ${professional.full_name}.</h2>
          <p>O agendamento de <strong>${patient.full_name}</strong> para o dia <strong>${dateFormatted} às ${timeFormatted}h</strong> foi cancelado no sistema.</p>
          ${details?.reason ? `<p><strong>Motivo:</strong> ${details.reason}</p>` : ""}
        </div>
      `;
    }
    else if (type === "cancelled_request") {
      // Paciente solicita cancelamento
      patientSubject = "📨 Solicitação de Cancelamento Enviada";
      professionalSubject = "⚠️ Solicitação de Cancelamento de Paciente";

      patientHtml = `
        <div style="font-family: sans-serif; color: #0f172a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 24px;">
          <h2 style="color: #051210;">Olá, ${patient.full_name}.</h2>
          <p>Recebemos sua solicitação de cancelamento para a sessão de <strong>${service.name}</strong> no dia <strong>${dateFormatted} às ${timeFormatted}h</strong>.</p>
          <p>Nossa equipe irá analisar o pedido conforme as políticas da clínica e você receberá uma confirmação em breve.</p>
        </div>
      `;

      professionalHtml = `
        <div style="font-family: sans-serif; color: #0f172a; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 24px;">
          <h2 style="color: #051210;">Olá, ${professional.full_name}.</h2>
          <p>O paciente <strong>${patient.full_name}</strong> solicitou o cancelamento da sessão de <strong>${dateFormatted} às ${timeFormatted}h</strong>.</p>
          <p><strong>Motivo declarado:</strong> ${details?.reason || "Não informado"}</p>
          <p>Por favor, verifique no painel administrativo para processar esta solicitação.</p>
        </div>
      `;
    }

    // Send emails
    const promises = [];
    
    if (patientEmail) {
      promises.push(transporter.sendMail({
        from: '"Instituto Kamaleon" <' + process.env.SMTP_USER + '>',
        to: patientEmail,
        subject: patientSubject,
        html: patientHtml,
      }));
    }

    if (professionalEmail) {
      promises.push(transporter.sendMail({
        from: '"Instituto Kamaleon" <' + process.env.SMTP_USER + '>',
        to: professionalEmail,
        subject: professionalSubject,
        html: professionalHtml,
      }));
    }

    await Promise.all(promises);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("💥 [Appointment Notifications] Erro fatal:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
