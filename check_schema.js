const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const env = fs.readFileSync('.env.local', 'utf8')
const envMap = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => l.trim().split('=')))

const supabase = createClient(envMap.NEXT_PUBLIC_SUPABASE_URL, envMap.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function check() {
  const { data: appts } = await supabase.from('appointments').select('*').limit(1)
  if (appts && appts[0]) {
    console.log('Appointment columns:', Object.keys(appts[0]))
  }
}

check()
