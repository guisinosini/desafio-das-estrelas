
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://kyhfxvkqtzrthenizlyh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aGZ4dmtxdHpydGhlbml6bHloIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzg2OTEzMiwiZXhwIjoyMDg5NDQ1MTMyfQ.ZAwxCVpce3vcnHwMYv4am7RAN7xlLY2UgY5qVOFDJKc";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log("--- Iniciando Diagnóstico de Dados ---");
  
  // 1. Buscar o usuário pelo email para pegar o ID
  const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) {
    console.error("Erro ao listar usuários:", userError);
    return;
  }

  const targetUser = userData.users.find(u => u.email === 'deiasinosini@gmail.com');
  
  if (!targetUser) {
    console.log("Usuário deiasinosini@gmail.com não encontrado no Auth.");
    return;
  }

  console.log("ID do Usuário encontrado:", targetUser.id);

  // 2. Buscar registros na tabela de gamificação
  const { data: gamifData, error: gamifError } = await supabase
    .from('patient_gamification')
    .select('*')
    .eq('profile_id', targetUser.id);

  if (gamifError) {
    console.error("Erro ao buscar dados de gamificação:", gamifError);
    return;
  }

  if (gamifData && gamifData.length > 0) {
    console.log("REGISTRO ENCONTRADO!");
    console.log("Quantidade de registros:", gamifData.length);
    gamifData.forEach((row, i) => {
      console.log(`\n--- Registro ${i+1} ---`);
      console.log("ID:", row.id);
      console.log("Fleet ID:", row.fleet_id);
      console.log("Crianças:", row.state?.children?.map(c => `${c.name} (${c.stars}⭐)`));
      console.log("Data de Atualização:", row.updated_at);
    });
  } else {
    console.log("Nenhum registro encontrado para este ID na tabela patient_gamification.");
    
    // 3. Verificação extra: existe algum dado com fleet_id?
    const { data: allData } = await supabase.from('patient_gamification').select('id, profile_id, fleet_id, updated_at').limit(10);
    console.log("\nÚltimos registros na tabela (geral):", allData);
  }
}

checkData();
