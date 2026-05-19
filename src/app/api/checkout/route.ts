import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { PreApproval, Payment } from 'mercadopago';
import { mpClient } from '@/lib/mercadopago';

// Supabase Admin para atualizar perfil com service role (ignora RLS)
const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    const prices = {
      monthly: 19.90,
      yearly: 199.00,
    };

    const amount = interval === 'yearly' ? prices.yearly : prices.monthly;
    const title = interval === 'yearly'
      ? 'Desafio das Estrelas - Plano Comandante (Anual)'
      : 'Desafio das Estrelas - Plano Cadete (Mensal)';

    // ——— MODELO HÍBRIDO DE PAGAMENTO ———
    if (interval === 'yearly') {
      // Plano ANUAL: Processado como pagamento único com suporte total a parcelamento em até 12x
      const payment = new Payment(mpClient);
      
      const response = await payment.create({
        body: {
          transaction_amount: amount,
          token: cardTokenId,
          description: title,
          installments: Number(installments || 1),
          payment_method_id: paymentMethodId,
          issuer_id: issuerId,
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
        }
      });

      console.log('[MP Checkout Anual] Status do pagamento:', response.status, '| ID:', response.id);

      // Aceita approved, in_process e pending (sandbox retorna 'pending' em pagamentos de teste 1x)
      const statusOk = ['approved', 'in_process', 'pending'].includes(response.status || '');

      if (statusOk) {
        const { error: dbError } = await supabaseAdmin
          .from('profiles')
          .update({
            is_premium: true,
            plan_type: 'commander',
            subscription_status: 'active',
            subscription_price_id: 'yearly',
          })
          .eq('id', user.id);

        if (dbError) {
          console.error('[MP Checkout Anual] Erro ao atualizar Supabase:', dbError);
        } else {
          console.log('[MP Checkout Anual] Perfil atualizado como premium com sucesso!');
        }
      }

      return NextResponse.json({
        success: statusOk,
        status: response.status,
        id: response.id,
      });

    } else {
      // Plano MENSAL: Processado como assinatura recorrente automática (PreApproval)
      const preApproval = new PreApproval(mpClient);

      const response = await preApproval.create({
        body: {
          reason: title,
          auto_recurring: {
            frequency: 1,
            frequency_type: 'months',
            transaction_amount: amount,
            currency_id: 'BRL',
          },
          card_token_id: cardTokenId,
          payer_email: user.email!,
          external_reference: user.id,
          status: 'authorized',
          ...(identificationType && identificationNumber && {
            payer: {
              identification: {
                type: identificationType,
                number: identificationNumber,
              },
            },
          }),
        }
      });

      console.log('[MP Checkout Mensal] Status da assinatura:', response.status, '| ID:', response.id);

      if (response.status === 'authorized' || response.status === 'pending') {
        const { error: dbError } = await supabaseAdmin
          .from('profiles')
          .update({
            is_premium: true,
            plan_type: 'cadet',
            subscription_status: 'active',
            subscription_price_id: 'monthly',
          })
          .eq('id', user.id);

        if (dbError) {
          console.error('[MP Checkout Mensal] Erro ao atualizar Supabase:', dbError);
        } else {
          console.log('[MP Checkout Mensal] Perfil atualizado como premium com sucesso!');
        }
      }

      return NextResponse.json({
        success: ['authorized', 'pending'].includes(response.status || ''),
        status: response.status,
        id: response.id,
      });
    }

  } catch (error: any) {
    console.error('Checkout Transparente Error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao processar pagamento.' }, { status: 500 });
  }
}
