import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { Payment, PreApproval } from 'mercadopago';
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
      isSubscription
    } = await req.json();

    if (interval === 'monthly' && cardTokenId) {
      const preApproval = new PreApproval(mpClient);
      try {
        console.log(`[PreApproval] Tentando criar assinatura com Token: ${cardTokenId}, Plano: fc9189bc5b5e4389a37dd24e5cb99991`);
        const preApprovalData = await preApproval.create({
          body: {
            preapproval_plan_id: 'fc9189bc5b5e4389a37dd24e5cb99991',
            payer_email: user.email!,
            card_token_id: cardTokenId,
            external_reference: user.id,
            status: 'authorized'
          },
          requestOptions: { idempotencyKey: crypto.randomUUID() }
        });
        
        console.log(`[PreApproval] Resposta do MP:`, preApprovalData.id, preApprovalData.status);

        const statusOk = ['authorized', 'pending'].includes(preApprovalData.status || '');
        
        if (statusOk) {
          await supabaseAdmin.from('profiles').upsert({
            id: user.id,
            subscription_status: 'active',
            subscription_price_id: interval,
          });
        }

        return NextResponse.json({
          success: statusOk,
          status: preApprovalData.status,
          id: preApprovalData.id,
        });
      } catch (mpError: any) {
        console.error(`[PreApproval] Falha na criação da assinatura no MP:`, mpError);
        return NextResponse.json({ error: mpError.message || 'Erro interno Mercado Pago' }, { status: 500 });
      }
    }

    // Se for mensal via PIX ou Anual (Cartão/PIX), cai para pagamento único (Payment API)

    const prices = { monthly: 19.90, yearly: 199.00 };
    const amount = interval === 'yearly' ? prices.yearly : prices.monthly;
    const title = interval === 'yearly'
      ? 'Desafio das Estrelas - Plano Comandante (Anual)'
      : 'Desafio das Estrelas - Plano Cadete (Mensal)';

    const payment = new Payment(mpClient);

    const paymentBody: any = {
      transaction_amount: amount,
      token: cardTokenId,
      description: title,
      // Mensal: sempre 1 parcela; Anual: usa a seleção do usuário
      installments: interval === 'yearly' ? Number(installments || 1) : 1,
      payment_method_id: paymentMethodId,
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
    };

    // Só inclui issuer_id se for um valor válido (MP rejeita null/undefined/vazio)
    if (issuerId && String(issuerId).trim() !== '') {
      paymentBody.issuer_id = Number(issuerId);
    }

    const response = await payment.create({ 
      body: paymentBody,
      requestOptions: { idempotencyKey: crypto.randomUUID() }
    });

    console.log(`[MP Checkout ${interval}] Status: ${response.status} | ID: ${response.id}`);

    // Apenas ativa se o status for aprovado imediatamente (Cartão de Crédito)
    // Se for PIX ou Boleto, ficará pendente e o Webhook fará a ativação.
    const statusOk = ['approved'].includes(response.status || '');

    if (statusOk) {
      // IMPORTANTE: Atualiza apenas as colunas que EXISTEM no schema do Supabase.
      // As colunas 'is_premium' e 'plan_type' foram removidas pois não existem na tabela profiles.
      const { data: updatedRows, error: dbError } = await supabaseAdmin
        .from('profiles')
        .update({
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
        console.warn(`[MP Checkout] Nenhuma linha atualizada para user.id=${user.id} — upsert`);
        await supabaseAdmin.from('profiles').upsert({
          id: user.id,
          subscription_status: 'active',
          subscription_price_id: interval,
        });
      }

      console.log(`[MP Checkout] Perfil ${user.id} ativado (${interval}) ✅`);
    }

    return NextResponse.json({
      success: response.status !== 'rejected' && response.status !== 'cancelled',
      status: response.status,
      id: response.id,
      paymentMethodId,
      // Se for PIX, enviamos os dados do QR Code para o frontend renderizar
      qrCode: response.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64: response.point_of_interaction?.transaction_data?.qr_code_base64,
    });

  } catch (error: any) {
    console.error('Checkout Transparente Error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao processar pagamento.' }, { status: 500 });
  }
}
