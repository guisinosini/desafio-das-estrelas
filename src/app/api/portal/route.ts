import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    let cancelledOnGateway = false;

    // ——— TENTATIVA 1: CANCELAR ASSINATURA NA STRIPE (SE HOUVER) ———
    try {
      const customers = await stripe.customers.list({
        email: user.email!,
        limit: 1,
      });

      if (customers.data.length > 0) {
        const activeSubs = await stripe.subscriptions.list({
          customer: customers.data[0].id,
          status: 'active',
        });

        if (activeSubs.data.length > 0) {
          // Cancela imediatamente a assinatura no Stripe
          await stripe.subscriptions.cancel(activeSubs.data[0].id);
          cancelledOnGateway = true;
        }
      }
    } catch (stripeErr) {
      console.warn('Nenhuma assinatura ativa encontrada na Stripe ou erro na busca:', stripeErr);
    }

    // ——— TENTATIVA 2: CANCELAR NO MERCADO PAGO (SE NÃO TIVER SIDO CANCELADA NA STRIPE) ———
    if (!cancelledOnGateway) {
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

      if (accessToken) {
        try {
          const searchRes = await fetch(
            `https://api.mercadopago.com/preapproval/search?payer_email=${encodeURIComponent(user.email!)}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (searchRes.ok) {
            const searchData = await searchRes.json();
            const activeSub = searchData.results?.find(
              (sub: any) => sub.status === 'authorized' || sub.status === 'pending'
            );

            if (activeSub) {
              const cancelRes = await fetch(
                `https://api.mercadopago.com/preapproval/${activeSub.id}`,
                {
                  method: 'PUT',
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    status: 'cancelled',
                  }),
                }
              );

              if (cancelRes.ok) {
                cancelledOnGateway = true;
              }
            }
          }
        } catch (mpErr) {
          console.warn('Nenhuma assinatura ativa encontrada no Mercado Pago ou erro na busca:', mpErr);
        }
      }
    }

    // Atualizamos o banco de dados local imediatamente (apenas colunas que existem no schema)
    await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: 'cancelled',
        subscription_price_id: null,
      })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      message: cancelledOnGateway 
        ? 'Assinatura cancelada com sucesso no gateway correspondente e localmente.'
        : 'Assinatura desativada no banco local (nenhum contrato ativo encontrado nos gateways).',
    });
  } catch (error: any) {
    console.error('Portal Error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao gerenciar assinatura.' }, { status: 500 });
  }
}
