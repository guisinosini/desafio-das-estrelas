import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ status: 'inactive' });
    }

    // Buscamos diretamente do banco de dados, o que é extremamente rápido e otimizado.
    // O Webhook do Mercado Pago atualiza essa tabela em tempo real.
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_price_id')
      .eq('id', user.id)
      .maybeSingle();

    return NextResponse.json({
      status: profile?.subscription_status || 'inactive',
      priceId: profile?.subscription_price_id || null,
    });
  } catch (error) {
    console.error('Erro na sincronização de assinatura:', error);
    return NextResponse.json({ status: 'inactive' }, { status: 500 });
  }
}
