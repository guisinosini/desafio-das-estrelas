import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { Payment, PreApproval } from 'mercadopago';
import { mpClient } from '@/lib/mercadopago';

// Supabase Admin com service role — ignora RLS
const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Retorna o ID do plano de assinatura cadastrado no Mercado Pago
 * correspondente ao intervalo selecionado pelo usuário.
 * Os IDs são lidos de variáveis de ambiente para máxima segurança e flexibilidade.
 */
function getPlanId(interval: string): string {
  const map: Record<string, string | undefined> = {
    // Planos Pai/Mentor
    'monthly':         process.env.MP_PLAN_ID_MONTHLY,
    'yearly':          process.env.MP_PLAN_ID_YEARLY,
    // Planos Profissionais Mensais
    'pro_1_monthly':   process.env.MP_PLAN_ID_PRO_1_MONTHLY,
    'pro_4_monthly':   process.env.MP_PLAN_ID_PRO_4_MONTHLY,
    'pro_9_monthly':   process.env.MP_PLAN_ID_PRO_9_MONTHLY,
    'pro_15_monthly':  process.env.MP_PLAN_ID_PRO_15_MONTHLY,
    // Planos Profissionais Anuais
    'pro_1_yearly':    process.env.MP_PLAN_ID_PRO_1_YEARLY,
    'pro_4_yearly':    process.env.MP_PLAN_ID_PRO_4_YEARLY,
    'pro_9_yearly':    process.env.MP_PLAN_ID_PRO_9_YEARLY,
    'pro_15_yearly':   process.env.MP_PLAN_ID_PRO_15_YEARLY,
  };

  const id = map[interval];
  if (!id) {
    throw new Error(
      `Plano de assinatura não encontrado para "${interval}". ` +
      `Verifique as variáveis de ambiente MP_PLAN_ID_* no painel da Vercel.`
    );
  }
  return id;
}

/**
 * Ativa o perfil do usuário no Supabase após pagamento aprovado.
 * Para planos profissionais, também atualiza/cria o registro em professional_subscriptions.
 */
async function ativarPerfil(userId: string, interval: string): Promise<void> {
  // Atualiza o perfil principal
  await supabaseAdmin.from('profiles').upsert({
    id: userId,
    subscription_status: 'active',
    subscription_price_id: interval,
  });

  // Se for plano profissional, sincroniza professional_subscriptions
  if (interval.startsWith('pro_')) {
    const parts = interval.split('_');
    const limit = parseInt(parts[1], 10);

    const { data: existingSub } = await supabaseAdmin
      .from('professional_subscriptions')
      .select('id')
      .eq('professional_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (existingSub && existingSub.length > 0) {
      await supabaseAdmin.from('professional_subscriptions').update({
        plan_limit: limit,
        status: 'active',
        updated_at: new Date().toISOString(),
      }).eq('id', existingSub[0].id);
    } else {
      await supabaseAdmin.from('professional_subscriptions').insert({
        professional_id: userId,
        plan_limit: limit,
        status: 'active',
      });
    }
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ requireAuth: true });
    }

    const {
      interval,
      cardTokenId,
      paymentMethodId,
      issuerId,
      installments,
      identificationType,
      identificationNumber,
    } = await req.json();

    const isYearly = interval === 'yearly' || interval.endsWith('_yearly');

    // ─────────────────────────────────────────────────────────────────
    // CAMINHO A: Pagamento com CARTÃO → PreApproval (assinatura recorrente)
    // Cobre todos os planos mensais e anuais com cartão.
    // ─────────────────────────────────────────────────────────────────
    if (cardTokenId) {
      const preApproval = new PreApproval(mpClient);

      try {
        const planId = getPlanId(interval);

        console.log(`[PreApproval] Criando assinatura: interval=${interval} | planId=${planId} | payer=${user.email}`);

        const preApprovalData = await preApproval.create({
          body: {
            preapproval_plan_id: planId,
            payer_email: user.email!,
            card_token_id: cardTokenId,
            external_reference: user.id,
            status: 'authorized',
          },
          requestOptions: { idempotencyKey: crypto.randomUUID() },
        });

        console.log(`[PreApproval] Resposta: id=${preApprovalData.id} | status=${preApprovalData.status}`);

        const statusOk = ['authorized', 'pending'].includes(preApprovalData.status || '');

        if (statusOk) {
          await ativarPerfil(user.id, interval);
          console.log(`[PreApproval] Perfil ${user.id} ativado (${interval}) ✅`);
        }

        return NextResponse.json({
          success: statusOk,
          status: preApprovalData.status,
          id: preApprovalData.id,
        });

      } catch (mpError: any) {
        console.error(`[PreApproval] Falha ao criar assinatura:`, mpError);
        return NextResponse.json(
          { error: mpError.message || 'Erro interno Mercado Pago' },
          { status: 500 }
        );
      }
    }

    // ─────────────────────────────────────────────────────────────────
    // CAMINHO B: Pagamento via PIX → Payment API (pagamento único)
    // Permitido APENAS para planos anuais. Mensais são bloqueados no frontend,
    // mas aqui adicionamos uma guarda de segurança no backend também.
    // ─────────────────────────────────────────────────────────────────
    if (!isYearly) {
      console.warn(`[Checkout] Tentativa de PIX em plano mensal bloqueada: interval=${interval}`);
      return NextResponse.json(
        { error: 'Pagamento via PIX não está disponível para planos mensais. Use um cartão de crédito.' },
        { status: 400 }
      );
    }

    // Calcula o valor do plano anual para o PIX
    let amount = 199.00;
    let title = 'Desafio das Estrelas - Plano Comandante (Anual)';

    if (interval.startsWith('pro_')) {
      const parts = interval.split('_');
      const limit = parseInt(parts[1], 10);
      const planNames: Record<number, string> = {
        1: 'Pioneiro', 4: 'Esquadrão', 9: 'Frota Estelar', 15: 'Aliança',
      };
      const planAmounts: Record<number, number> = {
        1: 199.00, 4: 597.00, 9: 1390.00, 15: 1900.00,
      };
      amount = planAmounts[limit] ?? 199.00;
      title = `Desafio das Estrelas - Plano ${planNames[limit] ?? 'Pro'} Anual (${limit} Licenças)`;
    }

    const payment = new Payment(mpClient);

    const paymentBody: any = {
      transaction_amount: amount,
      description: title,
      payment_method_id: paymentMethodId || 'pix',
      payer: {
        email: user.email!,
        ...(identificationType && identificationNumber && {
          identification: {
            type: identificationType,
            number: identificationNumber,
          },
        }),
      },
      external_reference: user.id,
    };

    const response = await payment.create({
      body: paymentBody,
      requestOptions: { idempotencyKey: crypto.randomUUID() },
    });

    console.log(`[PIX Checkout ${interval}] Status: ${response.status} | ID: ${response.id}`);

    // PIX fica como "pending" até o webhook confirmar o pagamento
    // A ativação real ocorre via webhook (/api/webhooks/mercadopago)
    const statusOk = response.status !== 'rejected' && response.status !== 'cancelled';

    return NextResponse.json({
      success: statusOk,
      status: response.status,
      id: response.id,
      paymentMethodId: paymentMethodId || 'pix',
      qrCode: response.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64: response.point_of_interaction?.transaction_data?.qr_code_base64,
    });

  } catch (error: any) {
    console.error('[Checkout] Erro geral:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar pagamento.' },
      { status: 500 }
    );
  }
}
