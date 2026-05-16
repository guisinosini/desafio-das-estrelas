import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`);
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  // Inicializa Supabase com a Service Role Key
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { 
      cookies: {
        getAll() { return [] },
        setAll(cookiesToSet) {}
      }
    }
  );

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any;
      const customerEmail = session.customer_details?.email;
      const stripeCustomerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (customerEmail) {
        // Atualiza o perfil do usuário baseado no e-mail
        const { error } = await supabase
          .from('profiles')
          .update({
            stripe_customer_id: stripeCustomerId,
            subscription_id: subscriptionId,
            subscription_status: 'active',
          })
          .eq('email', customerEmail); // Nota: Certifique-se que a tabela profiles tem a coluna email ou use outro identificador

        if (error) console.error('Error updating profile on checkout:', error);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as any;
      const stripeCustomerId = subscription.customer as string;

      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'inactive',
        })
        .eq('stripe_customer_id', stripeCustomerId);

      if (error) console.error('Error updating profile on cancellation:', error);
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as any;
      const stripeCustomerId = invoice.customer as string;

      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
        })
        .eq('stripe_customer_id', stripeCustomerId);

      if (error) console.error('Error updating profile on payment success:', error);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as any;
      const stripeCustomerId = invoice.customer as string;

      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'past_due',
        })
        .eq('stripe_customer_id', stripeCustomerId);

      if (error) console.error('Error updating profile on payment failure:', error);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
