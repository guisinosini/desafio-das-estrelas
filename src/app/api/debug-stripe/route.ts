import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignorado
            }
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Informações do usuário logado localmente
    const profile = user ? await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle() : null;

    const debugInfo = {
      timestamp: new Date().toISOString(),
      mercadoPagoStatus: {
        publicKeyConfigured: !!process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY,
        accessTokenConfigured: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
      },
      userLogadoLocal: user ? {
        id: user.id,
        email: user.email,
        profile: profile?.data || 'Nenhum perfil encontrado no profiles'
      } : 'Nenhum usuário logado no Supabase local',
    };

    return NextResponse.json(debugInfo, { status: 200 });
  } catch (error: any) {
    console.error('Debug API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
