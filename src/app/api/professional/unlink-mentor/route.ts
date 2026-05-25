import { NextResponse } from 'next/server';
import nodemailer from "nodemailer";
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { patientId } = await req.json();

    if (!patientId) {
      return NextResponse.json({ error: 'Missing patientId' }, { status: 400 });
    }

    // 1. Validar autenticação do Profissional
    const supabaseClient = await createClient();
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Checar se o mentor (patientId) está realmente vinculado a este profissional
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('linked_professional_id, email, full_name')
      .eq('id', patientId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    if (profile.linked_professional_id !== user.id) {
      return NextResponse.json({ error: 'Access denied. Patient not linked to you.' }, { status: 403 });
    }

    // 3. Desvincular mentor (set linked_professional_id to null)
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ linked_professional_id: null })
      .eq('id', patientId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to unlink mentor' }, { status: 500 });
    }

    // 4. Revogar o convite original associado ao e-mail desse pai para manter o histórico
    if (profile.email) {
      await supabaseAdmin
        .from('professional_invites')
        .update({ status: 'revoked' })
        .eq('professional_id', user.id)
        .eq('parent_email', profile.email);
    }

    // 5. Decrementar contador de convites usados da assinatura ativa do profissional
    const { data: subscription } = await supabaseAdmin
      .from('professional_subscriptions')
      .select('id, used_invites')
      .eq('professional_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subscription && subscription.used_invites > 0) {
      await supabaseAdmin
        .from('professional_subscriptions')
        .update({ used_invites: subscription.used_invites - 1 })
        .eq('id', subscription.id);
    }

    // 6. Enviar E-mail ao Mentor
    if (profile.email && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true, 
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const subject = "⚠️ Atualização: Seu acesso ao Desafio das Estrelas";

        const contentHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #051210; color: #ffffff; border-radius: 24px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ef4444; font-size: 28px; margin-bottom: 10px;">Aviso Importante</h1>
              <p style="color: #94a3b8; font-size: 16px;">O seu vínculo com o profissional de saúde foi encerrado.</p>
            </div>
            <div style="background-color: rgba(255,255,255,0.05); padding: 30px; border-radius: 20px; border: 1px solid rgba(239, 68, 68, 0.2); margin-bottom: 30px;">
              <p style="color: #cbd5e1; line-height: 1.6; margin-top: 10px; text-align: center;">
                A partir de agora, o seu código de acesso fornecido anteriormente não é mais válido e o plano B2B associado ao profissional foi revogado.
                <br/><br/>
                Mas não se preocupe! Para não perder o progresso e continuar acompanhando a jornada da criança, você pode assinar um de nossos planos particulares.
              </p>
            </div>
            <div style="text-align: center; margin-top: 40px;">
              <a href="https://www.desafioestrelas.com/#pricing" style="background-color: #2dd4bf; color: #000000; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold;">Escolher Novo Plano (Reativar Conta)</a>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"Instituto Kamaleon" <${process.env.SMTP_USER}>`,
          to: profile.email,
          subject: subject,
          html: contentHtml,
        });
        
        console.log("✅ E-mail de desvinculação enviado para", profile.email);
      } catch (emailError) {
        console.error("Falha ao enviar e-mail de desvinculação:", emailError);
      }
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("Erro no unlink-mentor:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
