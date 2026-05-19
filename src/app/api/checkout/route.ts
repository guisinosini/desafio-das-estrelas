import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { PreApproval } from 'mercadopago';
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

    const preApproval = new PreApproval(mpClient);

    const response = await preApproval.create({
      body: {
        reason: title,
        auto_recurring: {
          frequency: interval === 'yearly' ? 12 : 1,
          frequency_type: 'months',
          transaction_amount: amount,
          currency_id: 'BRL',
        },
        card_token_id: cardTokenId,
        payer_email: user.email!,
        external_reference: user.id,
        status: 'authorized',
        // Dados de identificação do pagador (necessário para cartão transparente)
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

    if (response.status === 'authorized') {
      const planType = interval === 'yearly' ? 'commander' : 'cadet';

      await supabaseAdmin
        .from('profiles')
        .update({
          is_premium: true,
          plan_type: planType,
          subscription_status: 'active',
          subscription_price_id: interval,
        })
        .eq('id', user.id);
    }

    return NextResponse.json({
      success: true,
      status: response.status,
      id: response.id,
    });
  } catch (error: any) {
    console.error('Checkout Transparente Error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao processar pagamento.' }, { status: 500 });
  }
}
