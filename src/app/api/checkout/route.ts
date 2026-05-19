import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Preference } from 'mercadopago';
import { mpClient } from '@/lib/mercadopago';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

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

    const preference = new Preference(mpClient);
    
    const response = await preference.create({
      body: {
        items: [
          {
            id: interval,
            title: title,
            quantity: 1,
            unit_price: amount,
            currency_id: 'BRL',
          }
        ],
        payer: {
          email: user?.email || undefined,
        },
        back_urls: {
          success: `${origin}/?stage=register&mp_success=true`,
          failure: `${origin}/#pricing`,
          pending: `${origin}/#pricing`,
        },
        auto_return: 'approved',
        // Passamos o user ID ou o email para podermos identificar no webhook
        external_reference: user?.id || 'anonymous',
        // notification_url: 'https://www.desafioestrelas.com/api/webhooks/mercadopago' // <- IMPORTANTE EM PRODUÇÃO
      }
    });

    // init_point é a URL do checkout padrão, sandbox_init_point é para testes
    const checkoutUrl = process.env.NODE_ENV === 'development' ? response.sandbox_init_point : response.init_point;

    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error('Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
