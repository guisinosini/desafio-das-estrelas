import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignorado
            }
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Garante que o e-mail esteja preenchido na tabela profiles para fins de webhooks do Stripe
    if (user.email) {
      await supabase
        .from('profiles')
        .update({ email: user.email })
        .eq('id', user.id)
        .is('email', null);
    }

    // Busca o perfil atual do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, subscription_id, subscription_status, subscription_price_id')
      .eq('id', user.id)
      .single();

    let stripeCustomerId = profile?.stripe_customer_id;
    let subscriptionId = profile?.subscription_id;
    let subscriptionStatus = profile?.subscription_status;
    let subscriptionPriceId = profile?.subscription_price_id;

    // Caso o usuário não tenha o stripe_customer_id cadastrado (ex: teste local em que o webhook de checkout não rodou),
    // nós buscamos o cliente no Stripe pelo e-mail da conta do Supabase!
    if (!stripeCustomerId && user.email) {
      console.log(`🔍 [SubscriptionSync] Buscando e-mail no Stripe: ${user.email}`);
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        stripeCustomerId = customers.data[0].id;
      }
    }

    // Se encontramos o cliente no Stripe, listamos as assinaturas ativas dele
    if (stripeCustomerId && (!subscriptionId || subscriptionStatus !== 'active' || !subscriptionPriceId)) {
      console.log(`🔍 [SubscriptionSync] Buscando assinaturas ativas do cliente: ${stripeCustomerId}`);
      const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: 'active',
        limit: 1,
      });

      if (subscriptions.data.length > 0) {
        const sub = subscriptions.data[0] as any;
        subscriptionId = sub.id;
        subscriptionStatus = 'active';
        subscriptionPriceId = sub.items.data[0].price.id;

        console.log(`💾 [SubscriptionSync] Sincronizando dados no Supabase para ${user.email}:`, {
          stripeCustomerId,
          subscriptionId,
          subscriptionStatus,
          subscriptionPriceId
        });

        // Grava no banco as chaves de assinatura corretas do Stripe
        await supabase
          .from('profiles')
          .update({
            stripe_customer_id: stripeCustomerId,
            subscription_id: subscriptionId,
            subscription_status: subscriptionStatus,
            subscription_price_id: subscriptionPriceId,
            subscription_start: new Date(sub.current_period_start * 1000).toISOString(),
            subscription_end: new Date(sub.current_period_end * 1000).toISOString(),
          })
          .eq('id', user.id);
      }
    } else if (subscriptionId) {
      // Caso ele já tenha os IDs mas queira sincronizar as datas mais atualizadas
      const sub = (await stripe.subscriptions.retrieve(subscriptionId)) as any;
      subscriptionPriceId = sub.items.data[0].price.id;

      await supabase
        .from('profiles')
        .update({ 
          subscription_status: sub.status === 'active' ? 'active' : 'inactive',
          subscription_price_id: subscriptionPriceId,
          subscription_start: new Date(sub.current_period_start * 1000).toISOString(),
          subscription_end: new Date(sub.current_period_end * 1000).toISOString(),
        })
        .eq('id', user.id);
    }

    return NextResponse.json({
      priceId: subscriptionPriceId || null,
      status: subscriptionStatus || 'inactive'
    });
  } catch (e: any) {
    console.error('💥 Subscription Sync Error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
