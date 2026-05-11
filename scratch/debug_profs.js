
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function debug() {
  const { data: profs } = await supabase.from('professionals').select('*').limit(5);
  console.log('Professionals:', profs);
  
  const { data: profiles } = await supabase.from('profiles').select('*').eq('role', 'professional').limit(5);
  console.log('Professional Profiles:', profiles);
}

debug();
