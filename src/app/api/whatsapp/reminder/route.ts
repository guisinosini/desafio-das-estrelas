import { NextResponse } from "next/server";

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const ACCESS_TOKEN    = process.env.WHATSAPP_ACCESS_TOKEN!;
const TEMPLATE_NAME   = process.env.WHATSAPP_TEMPLATE_NAME || "lembrete_consulta";

/**
 * Formats a phone number to international format (E.164)
 * Input:  "(11) 99999-9999"  or  "11999999999"
 * Output: "5511999999999"
 */
function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // Already has country code (55)
  if (digits.startsWith("55") && digits.length >= 12) return digits;
  return "55" + digits;
}

/**
 * Sends a WhatsApp template message via Meta Cloud API.
 * Template variables (in order):
 *   {{1}} = patient first name
 *   {{2}} = service name
 *   {{3}} = date (dd/mm/yyyy)
 *   {{4}} = time (HH:mm)
 *   {{5}} = professional name
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const secret     = process.env.CRON_SECRET;

    // Fail-Closed: Bloqueia qualquer tentativa se a chave não for válida
    if (!secret || authHeader !== `Bearer ${secret}`) {
      console.warn("[SECURITY] Bloqueio de acesso externo indevido ao endpoint de WhatsApp API.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { to, patientName, serviceName, date, time, professionalName } = await req.json();

    if (!to || !patientName) {
      return NextResponse.json({ error: "Parâmetros obrigatórios ausentes." }, { status: 400 });
    }

    const phone = formatPhone(to);
    const firstName = patientName.split(" ")[0];

    const payload = {
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: TEMPLATE_NAME,
        language: { code: "pt_BR" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: firstName },
              { type: "text", text: serviceName },
              { type: "text", text: date },
              { type: "text", text: time },
              { type: "text", text: professionalName },
            ],
          },
        ],
      },
    };

    const res = await fetch(
      `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("WhatsApp API Error:", data);
      return NextResponse.json({ error: data.error?.message || "Erro na API do WhatsApp" }, { status: res.status });
    }

    return NextResponse.json({ success: true, messageId: data.messages?.[0]?.id });
  } catch (err: any) {
    console.error("WhatsApp route error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
