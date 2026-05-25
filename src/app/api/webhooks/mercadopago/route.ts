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
    let id = url.searchParams.get('data.id') || url.searchParams.get('id');
    let type = url.searchParams.get('type') || url.searchParams.get('topic');

    // Tentar ler o corpo da requisição (Mercado Pago envia os webhooks mais recentes como JSON)
    let bodyData: any = null;
    try {
      bodyData = await req.json();
    } catch (e) {
      // Ignora erro se o corpo não for JSON
    }

    // Se não encontrou na URL, pega do Body
    if (!id && bodyData) {
      id = bodyData?.data?.id || bodyData?.id;
    }

    if (!type && bodyData) {
      type = bodyData?.type || bodyData?.topic;
      if (!type && bodyData?.action?.includes('payment.')) {
        type = 'payment';
      } else if (!type && bodyData?.action?.includes('preapproval.')) {
        type = 'subscription_preapproval';
      }
    }

    if (!id) return new NextResponse('OK', { status: 200 });

    if (type === 'subscription_preapproval') {
      const preApproval = new PreApproval(mpClient);
      const data = await preApproval.get({ id });

      const userId = data.external_reference;
      if (!userId || userId === 'anonymous') return new NextResponse('OK', { status: 200 });

      // Em processamento ou autorizado libera o acesso (active)
      if (['authorized', 'in_process'].includes(data.status || '')) {
        const reason = data.reason?.toLowerCase() || '';
        const priceId = reason.includes('comandante') || reason.includes('anual') ? 'yearly' : 'monthly';

        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
            subscription_price_id: priceId,
          })
          .eq('id', userId);

        if (error) console.error('Erro ao atualizar usuário via assinatura (active):', error);

      // Pendente, recusado, cancelado ou pausado revoga o acesso (inactive)
      } else if (['pending', 'paused', 'cancelled', 'rejected'].includes(data.status || '')) {
        const { error } = await supabase
          .from('profiles')
          .update({ subscription_status: 'inactive' })
          .eq('id', userId);

        if (error) console.error(`Erro ao atualizar usuário via assinatura (${data.status}):`, error);
      }

    } else if (type === 'payment') {
      const payment = new Payment(mpClient);
      const paymentData = await payment.get({ id });

      // O Mercado Pago às vezes omite o external_reference em pagamentos decorrentes de PreApproval
      // Buscamos no metadata como fallback se existir
      const userId = paymentData.external_reference || paymentData.metadata?.external_reference;
      
      if (!userId || userId === 'anonymous') {
         console.warn(`[MP Webhook] Pagamento ${id} sem external_reference. Ignorando atualização de status.`);
         return new NextResponse('OK', { status: 200 });
      }

      // Em processamento ou aprovado libera o acesso (active)
      if (['approved', 'in_process', 'authorized'].includes(paymentData.status || '')) {
        const description = paymentData.description?.toLowerCase() || '';
        const priceId = description.includes('comandante') || description.includes('anual') ? 'yearly' : 'monthly';
        
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'active',
            subscription_price_id: priceId,
          })
          .eq('id', userId);

        if (error) console.error('Erro ao atualizar usuário via pagamento (active):', error);

      // Pendente, rejeitado, estornado, chargeback ou cancelado revoga o acesso (inactive)
      } else if (['pending', 'rejected', 'refunded', 'charged_back', 'cancelled', 'in_mediation'].includes(paymentData.status || '')) {
        const { error } = await supabase
          .from('profiles')
          .update({ subscription_status: 'inactive' })
          .eq('id', userId);

        if (error) console.error(`Erro ao atualizar usuário via pagamento (${paymentData.status}):`, error);
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Erro no Webhook do Mercado Pago:', error);
    // Retorna 200 para que o MP pare de reenviar as notificações repetidamente e estressar o servidor
    return new NextResponse('Webhook Handler Error', { status: 200 });
  }
}
