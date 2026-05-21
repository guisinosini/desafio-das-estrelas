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

    if (!priceId) {
      throw new Error('ID do preço do Stripe não configurado. Verifique as variáveis de ambiente.');
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
    let subscription: Stripe.Subscription;
    const subParams: Stripe.SubscriptionCreateParams = {
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: user.id,
        planType: selectedPlan === 'yearly' ? 'commander' : 'cadet',
        interval: selectedPlan,
      },
    };

    try {
      subscription = await stripe.subscriptions.create(subParams);
    } catch (subErr: any) {
      // Stripe proíbe usar moedas diferentes no mesmo Customer.
      // Se isso acontecer, criamos um Customer secundário.
      if (subErr.message && subErr.message.includes('cannot combine currencies')) {
        console.log(`[Stripe] Conflito de moeda para ${user.email}. Criando novo Customer...`);
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

    const invoice = subscription.latest_invoice as any;
    const clientSecret = invoice?.payment_intent?.client_secret;

    if (!clientSecret) {
      console.log(`[Stripe Error] Sem client_secret. Status da Sub: ${subscription.status}`);
      console.log(`[Stripe Error] Invoice data:`, JSON.stringify(invoice, null, 2));
    }

    return NextResponse.json({
      clientSecret: clientSecret,
      subscriptionId: subscription.id,
      amount: selectedPlan === 'yearly' ? 99.00 : 9.90,
      currency: currency.toUpperCase(),
    });
  } catch (error: any) {
    console.error('Stripe Intent Error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao criar sessão de pagamento.' }, { status: 500 });
  }
}
