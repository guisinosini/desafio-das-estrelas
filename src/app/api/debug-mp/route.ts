import { NextResponse } from 'next/server';
import { PreApproval } from 'mercadopago';
import { mpClient } from '@/lib/mercadopago';

async function testarPermissaoPreApproval(): Promise<{ status: number; body: any }> {
  return new Promise((resolve) => {
    const { default: https } = require('https');
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN || '';

    // Faz um GET na lista de preapprovals — se der 401/403, a conta não tem permissão
    const options = {
      hostname: 'api.mercadopago.com',
      path: '/preapproval/search?status=authorized&limit=1',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    };

    const req = https.request(options, (res: any) => {
      let data = '';
      res.on('data', (c: any) => (data += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', (e: any) => resolve({ status: 0, body: e.message }));
    req.end();
  });
}

async function buscarInfoConta(): Promise<any> {
  return new Promise((resolve) => {
    const { default: https } = require('https');
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN || '';

    const options = {
      hostname: 'api.mercadopago.com',
      path: '/users/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    };

    const req = https.request(options, (res: any) => {
      let data = '';
      res.on('data', (c: any) => (data += c));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({}); }
      });
    });
    req.on('error', () => resolve({}));
    req.end();
  });
}

function mascarar(chave: string | undefined, visivel = 12) {
  if (!chave) return '❌ NÃO CONFIGURADA';
  return chave.substring(0, visivel) + '...' + chave.substring(chave.length - 6);
}

export async function GET() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
  const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || '';

  const [preApprovalTest, contaInfo] = await Promise.all([
    testarPermissaoPreApproval(),
    buscarInfoConta(),
  ]);

  const preApprovalOk = preApprovalTest.status === 200;
  const preApprovalErro = preApprovalOk ? null : preApprovalTest.body;

  return NextResponse.json({
    chaves: {
      PUBLIC_KEY: mascarar(publicKey),
      ACCESS_TOKEN: mascarar(accessToken),
    },
    conta: {
      id: contaInfo.id,
      email: contaInfo.email,
      site_id: contaInfo.site_id,
      status_conta: contaInfo.status,
      tipo: contaInfo.account_type,
    },
    preapproval: {
      permissao_ok: preApprovalOk ? '✅ SIM — conta pode criar assinaturas' : '❌ NÃO — conta sem permissão para assinaturas',
      status_http: preApprovalTest.status,
      erro_completo_mp: preApprovalErro,
    },
  });
}
