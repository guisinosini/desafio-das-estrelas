import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ requireAuth: true }, { status: 401 });
    }

    const { selectedPlan, language } = await req.json();

    // Determina Moeda, Price ID e Valores com base no idioma do usuário
    let currency = 'usd';
    let priceId = '';
    let amountCents = 9900; // Valor padrão Anual ($99.00 ou €99.00)

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

    if (selectedPlan === 'yearly') {
      // Plano ANUAL: Pagamento Único com Stripe Payment Intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 9900, // $99.00 ou €99.00 em centavos
        currency: currency,
        metadata: {
          userId: user.id,
          planType: 'commander',
          interval: 'yearly',
        },
        automatic_payment_methods: { enabled: true },
      });

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        amount: 99.00,
        currency: currency.toUpperCase(),
      });
    } else {
      // Plano MENSAL: Assinatura recorrente com Stripe Subscription
      if (!priceId) {
        throw new Error('ID do preço do Stripe não configurado.');
      }

      // 1. Buscar ou criar o cliente no Stripe
      const customers = await stripe.customers.list({
        email: user.email!,
        limit: 1,
      });

      let customerId = customers.data[0]?.id;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email!,
          metadata: { userId: user.id },
        });
        customerId = customer.id;
      }

      // 2. Criar a assinatura no Stripe em modo incompleto (aguardando primeiro pagamento)
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId: user.id,
          planType: 'cadet',
          interval: 'monthly',
        },
      });

      const invoice = subscription.latest_invoice as any;
      const clientSecret = invoice?.payment_intent?.client_secret;

      return NextResponse.json({
        clientSecret: clientSecret,
        subscriptionId: subscription.id,
        amount: 9.90,
        currency: currency.toUpperCase(),
      });
    }
  } catch (error: any) {
    console.error('Stripe Intent Error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao criar sessão de pagamento.' }, { status: 500 });
  }
}
