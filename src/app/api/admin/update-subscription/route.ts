import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';
import { isAdminEmail } from '@/lib/supabase/roles';

// Instância do Supabase Admin (Service Role) para ignorar o RLS
const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Verificação estrita de segurança: O usuário logado DEVE ser um administrador
    if (!user || !user.email || !isAdminEmail(user.email)) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem realizar esta ação.' },
        { status: 403 }
      );
    }

    const { profileId, newStatus, newPriceId, nowStr, expStr } = await req.json();

    if (!profileId || !newStatus) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos. profileId e newStatus são obrigatórios.' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: newStatus,
        subscription_price_id: newPriceId,
        subscription_start: nowStr,
        subscription_end: expStr
      })
      .eq('id', profileId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, message: 'Assinatura atualizada com sucesso.' });
  } catch (err: any) {
    console.error('Erro ao atualizar assinatura via Admin API:', err);
    return NextResponse.json(
      { error: 'Erro interno ao atualizar assinatura.', details: err.message },
      { status: 500 }
    );
  }
}
