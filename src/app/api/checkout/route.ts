import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PreApproval } from 'mercadopago';
import { mpClient } from '@/lib/mercadopago';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ requireAuth: true });
    }

    let { language, interval, planType } = await req.json();

    const origin = req.headers.get('origin') || 'http://localhost:3000';

    // Para o Mercado Pago no Brasil, cobraremos em BRL.
    // Você pode adaptar esta lógica se for usar contas do MP em outros países.
    const prices = {
      monthly: 19.90, // BRL
      yearly: 199.00 // BRL
    };

    const amount = interval === 'yearly' ? prices.yearly : prices.monthly;
    const title = interval === 'yearly' ? 'Desafio das Estrelas - Plano Comandante (Anual)' : 'Desafio das Estrelas - Plano Cadete (Mensal)';

    const preApproval = new PreApproval(mpClient);
    
    const response = await preApproval.create({
      body: {
        reason: title,
        auto_recurring: {
          frequency: interval === 'yearly' ? 12 : 1,
          frequency_type: 'months',
          transaction_amount: amount,
          currency_id: 'BRL',
        },
        back_url: `${origin}/?stage=register&mp_success=true`,
        payer_email: user.email,
        external_reference: user.id,
        status: 'pending',
      }
    });

    const checkoutUrl = response.init_point;

    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
