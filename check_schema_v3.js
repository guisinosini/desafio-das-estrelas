const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const env = fs.readFileSync('.env.local', 'utf8')
const envMap = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => l.trim().split('=')))

const supabase = createClient(envMap.NEXT_PUBLIC_SUPABASE_URL, envMap.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function check() {
  const { data: cols, error } = await supabase.rpc('get_table_columns', { table_name: 'appointments' })
  if (error) {
     // Fallback if RPC doesn't exist
     const { data } = await supabase.from('appointments').select('*').limit(1)
     if (data) console.log('Appointment columns (sample):', Object.keys(data[0] || {}))
  } else {
     console.log('Columns:', cols)
  }
}

async function listAllTasks() {
    const { data } = await supabase.from('patient_tasks').select('title, created_at').order('created_at', { ascending: false }).limit(5)
    console.log('Recent Tasks:', data)
}

check().then(() => listAllTasks())
