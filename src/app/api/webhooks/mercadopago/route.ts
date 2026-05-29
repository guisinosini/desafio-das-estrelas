import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Payment, PreApproval } from 'mercadopago';
import { mpClient } from '@/lib/mercadopago';

// Instância do Supabase Service Role para ignorar RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Mapa reverso: Plan ID do Mercado Pago → interval interno da aplicação.
 * Permite identificar o plano exato a partir de qualquer webhook de pagamento recorrente.
 */
function getIntervalFromPlanId(planId: string): string | null {
  if (!planId) return null;
  const map: Record<string, string> = {
    [process.env.MP_PLAN_ID_MONTHLY        || '__VAZIO__']: 'monthly',
    [process.env.MP_PLAN_ID_YEARLY         || '__VAZIO__']: 'yearly',
    [process.env.MP_PLAN_ID_PRO_1_MONTHLY  || '__VAZIO__']: 'pro_1_monthly',
    [process.env.MP_PLAN_ID_PRO_4_MONTHLY  || '__VAZIO__']: 'pro_4_monthly',
    [process.env.MP_PLAN_ID_PRO_9_MONTHLY  || '__VAZIO__']: 'pro_9_monthly',
    [process.env.MP_PLAN_ID_PRO_15_MONTHLY || '__VAZIO__']: 'pro_15_monthly',
    [process.env.MP_PLAN_ID_PRO_1_YEARLY   || '__VAZIO__']: 'pro_1_yearly',
    [process.env.MP_PLAN_ID_PRO_4_YEARLY   || '__VAZIO__']: 'pro_4_yearly',
    [process.env.MP_PLAN_ID_PRO_9_YEARLY   || '__VAZIO__']: 'pro_9_yearly',
    [process.env.MP_PLAN_ID_PRO_15_YEARLY  || '__VAZIO__']: 'pro_15_yearly',
  };
  return map[planId] ?? null;
}

/**
 * Ativa o perfil do usuário e, se for plano profissional,
 * sincroniza a tabela professional_subscriptions com o limite correto de licenças.
 */
async function ativarPerfil(userId: string, interval: string): Promise<void> {
  // 1. Atualiza o perfil principal
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ subscription_status: 'active', subscription_price_id: interval })
    .eq('id', userId);

  if (profileError) {
    console.error(`[MP Webhook] Erro ao ativar perfil ${userId}:`, profileError);
  }

  // 2. Se for plano profissional, sincroniza professional_subscriptions
  if (interval.startsWith('pro_')) {
    const limit = parseInt(interval.split('_')[1], 10);

    const { data: existingSub } = await supabase
      .from('professional_subscriptions')
      .select('id')
      .eq('professional_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (existingSub && existingSub.length > 0) {
      await supabase.from('professional_subscriptions').update({
        plan_limit: limit,
        status: 'active',
        updated_at: new Date().toISOString(),
      }).eq('id', existingSub[0].id);
    } else {
      await supabase.from('professional_subscriptions').insert({
        professional_id: userId,
        plan_limit: limit,
        status: 'active',
      });
    }
  }
}

/**
 * Desativa o perfil do usuário e marca a assinatura profissional como inativa.
 */
async function desativarPerfil(userId: string): Promise<void> {
  await supabase
    .from('profiles')
    .update({ subscription_status: 'inactive' })
    .eq('id', userId);

  // Também marca a assinatura profissional como inativa (se existir)
  await supabase
    .from('professional_subscriptions')
    .update({ status: 'inactive', updated_at: new Date().toISOString() })
    .eq('professional_id', userId);
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    let id = url.searchParams.get('data.id') || url.searchParams.get('id');
    let type = url.searchParams.get('type') || url.searchParams.get('topic');

    // MP envia webhooks mais recentes como JSON no body
    let bodyData: any = null;
    try { bodyData = await req.json(); } catch (e) { /* body não é JSON, ignora */ }

    if (!id && bodyData)   id   = bodyData?.data?.id || bodyData?.id;
    if (!type && bodyData) {
      type = bodyData?.type || bodyData?.topic;
      if (!type && bodyData?.action?.includes('payment.'))     type = 'payment';
      else if (!type && bodyData?.action?.includes('preapproval.')) type = 'subscription_preapproval';
    }

    if (!id) return new NextResponse('OK', { status: 200 });

    // ─────────────────────────────────────────────────────────────────
    // EVENTO: Mudança de status de assinatura (PreApproval)
    // Cobre: criação, renovação, cancelamento, pausa de assinaturas recorrentes
    // ─────────────────────────────────────────────────────────────────
    if (type === 'subscription_preapproval') {
      const preApproval = new PreApproval(mpClient);
      const data = await preApproval.get({ id });

      const userId = data.external_reference;
      if (!userId || userId === 'anonymous') return new NextResponse('OK', { status: 200 });

      if (data.status === 'authorized') {
        // Ativação via PreApproval (funciona como backup — checkout já ativou no fluxo principal)
        const interval = getIntervalFromPlanId(data.preapproval_plan_id || '');

        if (interval) {
          await ativarPerfil(userId, interval);
          console.log(`[MP Webhook] PreApproval ${id} authorized → active (${interval}) para usuário ${userId}`);
        } else {
          // Plan ID não mapeado — ativa apenas o status sem alterar o priceId existente
          console.warn(`[MP Webhook] Plan ID "${data.preapproval_plan_id}" não encontrado no mapa. Ativando apenas status.`);
          await supabase.from('profiles').update({ subscription_status: 'active' }).eq('id', userId);
        }

      } else if (['pending', 'paused', 'cancelled', 'rejected'].includes(data.status || '')) {
        await desativarPerfil(userId);
        console.log(`[MP Webhook] PreApproval ${id} (${data.status}) → inactive para usuário ${userId}`);
      }

    // ─────────────────────────────────────────────────────────────────
    // EVENTO: Pagamento processado (Payment)
    // Cobre: pagamentos PIX anuais e cobranças recorrentes de PreApproval
    // ─────────────────────────────────────────────────────────────────
    } else if (type === 'payment') {
      const payment = new Payment(mpClient);
      const paymentData = await payment.get({ id });

      const userId = paymentData.external_reference || paymentData.metadata?.external_reference;
      if (!userId || userId === 'anonymous') {
        console.warn(`[MP Webhook] Pagamento ${id} sem external_reference. Ignorando.`);
        return new NextResponse('OK', { status: 200 });
      }

      if (['approved', 'in_process', 'authorized'].includes(paymentData.status || '')) {

        // Estratégia 1: Identificar o plano pelo preapproval_plan_id do PreApproval vinculado
        let interval: string | null = null;
        const preapprovalId = (paymentData as any).preapproval_id
          || paymentData.metadata?.preapproval_id;

        if (preapprovalId) {
          try {
            const preApproval = new PreApproval(mpClient);
            const preApprovalData = await preApproval.get({ id: preapprovalId });
            interval = getIntervalFromPlanId(preApprovalData.preapproval_plan_id || '');
            if (interval) {
              console.log(`[MP Webhook] Plano identificado via PreApproval: ${interval}`);
            }
          } catch (e) {
            console.warn('[MP Webhook] Falha ao buscar PreApproval vinculado ao pagamento:', e);
          }
        }

        // Estratégia 2 (fallback): Preservar o priceId que já está salvo no banco
        if (!interval) {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('subscription_price_id')
            .eq('id', userId)
            .maybeSingle();

          interval = existingProfile?.subscription_price_id || 'monthly';
          console.log(`[MP Webhook] Plano identificado via DB (fallback): ${interval}`);
        }

        await ativarPerfil(userId, interval);
        console.log(`[MP Webhook] Payment ${id} (${paymentData.status}) → active (${interval}) para usuário ${userId}`);

      } else if (['pending', 'rejected', 'refunded', 'charged_back', 'cancelled', 'in_mediation'].includes(paymentData.status || '')) {
        await desativarPerfil(userId);
        console.log(`[MP Webhook] Payment ${id} (${paymentData.status}) → inactive para usuário ${userId}`);
      }
    }

    return new NextResponse('OK', { status: 200 });

  } catch (error) {
    console.error('[MP Webhook] Erro geral:', error);
    // Retorna 200 para evitar reenvio infinito pelo MP
    return new NextResponse('Webhook Handler Error', { status: 200 });
  }
}
