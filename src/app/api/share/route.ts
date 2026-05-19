import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const reportData = await request.json();
    const shareId = crypto.randomUUID();

    const { error } = await supabase
      .from('shared_reports')
      .insert([
        {
          id: shareId,
          profile_id: userData.user.id,
          data: reportData,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
        }
      ]);

    if (error) throw error;

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.desafioestrelas.com';
    return NextResponse.json({ url: `${origin}/report/${shareId}` });
  } catch (error: any) {
    console.error('Erro ao compartilhar relatório:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
