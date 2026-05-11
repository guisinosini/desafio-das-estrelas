const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const env = fs.readFileSync('.env.local', 'utf8')
const envMap = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => l.trim().split('=')))

const supabase = createClient(envMap.NEXT_PUBLIC_SUPABASE_URL, envMap.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function check() {
  const { data, error } = await supabase.from('patient_insights').select('*').limit(1)
  console.log('Error (if RLS blocked):', error)
  console.log('Sample data:', data)
  
  const { data: q } = await supabase.from('patients').select('email').limit(1)
  console.log('Patient check:', q)
}

check()
