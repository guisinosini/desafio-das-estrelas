import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const patientId = url.searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json({ error: 'Missing patientId' }, { status: 400 });
    }

    // 1. Validar quem está pedindo (tem que estar autenticado)
    const supabaseClient = createClient(cookies());
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Checar se este paciente está realmente vinculado ao profissional
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('linked_professional_id')
      .eq('id', patientId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    if (profile.linked_professional_id !== user.id) {
      // Verifica se é admin (caso admin esteja acessando via dashboard)
      const { data: adminProfile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (adminProfile?.role !== 'admin') {
         return NextResponse.json({ error: 'Access denied. Patient not linked to you.' }, { status: 403 });
      }
    }

    // 3. Buscar os dados do gamification (usando Admin para ignorar RLS)
    const { data: gamification, error: gamificationError } = await supabaseAdmin
      .from('patient_gamification')
      .select('state')
      .eq('profile_id', patientId)
      .maybeSingle();

    if (gamificationError) {
      return NextResponse.json({ error: gamificationError.message }, { status: 500 });
    }

    return NextResponse.json({ data: gamification });

  } catch (err: any) {
    console.error("Erro no fetch de patient gamification:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
