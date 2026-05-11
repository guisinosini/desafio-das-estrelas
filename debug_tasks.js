const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const env = fs.readFileSync('.env.local', 'utf8')
const envMap = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => l.trim().split('=')))

const supabase = createClient(envMap.NEXT_PUBLIC_SUPABASE_URL, envMap.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function debugGlobalTasks() {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  
  const { data: tasks, error } = await supabase
    .from('patient_tasks')
    .select('*, patient:patients(full_name)')
    .gte('created_at', yesterday)
    .ilike('title', 'Insights%')

  if (error) {
    console.error("Error fetching tasks:", error)
  } else {
    console.log(`Tasks found in last 24h:`, tasks.length)
    tasks.forEach(t => {
      console.log(`- Patient: ${t.patient?.full_name} (${t.patient_id}) | Title: ${t.title} | Content: ${t.description.slice(0, 50)}...`)
    })
  }
}

debugGlobalTasks()
