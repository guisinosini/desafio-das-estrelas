import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { Payment } from 'mercadopago';
import { mpClient } from '@/lib/mercadopago';

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
      return NextResponse.json({ requireAuth: true });
    }

    const {
      interval,
      cardTokenId,
      paymentMethodId,
      issuerId,
      installments,
      identificationType,
      identificationNumber,
    } = await req.json();

    const prices = { monthly: 19.90, yearly: 199.00 };
    const amount = interval === 'yearly' ? prices.yearly : prices.monthly;
    const title = interval === 'yearly'
      ? 'Desafio das Estrelas - Plano Comandante (Anual)'
      : 'Desafio das Estrelas - Plano Cadete (Mensal)';
    const planType = interval === 'yearly' ? 'commander' : 'cadet';

    // Ambos os planos usam Payment.create() — compatível com sandbox e produção.
    // O PreApproval (assinatura) foi removido pois o token gerado pelo CardPayment Brick
    // é incompatível com PreApproval.create() no ambiente sandbox (retorna "Card token service not found").
    const payment = new Payment(mpClient);

    const response = await payment.create({
      body: {
        transaction_amount: amount,
        token: cardTokenId,
        description: title,
        // Mensal: força 1 parcela; Anual: até 12x conforme seleção do usuário
        installments: interval === 'yearly' ? Number(installments || 1) : 1,
        payment_method_id: paymentMethodId,
        issuer_id: issuerId,
        payer: {
          email: user.email!,
          ...(identificationType && identificationNumber && {
            identification: {
              type: identificationType,
              number: identificationNumber,
            },
          }),
        },
        external_reference: user.id,
      }
    });

    console.log(`[MP Checkout ${interval}] Status: ${response.status} | ID: ${response.id}`);

    const statusOk = ['approved', 'in_process', 'pending'].includes(response.status || '');

    if (statusOk) {
      // Atualiza o Supabase e verifica se a linha foi de fato encontrada e modificada
      const { data: updatedRows, error: dbError } = await supabaseAdmin
        .from('profiles')
        .update({
          is_premium: true,
          plan_type: planType,
          subscription_status: 'active',
          subscription_price_id: interval,
        })
        .eq('id', user.id)
        .select('id');

      if (dbError) {
        console.error(`[MP Checkout] Erro no Supabase:`, dbError);
        return NextResponse.json({
          error: `Pagamento aprovado mas falha ao ativar conta: ${dbError.message}`,
          status: response.status,
        }, { status: 500 });
      }

      if (!updatedRows || updatedRows.length === 0) {
        // Fallback: perfil não existe ainda, cria via upsert
        console.warn(`[MP Checkout] Nenhuma linha atualizada para user.id=${user.id} — tentando upsert`);
        await supabaseAdmin.from('profiles').upsert({
          id: user.id,
          email: user.email,
          is_premium: true,
          plan_type: planType,
          subscription_status: 'active',
          subscription_price_id: interval,
        });
      }

      console.log(`[MP Checkout] Perfil ${user.id} ativado como ${planType} ✅`);
    }

    return NextResponse.json({
      success: statusOk,
      status: response.status,
      id: response.id,
    });

  } catch (error: any) {
    console.error('Checkout Transparente Error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao processar pagamento.' }, { status: 500 });
  }
}
