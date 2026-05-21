import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

async function resolveClientSecret(subscription: Stripe.Subscription): Promise<string | null> {
  // Tenta extrair o client_secret da subscription diretamente
  const invoice = subscription.latest_invoice as any;
  let paymentIntent = invoice?.payment_intent;

  // Se a invoice veio como string (não expandida), busca ela explicitamente
  if (typeof invoice === 'string') {
    const fullInvoice = await stripe.invoices.retrieve(invoice);
    const piId = fullInvoice.payment_intent;
    if (typeof piId === 'string') {
      const pi = await stripe.paymentIntents.retrieve(piId);
      return pi.client_secret;
    }
    if (piId && typeof piId === 'object') {
      return (piId as any).client_secret;
    }
    return null;
  }

  // Se o payment_intent veio como string (ID), busca ele explicitamente
  if (typeof paymentIntent === 'string') {
    const pi = await stripe.paymentIntents.retrieve(paymentIntent);
    return pi.client_secret;
  }

  // Se o payment_intent veio expandido como objeto
  if (paymentIntent?.client_secret) {
    return paymentIntent.client_secret;
  }

  // Fallback para Free Trial: usa Setup Intent
  if (subscription.pending_setup_intent) {
    const siId = subscription.pending_setup_intent as any;
    if (typeof siId === 'string') {
      const si = await stripe.setupIntents.retrieve(siId);
      return si.client_secret;
    }
    return (siId as any)?.client_secret ?? null;
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ requireAuth: true }, { status: 401 });
    }

    const { selectedPlan, language } = await req.json();

    // Determina Moeda e Price ID com base no idioma
    let currency = 'usd';
    let priceId = '';

    if (language === 'fr' || language === 'it') {
      currency = 'eur';
      priceId = selectedPlan === 'yearly'
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY_EUR || ''
        : process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY_EUR || '';
    } else {
      currency = 'usd';
      priceId = selectedPlan === 'yearly'
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY_USD || ''
        : process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY_USD || '';
    }

    console.log(`[Stripe] Plan: ${selectedPlan}, Currency: ${currency}, PriceId: "${priceId}"`);

    if (!priceId) {
      throw new Error(`ID do preço da Stripe não configurado para "${selectedPlan}" em "${currency}". Verifique as variáveis de ambiente.`);
    }

    // 1. Buscar ou criar o Customer no Stripe
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
    let customerId = customers.data[0]?.id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
    }

    console.log(`[Stripe] Customer ID: ${customerId}`);

    // 2. Cancelar qualquer assinatura incompleta antiga para evitar conflito
    const existingSubs = await stripe.subscriptions.list({
      customer: customerId,
      status: 'incomplete',
      limit: 5,
    });

    for (const sub of existingSubs.data) {
      console.log(`[Stripe] Cancelando assinatura incompleta antiga: ${sub.id}`);
      await stripe.subscriptions.cancel(sub.id);
    }

    // 3. Criar nova assinatura
    let subscription: Stripe.Subscription;
    const subParams: Stripe.SubscriptionCreateParams = {
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent', 'pending_setup_intent'],
      metadata: {
        userId: user.id,
        planType: selectedPlan === 'yearly' ? 'commander' : 'cadet',
        interval: selectedPlan,
      },
    };

    try {
      subscription = await stripe.subscriptions.create(subParams);
    } catch (subErr: any) {
      if (subErr.message?.includes('cannot combine currencies')) {
        console.log(`[Stripe] Conflito de moeda. Criando novo Customer...`);
        const newCustomer = await stripe.customers.create({
          email: user.email!,
          metadata: { userId: user.id, fallback: 'true' },
        });
        subParams.customer = newCustomer.id;
        subscription = await stripe.subscriptions.create(subParams);
      } else {
        throw subErr;
      }
    }

    console.log(`[Stripe] Subscription criada: ${subscription.id}, status: ${subscription.status}`);

    // 4. Resolver o client_secret de forma robusta
    const clientSecret = await resolveClientSecret(subscription);

    console.log(`[Stripe] client_secret encontrado: ${clientSecret ? 'SIM' : 'NÃO'}`);

    if (!clientSecret) {
      throw new Error(`Stripe criou a assinatura (${subscription.id}) mas não retornou o token de pagamento. Status: ${subscription.status}`);
    }

    return NextResponse.json({
      clientSecret,
      subscriptionId: subscription.id,
      amount: selectedPlan === 'yearly' ? 99.00 : 9.90,
      currency: currency.toUpperCase(),
    });

  } catch (error: any) {
    console.error('[Stripe Intent Error]', error.message);
    return NextResponse.json({ error: error.message || 'Erro ao criar sessão de pagamento.' }, { status: 500 });
  }
}
