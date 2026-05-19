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

      let subscriptionPriceId = null;
      let subscriptionStart = null;
      let subscriptionEnd = null;

      if (subscriptionId) {
        try {
          const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as any;
          subscriptionPriceId = subscription.items.data[0].price.id;
          subscriptionStart = new Date(subscription.current_period_start * 1000).toISOString();
          subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        } catch (e) {
          console.error('Error retrieving subscription items on webhook completion:', e);
        }
      }

      if (customerEmail || stripeCustomerId) {
        const updatePayload = {
          stripe_customer_id: stripeCustomerId,
          subscription_id: subscriptionId,
          subscription_status: 'active',
          subscription_price_id: subscriptionPriceId,
          subscription_start: subscriptionStart,
          subscription_end: subscriptionEnd,
        };

        let updated = false;

        // Tentativa 1: Buscar por e-mail (campo pode ser null em usuários antigos)
        if (customerEmail) {
          const { data: byEmail, error: emailError } = await supabase
            .from('profiles')
            .update(updatePayload)
            .eq('email', customerEmail)
            .select('id');

          if (!emailError && byEmail && byEmail.length > 0) {
            updated = true;
          } else if (emailError) {
            console.error('Webhook: Erro ao atualizar perfil por email:', emailError);
          }
        }

        // Fallback: Buscar por stripe_customer_id caso email não tenha encontrado registro
        if (!updated && stripeCustomerId) {
          const { error: customerError } = await supabase
            .from('profiles')
            .update(updatePayload)
            .eq('stripe_customer_id', stripeCustomerId);

          if (customerError) {
            console.error('Webhook: Erro ao atualizar perfil por stripe_customer_id:', customerError);
          }
        }
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
      const subscriptionId = invoice.subscription as string;

      let subscriptionStart = null;
      let subscriptionEnd = null;

      if (subscriptionId) {
        try {
          const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as any;
          subscriptionStart = new Date(subscription.current_period_start * 1000).toISOString();
          subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        } catch (e) {
          console.error('Error retrieving subscription on invoice payment success:', e);
        }
      }

      const updatePayload: any = {
        subscription_status: 'active',
      };
      if (subscriptionStart) updatePayload.subscription_start = subscriptionStart;
      if (subscriptionEnd) updatePayload.subscription_end = subscriptionEnd;

      const { error } = await supabase
        .from('profiles')
        .update(updatePayload)
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
