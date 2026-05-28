const fs = require('fs');
const https = require('https');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');

function getEnv(key) {
  try {
    const envFile = fs.readFileSync(envPath, 'utf8');
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

const postData = JSON.stringify({
  reason: 'Desafio das Estrelas - Plano Cadete (Mensal)',
  auto_recurring: {
    frequency: 1,
    frequency_type: 'months',
    transaction_amount: 19.90,
    currency_id: 'BRL'
  },
  back_url: 'https://desafio-das-estrelas.vercel.app'
});

const options = {
  hostname: 'api.mercadopago.com',
  path: '/preapproval_plan',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('⏳ Criando novo plano no Mercado Pago...');

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 201) {
      const responseBody = JSON.parse(data);
      const planId = responseBody.id;
      console.log(`✅ Plano criado com sucesso no Mercado Pago! ID: ${planId}`);
      
      // Adicionar a variável ao .env.local
      let envContent = fs.readFileSync(envPath, 'utf8');
      if (envContent.includes('MERCADOPAGO_PLAN_ID=')) {
          envContent = envContent.replace(/MERCADOPAGO_PLAN_ID=.*/g, `MERCADOPAGO_PLAN_ID=${planId}`);
      } else {
          // Garante que tenha uma quebra de linha antes se não houver
          const prefix = envContent.endsWith('\n') ? '' : '\n';
          envContent += `${prefix}# ID do Plano de Assinatura Mensal\nMERCADOPAGO_PLAN_ID=${planId}\n`;
      }
      
      fs.writeFileSync(envPath, envContent, 'utf8');
      console.log('✅ Chave MERCADOPAGO_PLAN_ID salva automaticamente no .env.local!');
      console.log('🚀 Tudo pronto! Agora você já pode testar o checkout novamente.');
    } else {
      console.error(`❌ ERRO ao criar plano. Status: ${res.statusCode}`);
      console.error('Detalhes:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ ERRO de rede:', error);
});

req.write(postData);
req.end();
