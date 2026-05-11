import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event;

  try {
    // Para testar localmente, o STRIPE_WEBHOOK_SECRET é gerado pelo "stripe listen"
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  // 1. Pagamento concluído com sucesso
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as any;
    const { appointmentId, orderId, type } = paymentIntent.metadata;

    console.log(`✅ Pagamento confirmado (${paymentIntent.id}) para:`, { appointmentId, orderId, type });

    try {
      // Caso seja uma compra na LOJA (seu novo fluxo)
      if (type === 'store_purchase' || orderId) {
        const targetId = orderId || appointmentId;
        const { error } = await supabaseAdmin
          .from('orders')
          .update({ status: 'pago' })
          .eq('id', targetId);

        if (error) throw error;
        console.log(`📦 Pedido ${targetId} atualizado para 'pago'.`);
      } 
      // Caso seja um AGENDAMENTO direto
      else if (appointmentId) {
        const { error } = await supabaseAdmin
          .from('appointments')
          .update({ status: 'confirmed' })
          .eq('id', appointmentId);

        if (error) throw error;
        console.log(`📅 Agendamento ${appointmentId} atualizado para 'confirmed'.`);

        // Disparar e-mail de notificação (sem bloquear o webhook)
        fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://kamaleon-clinic-hub.vercel.app'}/api/notifications/appointment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "scheduled", appointmentId })
        }).catch(err => console.error("❌ Erro ao disparar notificação de agendamento:", err));
      }
    } catch (err: any) {
      console.error('❌ Erro ao atualizar banco após pagamento:', err.message);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
