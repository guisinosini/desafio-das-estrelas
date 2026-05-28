/**
 * Módulo centralizado de envio de e-mail via Nodemailer + Gmail SMTP.
 * Use este módulo em todas as rotas para evitar duplicação de configuração.
 */

import nodemailer from 'nodemailer';

// --------------------------------------------------------------------------
// Transporter (singleton por invocação serverless)
// --------------------------------------------------------------------------

export function createEmailTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Credenciais SMTP ausentes (SMTP_USER / SMTP_PASS).');
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10_000,
  });
}

// --------------------------------------------------------------------------
// Helper de envio simples
// --------------------------------------------------------------------------

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailOptions) {
  const transporter = createEmailTransporter();
  const senderName = from ?? '"Desafio das Estrelas" <' + process.env.SMTP_USER + '>';

  await transporter.sendMail({ from: senderName, to, subject, html });
}

// --------------------------------------------------------------------------
// Templates de E-mail
// --------------------------------------------------------------------------

/**
 * Template temático espacial para o MENTOR (pai/responsável).
 * Enviado quando uma tarefa do filho está pendente há mais de 3 dias.
 */
export function buildMentorReminderHtml({
  mentorName,
  childName,
  pendingTasks,
}: {
  mentorName: string;
  childName: string;
  pendingTasks: { title: string; daysPending: number }[];
}) {
  const taskList = pendingTasks
    .map(
      (t) => `
      <tr>
        <td style="padding:10px 16px; border-bottom:1px solid rgba(255,255,255,0.06); color:#e2e8f0; font-size:15px;">
          🚀 ${t.title}
        </td>
        <td style="padding:10px 16px; border-bottom:1px solid rgba(255,255,255,0.06); color:#f87171; font-size:14px; white-space:nowrap; text-align:right;">
          ${t.daysPending} ${t.daysPending === 1 ? 'dia' : 'dias'} sem completar
        </td>
      </tr>`
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head><meta charset="UTF-8"/></head>
  <body style="margin:0;padding:0;background:#0a0a1a;font-family:sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

      <!-- Header estrelado -->
      <div style="text-align:center;margin-bottom:32px;">
        <div style="font-size:48px;line-height:1;">🌌</div>
        <h1 style="color:#2dd4bf;font-size:26px;margin:12px 0 6px;">Sinal do Controle da Missão!</h1>
        <p style="color:#94a3b8;font-size:15px;margin:0;">
          Olá, <strong style="color:#e2e8f0;">${mentorName}</strong> — temos um alerta sobre a jornada de <strong style="color:#fbbf24;">${childName}</strong>.
        </p>
      </div>

      <!-- Caixa de alerta -->
      <div style="background:rgba(45,212,191,0.06);border:1px solid rgba(45,212,191,0.25);border-radius:20px;padding:28px;margin-bottom:28px;">
        <p style="color:#cbd5e1;font-size:15px;margin:0 0 18px;line-height:1.6;">
          ⚠️ As seguintes <strong>missões espaciais</strong> ainda não foram completadas.
          Cada dia sem missão é uma estrela que deixa de brilhar!
        </p>

        <!-- Tabela de tarefas -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
          <thead>
            <tr style="background:rgba(255,255,255,0.05);">
              <th style="padding:10px 16px;text-align:left;color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">Missão</th>
              <th style="padding:10px 16px;text-align:right;color:#94a3b8;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;">Pendente há</th>
            </tr>
          </thead>
          <tbody>${taskList}</tbody>
        </table>
      </div>

      <!-- Mensagem motivacional -->
      <div style="background:rgba(251,191,36,0.08);border-left:4px solid #fbbf24;border-radius:0 12px 12px 0;padding:16px 20px;margin-bottom:28px;">
        <p style="color:#fde68a;font-size:14px;margin:0;line-height:1.6;">
          💫 <strong>${childName}</strong> precisa de um empurrãozinho estelar! Uma conversa rápida e carinhosa pode ser o combustível que falta para retomar a aventura.
        </p>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:36px;">
        <a href="https://www.desafiodasestrelas.com.br"
           style="display:inline-block;background:linear-gradient(135deg,#2dd4bf,#0d9488);color:#000;padding:16px 36px;border-radius:50px;text-decoration:none;font-weight:700;font-size:16px;letter-spacing:.3px;">
          🚀 Abrir o Desafio das Estrelas
        </a>
      </div>

      <!-- Footer -->
      <div style="text-align:center;border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;">
        <p style="color:#475569;font-size:12px;margin:0;line-height:1.6;">
          Você está recebendo este e-mail porque é mentor de <strong>${childName}</strong> no Desafio das Estrelas.<br/>
          Instituto Kamaleon · <a href="https://www.desafioestrelas.com" style="color:#2dd4bf;text-decoration:none;">desafioestrelas.com</a>
        </p>
      </div>

    </div>
  </body>
  </html>
  `;
}

/**
 * Template profissional para o PROFISSIONAL DE SAÚDE vinculado ao mentor.
 * Enviado como resumo clínico das tarefas pendentes de um paciente.
 */
export function buildProfessionalReminderHtml({
  professionalName,
  mentorName,
  childName,
  pendingTasks,
}: {
  professionalName: string;
  mentorName: string;
  childName: string;
  pendingTasks: { title: string; daysPending: number }[];
}) {
  const taskRows = pendingTasks
    .map(
      (t) => `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;color:#1e293b;font-size:14px;">${t.title}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;color:#dc2626;font-size:14px;text-align:right;white-space:nowrap;">
          ${t.daysPending} ${t.daysPending === 1 ? 'dia' : 'dias'}
        </td>
      </tr>`
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head><meta charset="UTF-8"/></head>
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:40px 20px;">

      <!-- Header clínico -->
      <div style="background:#051210;border-radius:16px 16px 0 0;padding:24px 28px;display:flex;align-items:center;">
        <div>
          <p style="color:#2dd4bf;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">Instituto Kamaleon</p>
          <h1 style="color:#ffffff;font-size:20px;margin:0;">Alerta Clínico — Tarefas Pendentes</h1>
        </div>
      </div>

      <!-- Corpo -->
      <div style="background:#ffffff;padding:28px;border-radius:0 0 16px 16px;border:1px solid #e2e8f0;border-top:none;">

        <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 20px;">
          Olá, <strong style="color:#0f172a;">${professionalName}</strong>.<br/>
          Este é um aviso automático referente ao seu paciente:
        </p>

        <!-- Card do paciente -->
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
          <p style="margin:0 0 4px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.5px;font-weight:600;">Mentor / Responsável</p>
          <p style="margin:0 0 12px;color:#1e293b;font-size:16px;font-weight:700;">${mentorName}</p>
          <p style="margin:0 0 4px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.5px;font-weight:600;">Criança</p>
          <p style="margin:0;color:#1e293b;font-size:16px;font-weight:700;">${childName} ⭐</p>
        </div>

        <!-- Tabela de tarefas -->
        <p style="color:#475569;font-size:14px;font-weight:600;margin:0 0 10px;">Missões pendentes há mais de 3 dias:</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:24px;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="padding:10px 16px;text-align:left;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;">Tarefa</th>
              <th style="padding:10px 16px;text-align:right;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;">Dias pendente</th>
            </tr>
          </thead>
          <tbody>${taskRows}</tbody>
        </table>

        <!-- Observação -->
        <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:24px;">
          <p style="color:#7f1d1d;font-size:13px;margin:0;line-height:1.6;">
            Este aviso é gerado automaticamente quando tarefas prescritas ficam sem conclusão por 3 ou mais dias consecutivos. Recomenda-se verificar a adesão do paciente ao plano terapêutico.
          </p>
        </div>

        <!-- CTA -->
        <div style="text-align:center;">
          <a href="https://www.desafioestrelas.com"
             style="display:inline-block;background:#051210;color:#2dd4bf;padding:14px 30px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
            Ver Painel do Paciente
          </a>
        </div>

      </div>

      <!-- Footer -->
      <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:20px;">
        Instituto Kamaleon · Sistema Desafio das Estrelas<br/>
        Este e-mail é enviado automaticamente para profissionais vinculados a pacientes ativos.
      </p>

    </div>
  </body>
  </html>
  `;
}
