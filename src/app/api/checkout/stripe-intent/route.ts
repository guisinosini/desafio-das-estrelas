import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

async function resolveClientSecret(subscription: Stripe.Subscription): Promise<string> {
  const invoiceId = typeof subscription.latest_invoice === 'string'
    ? subscription.latest_invoice
    : (subscription.latest_invoice as any)?.id;

  if (!invoiceId) {
    const siId = typeof subscription.pending_setup_intent === 'string'
      ? subscription.pending_setup_intent
      : (subscription.pending_setup_intent as any)?.id;
    
    if (siId) {
      const si = await stripe.setupIntents.retrieve(siId);
      return si.client_secret || 'ERROR: Setup Intent exists mas não tem client_secret';
    }
    return `ERROR: Sem invoiceId e sem pending_setup_intent na subscription ${subscription.id}`;
  }

  const invoice = await stripe.invoices.retrieve(invoiceId, {
    expand: ['payment_intent'],
  }) as any;

  if (!invoice.payment_intent) {
    return `ERROR: A fatura ${invoiceId} não gerou payment_intent. Status da fatura: ${invoice.status}, Valor devido: ${invoice.amount_due}`;
  }

  const paymentIntentId = typeof invoice.payment_intent === 'string'
    ? invoice.payment_intent
    : invoice.payment_intent?.id;

  if (!paymentIntentId) {
    return `ERROR: Falha ao extrair o ID do payment_intent: ${JSON.stringify(invoice.payment_intent)}`;
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  
  if (!paymentIntent.client_secret) {
    return `ERROR: PaymentIntent ${paymentIntentId} não tem client_secret. Status do PI: ${paymentIntent.status}`;
  }

  return paymentIntent.client_secret;
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

    // 2. Verificar se já existe uma subscription incompleta válida para reutilizar
    const existingSubs = await stripe.subscriptions.list({
      customer: customerId,
      status: 'incomplete',
      limit: 5,
      expand: ['data.latest_invoice'],
    });

    // Reutiliza a subscription incompleta se o Price ID for o mesmo
    const reusableSub = existingSubs.data.find((sub: any) =>
      sub.items.data[0]?.price?.id === priceId
    );

    if (reusableSub) {
      console.log(`[Stripe] Reutilizando subscription incompleta: ${reusableSub.id}`);
      const clientSecret = await resolveClientSecret(reusableSub);
      if (clientSecret && !clientSecret.startsWith('ERROR:')) {
        return NextResponse.json({
          clientSecret,
          subscriptionId: reusableSub.id,
          amount: selectedPlan === 'yearly' ? 99.00 : 9.90,
          currency: currency.toUpperCase(),
        });
      } else {
        console.log(`[Stripe] Falha ao reutilizar. Motivo: ${clientSecret}`);
        // Se a antiga está bugada, cancelamos ela para tentar criar uma nova do zero
        await stripe.subscriptions.cancel(reusableSub.id);
      }
    }

    // 3. Criar nova assinatura
    let subscription: Stripe.Subscription;
    const subParams: Stripe.SubscriptionCreateParams = {
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { 
        save_default_payment_method: 'on_subscription',
        payment_method_types: ['card'] // Força a Stripe a gerar um PaymentIntent para Cartão
      },
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

    if (clientSecret.startsWith('ERROR:')) {
      throw new Error(`Diagnóstico detalhado: ${clientSecret}`);
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
