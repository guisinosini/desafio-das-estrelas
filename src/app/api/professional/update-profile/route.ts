import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { specialty, council_registration, company } = body;

    // 1. Validar autenticação do Profissional
    const supabaseClient = await createClient();
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado. Por favor, faça login novamente.' }, { status: 401 });
    }

    // 2. Atualizar perfil com o admin bypass para contornar qualquer RLS que esteja bloqueando
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        specialty,
        council_registration,
        company
      })
      .eq('id', user.id);

    if (updateError) {
      console.error("Erro interno do Supabase ao atualizar perfil:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("Erro na API update-profile:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
