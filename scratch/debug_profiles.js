const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function debug() {
  try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const envMap = {};
    env.split(/\r?\n/).forEach(line => {
      const idx = line.indexOf('=');
      if (idx > 0) {
        const key = line.substring(0, idx).trim();
        const value = line.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
        envMap[key] = value;
      }
    });

    const supabase = createClient(envMap.NEXT_PUBLIC_SUPABASE_URL, envMap.SUPABASE_SERVICE_ROLE_KEY || envMap.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    console.log("🔍 Consultando a tabela 'profiles' para obter a estrutura de colunas...");
    
    // Consulta um registro qualquer para inspecionar os campos retornados
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    
    if (error) {
      console.error("❌ Erro ao consultar a tabela profiles:", error);
    } else if (data && data.length > 0) {
      console.log("✅ Registro encontrado com sucesso! Estrutura de chaves:", Object.keys(data[0]));
      console.log("📄 Registro de Exemplo:", data[0]);
    } else {
      console.log("⚠️ Nenhum registro encontrado na tabela profiles. Tentando buscar colunas via listagem...");
      // Se não houver registros, listamos tabelas ou colunas
      const { data: listData, error: listError } = await supabase.rpc('get_table_columns', { table_name: 'profiles' });
      console.log("RPC get_table_columns result:", listData, listError);
    }
  } catch (err) {
    console.error("💥 Erro geral no script de depuração:", err);
  }
}

debug();
