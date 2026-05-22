import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    const { userId, accessCode } = await req.json();

    if (!userId || !accessCode) {
      return NextResponse.json({ error: 'Missing userId or accessCode' }, { status: 400 });
    }

    const { data: invite, error: inviteError } = await supabaseAdmin
      .from('professional_invites')
      .select('id, professional_id, status')
      .eq('access_code', accessCode)
      .single();

    if (inviteError || !invite || invite.status !== 'pending') {
      return NextResponse.json({ error: 'Convite inválido ou já utilizado.' }, { status: 400 });
    }

    // Vincula o usuário ao profissional e ativa a assinatura
    const { error: profileError } = await supabaseAdmin.from('profiles').update({
      linked_professional_id: invite.professional_id,
      subscription_status: 'active'
    }).eq('id', userId);

    if (profileError) throw profileError;

    // Marca o convite como usado
    await supabaseAdmin.from('professional_invites').update({
      status: 'used',
      used_at: new Date().toISOString()
    }).eq('id', invite.id);

    // Incrementa used_invites do profissional
    const { data: subData } = await supabaseAdmin
      .from('professional_subscriptions')
      .select('id, used_invites')
      .eq('professional_id', invite.professional_id)
      .order('created_at', { ascending: false })
      .limit(1);

    const sub = subData?.[0];
    if (sub) {
      await supabaseAdmin.from('professional_subscriptions').update({
        used_invites: (sub.used_invites || 0) + 1
      }).eq('id', sub.id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erro ao validar convite:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
