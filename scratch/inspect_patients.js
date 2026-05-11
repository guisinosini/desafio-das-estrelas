const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkColumns() {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Erro:', error);
    return;
  }

  console.log('Colunas detectadas na tabela patients:', Object.keys(data[0] || {}));
}

checkColumns();
