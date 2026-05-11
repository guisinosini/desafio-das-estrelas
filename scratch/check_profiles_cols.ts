import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .limit(1);
    
  if (error) console.error(error);
  else console.log("Colunas de Profiles:", Object.keys(data[0] || {}));
}

checkProfiles();
