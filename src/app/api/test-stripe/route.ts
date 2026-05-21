import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subId = searchParams.get('subId') || 'sub_1TZgLIPc1qFQfvf56ueRXCHf'; // Usa o ID que você mandou por padrão

    const subscription = await stripe.subscriptions.retrieve(subId, {
      expand: ['latest_invoice', 'latest_invoice.payment_intent'],
    });

    return NextResponse.json({
      subscription_id: subscription.id,
      status: subscription.status,
      latest_invoice: subscription.latest_invoice,
      pending_setup_intent: subscription.pending_setup_intent,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
