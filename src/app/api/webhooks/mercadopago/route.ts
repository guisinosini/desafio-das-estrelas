import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Payment } from 'mercadopago';
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
    const type = url.searchParams.get('type');

    if (type === 'payment' && id) {
      const payment = new Payment(mpClient);
      const paymentData = await payment.get({ id });

      if (paymentData.status === 'approved') {
        const userId = paymentData.external_reference;
        const intervalId = paymentData.additional_info?.items?.[0]?.id; // 'monthly' ou 'yearly'

        if (userId && userId !== 'anonymous') {
          // Atualizar o plano do usuário no Supabase
          const { error } = await supabase
            .from('profiles')
            .update({
              is_premium: true,
              plan_type: intervalId === 'yearly' ? 'commander' : 'cadet',
              // idealmente você salvaria a data de validade também
            })
            .eq('id', userId);

          if (error) {
            console.error('Erro ao atualizar usuário no banco:', error);
            // Retorna 200 pro MP não tentar reenviar
            return new NextResponse('Database Error', { status: 200 });
          }
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
