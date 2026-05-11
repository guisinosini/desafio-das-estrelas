const { createClient } = require('@supabase/supabase-js')
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const envMap = Object.fromEntries(env.split('\n').filter(l => l.includes('=')).map(l => l.trim().split('=')));

const supabase = createClient(envMap.NEXT_PUBLIC_SUPABASE_URL, envMap.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function checkOrphanedMessages() {
  try {
    const { data, error } = await supabase
      .from('patient_messages')
      .select('id, patient_id, read, professional_id')
      .eq('read', false)

    if (error) {
      console.error("Supabase error:", error)
      return
    }

    if (!data) {
      console.log("No messages found.")
      return
    }

    const orphaned = data.filter(m => !m.patient_id)
    console.log(`Unread messages total: ${data.length}`)
    console.log(`Unread messages with NULL patient_id: ${orphaned.length}`)
    
    // Also check if patient_id points to a non-existent patient
    const uniquePatients = [...new Set(data.map(m => m.patient_id).filter(Boolean))]
    if (uniquePatients.length > 0) {
      const { data: patients } = await supabase
        .from('patients')
        .select('id')
        .in('id', uniquePatients)
        
      const existingIds = patients ? patients.map(p => p.id) : []
      const missingPatients = uniquePatients.filter(id => !existingIds.includes(id))
      
      if (missingPatients.length > 0) {
        console.log(`Patients that NO LONGER EXIST: ${missingPatients.length}`)
        const orphanedByDeletion = data.filter(m => missingPatients.includes(m.patient_id))
        console.log(`Unread messages for DELETED patients: ${orphanedByDeletion.length}`)
        console.log("Example orphaned msg professional_id:", orphanedByDeletion[0].professional_id)
      } else {
        console.log("All unread messages point to existing patients.")
      }
    } else {
      console.log("No patients linked to unread messages.")
    }
  } catch (err) {
    console.error("Execution error:", err)
  }
}

checkOrphanedMessages()
