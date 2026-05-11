import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getUserRole } from '@/lib/supabase/roles'

/**
 * Rota de redirecionamento pós-login.
 * Lê a sessão no servidor (via cookies), busca o role do perfil
 * e redireciona para o painel correto. Elimina o race condition
 * de buscar o perfil no cliente logo após o signInWithPassword.
 */
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.redirect(new URL('/login', baseUrl))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = getUserRole(user, profile)

    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin', baseUrl))
    } else if (role === 'professional') {
      return NextResponse.redirect(new URL('/professional', baseUrl))
    } else {
      return NextResponse.redirect(new URL('/patient', baseUrl))
    }
  } catch (err) {
    console.error('[Dashboard Route] Erro:', err)
    return NextResponse.redirect(new URL('/login', baseUrl))
  }
}
