import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json({ error: 'Token do Mercado Pago não configurado' }, { status: 500 });
    }

    // Buscamos as assinaturas ativas do usuário pelo e-mail
    const searchRes = await fetch(
      `https://api.mercadopago.com/preapproval/search?payer_email=${encodeURIComponent(user.email!)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!searchRes.ok) {
      const errText = await searchRes.text();
      console.error('Erro ao buscar assinatura no MP:', errText);
      throw new Error('Falha ao buscar assinatura ativa.');
    }

    const searchData = await searchRes.json();
    const activeSub = searchData.results?.find(
      (sub: any) => sub.status === 'authorized' || sub.status === 'pending'
    );

    if (!activeSub) {
      return NextResponse.json({ error: 'Nenhuma assinatura ativa encontrada no Mercado Pago.' }, { status: 404 });
    }

    // Cancelamos a assinatura no Mercado Pago
    const cancelRes = await fetch(
      `https://api.mercadopago.com/preapproval/${activeSub.id}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'cancelled',
        }),
      }
    );

    if (!cancelRes.ok) {
      const errText = await cancelRes.text();
      console.error('Erro ao cancelar assinatura no MP:', errText);
      throw new Error('Falha ao cancelar assinatura no Mercado Pago.');
    }

    // Atualizamos o banco de dados local imediatamente
    await supabaseAdmin
      .from('profiles')
      .update({
        is_premium: false,
        subscription_status: 'cancelled',
        plan_type: null,
        subscription_price_id: null,
      })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      message: 'Assinatura cancelada com sucesso no Mercado Pago e localmente.',
    });
  } catch (error: any) {
    console.error('Portal Error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao gerenciar assinatura.' }, { status: 500 });
  }
}
