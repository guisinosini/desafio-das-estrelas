import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { Payment, PreApproval } from 'mercadopago';
import { mpClient } from '@/lib/mercadopago';

// Instância do Supabase Service Role para ignorar RLS e poder atualizar a tabela
const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ status: 'inactive' });
    }

    let isMpActive = false;

    // Busca o status atual no banco de dados local para preservar o priceId (como pro_1_monthly)
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_price_id')
      .eq('id', user.id)
      .maybeSingle();

    if (user.email) {
      try {
        const payment = new Payment(mpClient);
        
        // Vamos buscar os pagamentos reais vinculados ao email (a verdade final sobre a transação)
        // O PreApproval do MP pode ficar 'authorized' mesmo quando a tentativa de cobrança falha.
        // Por isso, validamos apenas se existe um Payment real aprovado ou processando.
        // 1. Busca por Assinaturas Ativas (Resolve o problema do Free Trial)
        const preApproval = new PreApproval(mpClient);
        const preApprovalsResult = await preApproval.search({
          options: { payer_email: user.email, status: 'authorized' }
        });

        if (preApprovalsResult.results && preApprovalsResult.results.length > 0) {
          isMpActive = true;
        }

        // 2. Busca por Pagamentos Únicos (Payment) caso a assinatura não seja encontrada
        if (!isMpActive) {
          const paymentsResult = await payment.search({
            options: { payer_email: user.email }
          });

          if (paymentsResult.results && paymentsResult.results.length > 0) {
            const now = new Date();

            for (const pay of paymentsResult.results) {
              if (!pay.status || !pay.date_created) continue;

              // Se o pagamento for pendente/rejeitado, ignoramos e continuamos procurando
              if (['approved', 'in_process', 'authorized'].includes(pay.status)) {
                const payDate = new Date(pay.date_created);
                const desc = pay.description?.toLowerCase() || '';
                const isYearly = desc.includes('anual') || desc.includes('comandante');
                
                // Dá uma carência de dias com base no plano detectado
                const daysValid = isYearly ? 366 : 32;
                const expirationDate = new Date(payDate.getTime() + daysValid * 24 * 60 * 60 * 1000);

                if (now <= expirationDate) {
                  isMpActive = true;
                  break; // Achou pelo menos um pagamento válido dentro do prazo!
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn("[Sync] Erro ao buscar pagamento no MP", err);
      }
    }

    const dbStatus = profile?.subscription_status;
    const finalStatus = isMpActive ? 'active' : 'inactive';

    // Atualiza apenas se divergir, preservando o priceId que já estava no banco
    if (dbStatus !== finalStatus) {
      await supabaseAdmin
        .from('profiles')
        .update({ subscription_status: finalStatus })
        .eq('id', user.id);
    }

    return NextResponse.json({
      status: finalStatus,
      priceId: profile?.subscription_price_id || null,
    });
  } catch (error) {
    console.error('Erro na sincronização de assinatura:', error);
    return NextResponse.json({ status: 'inactive' }, { status: 500 });
  }
}
