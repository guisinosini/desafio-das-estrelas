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

    // Determina Moeda e Valor da Cobrança com base no idioma e plano
    let currency = 'usd';
    let amountCents = 0; // em centavos

    if (language === 'fr' || language === 'it') {
      currency = 'eur';
    } else {
      currency = 'usd';
    }

    // Define os valores (9.90 ou 99.00)
    if (selectedPlan === 'yearly') {
      amountCents = 9900; 
    } else {
      amountCents = 990; 
    }

    console.log(`[Stripe] Gerando PaymentIntent: ${selectedPlan}, Valor: ${amountCents}, Moeda: ${currency}`);

    // Criar a Intenção de Pagamento Única (PaymentIntent)
    // Isso evita o bloqueio da Stripe Brasil para assinaturas em moeda estrangeira
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: currency,
      metadata: {
        userId: user.id,
        planType: selectedPlan === 'yearly' ? 'commander' : 'cadet',
        interval: selectedPlan,
      },
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: amountCents / 100,
      currency: currency.toUpperCase(),
    });

  } catch (error: any) {
    console.error('[Stripe Intent Error]', error.message);
    return NextResponse.json({ error: error.message || 'Erro ao criar sessão de pagamento.' }, { status: 500 });
  }
}
