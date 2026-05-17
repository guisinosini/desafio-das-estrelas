import { stripe } from '@/lib/stripe';
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

    // 1. Lista os 5 clientes mais recentes do Stripe
    const customers = await stripe.customers.list({ limit: 5 });
    
    // 2. Lista as 5 assinaturas mais recentes do Stripe
    const subscriptions = await stripe.subscriptions.list({ limit: 5, status: 'all' });

    // 3. Informações do usuário logado localmente
    const profile = user ? await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle() : null;

    const debugInfo = {
      timestamp: new Date().toISOString(),
      userLogadoLocal: user ? {
        id: user.id,
        email: user.email,
        profile: profile?.data || 'Nenhum perfil encontrado no profiles'
      } : 'Nenhum usuário logado no Supabase local',
      recentStripeCustomers: customers.data.map(c => ({
        id: c.id,
        email: c.email,
        name: c.name,
        created: new Date(c.created * 1000).toISOString()
      })),
      recentStripeSubscriptions: subscriptions.data.map(s => ({
        id: s.id,
        customerId: s.customer,
        status: s.status,
        priceId: s.items.data[0]?.price.id,
        planInterval: s.items.data[0]?.price.recurring?.interval,
        created: new Date(s.created * 1000).toISOString()
      }))
    };

    return NextResponse.json(debugInfo, { status: 200 });
  } catch (error: any) {
    console.error('Debug API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
