import { NextResponse } from 'next/server';
import https from 'https';

function mascarar(chave: string | undefined, visivel = 12) {
  if (!chave) return '❌ NÃO CONFIGURADA';
  return chave.substring(0, visivel) + '...' + chave.substring(chave.length - 6);
}

async function testarToken(token: string): Promise<{ ok: boolean; status: number; userId?: string }> {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.mercadopago.com',
      path: '/v1/payment_methods',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          // Tenta pegar o user ID da conta dono do token
          const userReq = https.request(
            { ...options, path: '/v1/users/me' },
            (r2) => {
              let d2 = '';
              r2.on('data', (c) => (d2 += c));
              r2.on('end', () => {
                try {
                  const parsed = JSON.parse(d2);
                  resolve({ ok: res.statusCode === 200, status: res.statusCode!, userId: parsed.id?.toString() });
                } catch {
                  resolve({ ok: res.statusCode === 200, status: res.statusCode! });
                }
              });
            }
          );
          userReq.on('error', () => resolve({ ok: res.statusCode === 200, status: res.statusCode! }));
          userReq.end();
        } catch {
          resolve({ ok: res.statusCode === 200, status: res.statusCode! });
        }
      });
    });
    req.on('error', () => resolve({ ok: false, status: 0 }));
    req.end();
  });
}

export async function GET() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
  const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || '';
  const planId = process.env.MERCADOPAGO_PLAN_ID || '';

  const tokenTest = accessToken ? await testarToken(accessToken) : { ok: false, status: 0 };

  return NextResponse.json({
    '1_NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY (frontend/build)': mascarar(publicKey),
    '2_MERCADOPAGO_ACCESS_TOKEN (backend)': mascarar(accessToken),
    '3_MERCADOPAGO_PLAN_ID': planId || '(não configurado — ok)',
    '4_TOKEN_VALIDO_NA_API': tokenTest.ok ? '✅ SIM' : `❌ NÃO (status ${tokenTest.status})`,
    '5_CONTA_ID_DO_ACCESS_TOKEN': tokenTest.userId || 'não encontrado',
    '6_INSTRUCAO': 'Confira se o início da PUBLIC_KEY e do ACCESS_TOKEN pertencem à mesma conta. APP_USR-XXXXXXXX deve ser o mesmo número.'
  });
}
