import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let { priceId, interval } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    // Sanitiza o priceId de aspas ou espaços extras vindos do .env.local
    priceId = priceId.trim().replace(/^["']|["']$/g, '');

    const origin = req.headers.get('origin');

    const sessionParams: any = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Redireciona para a raiz com stage=register e session_id para cadastro imediato
      success_url: `${origin}/?stage=register&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#pricing`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    };

    if (interval === 'yearly') {
      sessionParams.payment_method_options = {
        card: {
          installments: {
            enabled: true,
          },
        },
      };
    }

    if (user && user.email) {
      sessionParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
