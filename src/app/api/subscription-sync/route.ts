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

    // 1. Garante que o e-mail esteja preenchido na tabela profiles para fins de webhooks do Stripe
    if (user.email) {
      await supabase
        .from('profiles')
        .update({ email: user.email })
        .eq('id', user.id)
        .is('email', null);
    }

    // 2. Busca o perfil atual do usuário no banco
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, subscription_id, subscription_status, subscription_price_id')
      .eq('id', user.id)
      .single();

    let stripeCustomerId = profile?.stripe_customer_id;
    let subscriptionId = profile?.subscription_id;
    let subscriptionStatus = profile?.subscription_status;
    let subscriptionPriceId = profile?.subscription_price_id;

    let activeSubFound = false;

    // 3. Algoritmo de Varredura de Segurança: Busca clientes no Stripe pelo e-mail do usuário logado
    if (user.email) {
      console.log(`🔍 [SubscriptionSync] Varrendo clientes no Stripe para e-mail: ${user.email}`);
      try {
        const customers = await stripe.customers.list({
          email: user.email,
          limit: 10, // Varre até os últimos 10 customers criados com esse e-mail
        });

        for (const customer of customers.data) {
          const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            status: 'active',
            limit: 1,
          });

          if (subscriptions.data.length > 0) {
            const sub = subscriptions.data[0] as any;
            stripeCustomerId = customer.id;
            subscriptionId = sub.id;
            subscriptionStatus = 'active';
            subscriptionPriceId = sub.items.data[0].price.id;
            activeSubFound = true;

            console.log(`✅ [SubscriptionSync] Assinatura ativa localizada no Stripe para o cliente: ${customer.id}`);
            
            // Grava no banco de dados de vigência
            await supabase
              .from('profiles')
              .update({
                stripe_customer_id: stripeCustomerId,
                subscription_id: subscriptionId,
                subscription_status: 'active',
                subscription_price_id: subscriptionPriceId,
                subscription_start: new Date(sub.current_period_start * 1000).toISOString(),
                subscription_end: new Date(sub.current_period_end * 1000).toISOString(),
              })
              .eq('id', user.id);

            break; // Para a varredura ao encontrar a primeira assinatura ativa
          }
        }
      } catch (stripeErr) {
        console.error("⚠️ Erro ao listar assinaturas do Stripe:", stripeErr);
      }
    }

    // 4. Caso nenhuma assinatura ativa seja encontrada no Stripe
    if (!activeSubFound) {
      console.log("🔍 [SubscriptionSync] Nenhuma assinatura ativa encontrada no Stripe.");
      
      // Se no banco de dados o perfil já consta como "active" (Ex: concessão de suporte manual),
      // nós MANTEMOS o acesso ativo dele, não sobrescrevendo com inativo!
      if (profile?.subscription_status === 'active') {
        console.log("🛡️ [SubscriptionSync] Mantendo status de faturamento ativo concedido por suporte.");
        subscriptionStatus = 'active';
      } else {
        // Se no banco não estava ativo e no Stripe também não, garante o status inativo
        subscriptionStatus = 'inactive';
        await supabase
          .from('profiles')
          .update({
            subscription_status: 'inactive'
          })
          .eq('id', user.id);
      }
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
