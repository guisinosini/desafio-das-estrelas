import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Uses service role key for server-side queries without RLS restrictions
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Vercel Cron Job — runs daily at 07:00 (BRT = 10:00 UTC)
 * Finds all appointments scheduled for today and sends WhatsApp reminders.
 *
 * Protected by CRON_SECRET header to prevent unauthorized access.
 */
export async function GET(req: Request) {
  // SECURITY HARDENING: Fail-Closed Protection
  const authHeader = req.headers.get("authorization");
  const secret     = process.env.CRON_SECRET;

  // Se a chave não estiver configurada ou o header for inválido, BLOQUER (Fail-Closed)
  if (!secret || authHeader !== `Bearer ${secret}`) {
    console.error("[SECURITY] Tentativa de execução de CRON não autorizada ou chave não configurada.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Process absences before sending reminders
  try {
    const { data: absenceResult, error: absenceError } = await supabase.rpc("mark_absent_appointments");
    if (absenceError) console.error("Error processing absences:", absenceError);
    else console.log("Absence process result:", absenceResult);
  } catch (e) {
    console.error("Critical error in absence processing:", e);
  }

  const today = new Date();
  const todayStr  = today.toISOString().split("T")[0]; // "YYYY-MM-DD"
  const tomorrowStr = new Date(today.getTime() + 86400000).toISOString().split("T")[0];

  // Fetch today's confirmed/scheduled appointments with patient phone
  const { data: appointments, error } = await supabase
    .from("appointments")
    .select(`
      id, start_time, status,
      patient:patients(full_name, phone),
      professional:professionals(full_name),
      service:services(name)
    `)
    .gte("start_time", `${todayStr}T00:00:00`)
    .lt("start_time",  `${tomorrowStr}T00:00:00`)
    .in("status", ["scheduled", "confirmed"]);

  if (error) {
    console.error("Cron DB error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results: any[] = [];
  let sent = 0;
  let skipped = 0;

  for (const apt of appointments || []) {
    const phone = (apt.patient as any)?.phone;

    if (!phone) {
      skipped++;
      results.push({ id: apt.id, status: "skipped", reason: "no_phone" });
      continue;
    }

    const start         = new Date(apt.start_time);
    const date          = start.toLocaleDateString("pt-BR");
    const time          = start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const patientName   = (apt.patient as any)?.full_name  || "Paciente";
    const professionalName = (apt.professional as any)?.full_name || "Profissional";
    const serviceName   = (apt.service as any)?.name || "Consulta";

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/whatsapp/reminder`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.CRON_SECRET || ""}`
        },
        body: JSON.stringify({ to: phone, patientName, serviceName, date, time, professionalName }),
      });

      const data = await res.json();

      if (res.ok) {
        sent++;
        results.push({ id: apt.id, status: "sent", phone: phone.slice(-4), messageId: data.messageId });
      } else {
        results.push({ id: apt.id, status: "error", error: data.error });
      }
    } catch (e: any) {
      results.push({ id: apt.id, status: "error", error: e.message });
    }
  }

  console.log(`WhatsApp Cron: ${sent} sent, ${skipped} skipped (no phone)`);
  return NextResponse.json({ date: todayStr, total: appointments?.length, sent, skipped, results });
}
