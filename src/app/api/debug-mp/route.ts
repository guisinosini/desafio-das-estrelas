import { NextResponse } from 'next/server';
import https from 'https';

function httpGet(path: string, token: string): Promise<{ status: number; body: any }> {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.mercadopago.com',
      path,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode ?? 0, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode ?? 0, body: data }); }
      });
    });
    req.on('error', (e) => resolve({ status: 0, body: e.message }));
    req.end();
  });
}

export async function GET() {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
  const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || '';

  const mascarar = (v: string, n = 12) =>
    v ? v.substring(0, n) + '...' + v.substring(v.length - 6) : '❌ VAZIA';

  const [conta, preapprovals] = await Promise.all([
    httpGet('/users/me', token),
    httpGet('/preapproval/search?status=authorized&limit=1', token),
  ]);

  return NextResponse.json({
    chaves: {
      PUBLIC_KEY_build: mascarar(publicKey),
      ACCESS_TOKEN_backend: mascarar(token),
    },
    conta: {
      id: conta.body?.id,
      email: conta.body?.email,
      tipo: conta.body?.account_type,
      status: conta.body?.status,
      site_id: conta.body?.site_id,
      http_status: conta.status,
    },
    preapproval_permission: {
      http_status: preapprovals.status,
      ok: preapprovals.status === 200 ? '✅ Conta tem permissão para assinaturas' : '❌ Sem permissão',
      erro_mp: preapprovals.status !== 200 ? preapprovals.body : null,
    },
  });
}
