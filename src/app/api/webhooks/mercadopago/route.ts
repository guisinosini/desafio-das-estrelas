import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Payment, PreApproval } from 'mercadopago';
import { mpClient } from '@/lib/mercadopago';

// Instância do Supabase Service Role para ignorar RLS e poder atualizar a tabela
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('data.id') || url.searchParams.get('id');
    // 'topic' pode vir no body em algumas versões, mas via query params é 'type' ou 'topic'
    const type = url.searchParams.get('type') || url.searchParams.get('topic');

    if (!id) return new NextResponse('OK', { status: 200 });

    if (type === 'subscription_preapproval') {
      const preApproval = new PreApproval(mpClient);
      const data = await preApproval.get({ id });

      if (data.status === 'authorized') {
        const userId = data.external_reference;
        const reason = data.reason?.toLowerCase() || '';
        const planType = reason.includes('comandante') || reason.includes('anual') ? 'commander' : 'cadet';
        const priceId = reason.includes('comandante') || reason.includes('anual') ? 'yearly' : 'monthly';

        if (userId && userId !== 'anonymous') {
          const { error } = await supabase
            .from('profiles')
            .update({
              is_premium: true,
              plan_type: planType,
              subscription_status: 'active',
              subscription_price_id: priceId,
            })
            .eq('id', userId);

          if (error) console.error('Erro ao atualizar usuário via assinatura:', error);
        }
      }
    } else if (type === 'payment') {
      const payment = new Payment(mpClient);
      const paymentData = await payment.get({ id });

      if (paymentData.status === 'approved') {
        const userId = paymentData.external_reference;
        const description = paymentData.description?.toLowerCase() || '';
        const planType = description.includes('comandante') || description.includes('anual') ? 'commander' : 'cadet';
        const priceId = description.includes('comandante') || description.includes('anual') ? 'yearly' : 'monthly';
        
        if (userId && userId !== 'anonymous') {
          const { error } = await supabase
            .from('profiles')
            .update({
              is_premium: true,
              plan_type: planType,
              subscription_status: 'active',
              subscription_price_id: priceId,
            })
            .eq('id', userId);

          if (error) console.error('Erro ao atualizar usuário via pagamento:', error);
        }
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Erro no Webhook do Mercado Pago:', error);
    // Em caso de falha silenciosa para o MP não estressar os servidores
    return new NextResponse('Webhook Handler Error', { status: 200 });
  }
}
