const fs = require('fs');
const https = require('https');
const path = require('path');

// Função simples para ler o .env.local sem precisar do pacote dotenv
function getEnv(key) {
  try {
    const envFile = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
    const lines = envFile.split('\n');
    for (const line of lines) {
      if (line.startsWith(`${key}=`)) {
        return line.split('=')[1].trim();
      }
    }
  } catch (err) {
    console.error('Erro ao ler .env.local', err);
  }
  return null;
}

const token = getEnv('MERCADOPAGO_ACCESS_TOKEN');

if (!token) {
  console.error('MERCADOPAGO_ACCESS_TOKEN não encontrado no .env.local');
  process.exit(1);
}

const options = {
  hostname: 'api.mercadopago.com',
  path: '/v1/payment_methods',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ SUCESSO: A chave do Mercado Pago é VÁLIDA e está se comunicando com a API.');
    } else {
      console.error(`❌ ERRO: A chave do Mercado Pago falhou. Status code: ${res.statusCode}`);
      console.error('Detalhes do erro:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ ERRO de rede ao tentar conectar com a API do Mercado Pago:', error);
});

req.end();
