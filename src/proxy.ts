import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export default async function proxy(request: NextRequest) {
  // 1. Injeta o pathname atual como header para que Server Components detectem a rota
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  // 2. Atualiza a sessão do Supabase
  const response = await updateSession(request);

  // 3. Se for um redirect, retorna imediatamente
  if (response.status >= 300 && response.status < 400) {
    return response;
  }

  // 4. Cria a resposta final injetando os headers no REQUEST para que o Layout os veja
  const finalResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // 5. Copia os cookies da sessão atualizada para a resposta final
  response.cookies.getAll().forEach(cookie => {
    finalResponse.cookies.set(cookie.name, cookie.value, {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  });

  return finalResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
