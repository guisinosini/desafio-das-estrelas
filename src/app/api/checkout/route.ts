import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const {
      appointmentId,
      serviceName,
      patientEmail,
      installments,
      installmentAmount,
      paymentMethod, // "card" | "pix"
    } = await req.json();

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID é obrigatório." },
        { status: 400 }
      );
    }

    // SECURITY HARDENING: VALIDAR PREÇO NO SERVIDOR (PREVENT PRICE MANIPULATION)
    // Buscamos os dados do serviço diretamente no banco para garantir o preço real.
    const { data: appointment, error: apptError } = await supabase
      .from("appointments")
      .select("service:services(price)")
      .eq("id", appointmentId)
      .single();

    if (apptError || !appointment || !appointment.service) {
      console.error("Erro ao validar agendamento para checkout:", apptError);
      return NextResponse.json({ error: "Agendamento ou serviço não encontrado." }, { status: 404 });
    }

    // O preço é o valor base do serviço.
    const baseAmount = Number((appointment.service as any).price);
    
    // Recalcular com juros no servidor para impedir manipulações.
    let finalAmount = baseAmount;
    const installNum = paymentMethod === "card" ? (Number(installments) || 1) : 1;
    
    if (installNum > 3) {
      const i = 0.0299; // 2.99% a.m.
      const monthly = (baseAmount * i) / (1 - Math.pow(1 + i, -installNum));
      finalAmount = monthly * installNum;
    }

    const amountInCents = Math.round(finalAmount * 100) || 100; // Fallback tolerante > 0

    // ── PIX ──────────────────────────────────────────────────────────────────
    if (paymentMethod === "pix") {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "brl",
        payment_method_types: ["pix"],
        payment_method_data: { type: "pix" },
        confirm: true,
        payment_method_options: {
          pix: { expires_after_seconds: 3600 }, // 1h
        },
        metadata: { appointmentId, serviceName: serviceName || "", patientEmail: patientEmail || "" },
      });

      const qrCode =
        paymentIntent.next_action?.pix_display_qr_code?.image_url_png ?? null;
      const qrCodeText =
        paymentIntent.next_action?.pix_display_qr_code?.data ?? null;

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        pixQrCode: qrCode,
        pixQrCodeText: qrCodeText,
      });
    }

    // ── Card ─────────────────────────────────────────────────────────────────
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "brl",
      automatic_payment_methods: { enabled: true },
      metadata: {
        appointmentId,
        serviceName: serviceName || "",
        patientEmail: patientEmail || "",
        installments: String(installNum),
        installment_amount: String(installmentAmount || baseAmount),
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    console.error("Stripe Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
