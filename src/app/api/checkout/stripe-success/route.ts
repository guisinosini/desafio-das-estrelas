import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';

// Supabase Admin para atualizar perfil com service role (ignora RLS)
const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ requireAuth: true }, { status: 401 });
    }

    const { paymentIntentId, selectedPlan } = await req.json();

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'ID da transação não fornecido.' }, { status: 400 });
    }

    // Consulta a transação diretamente nos servidores da Stripe por segurança
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'O pagamento ainda não foi concluído com sucesso.' }, { status: 400 });
    }

    // Valida que o pagamento pertence ao usuário atual para evitar fraude
    if (paymentIntent.metadata.userId !== user.id) {
      return NextResponse.json({ error: 'Assinatura inválida para este usuário.' }, { status: 403 });
    }

    const planType = selectedPlan === 'yearly' ? 'commander' : 'cadet';
    const priceId = selectedPlan === 'yearly' ? 'yearly' : 'monthly';

    // Atualiza o banco de dados via RLS bypass (apenas colunas que existem no schema)
    await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_price_id: priceId,
      })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      status: paymentIntent.status,
    });

  } catch (error: any) {
    console.error('Stripe Success Verification Error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao validar o pagamento.' }, { status: 500 });
  }
}
