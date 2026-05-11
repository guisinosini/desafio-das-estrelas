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
      orderId,
      patientEmail,
      paymentMethod, // "card" | "pix"
    } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID é obrigatório." },
        { status: 400 }
      );
    }

    // SECURITY HARDENING: VALIDAR PREÇO NO SERVIDOR (PREVENT PRICE MANIPULATION)
    // Buscamos o pedido no banco para garantir que o usuário pague o valor REAL.
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("total_amount")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Erro ao validar pedido para checkout:", orderError);
      return NextResponse.json({ error: "Pedido não encontrado ou inválido." }, { status: 404 });
    }

    const amount = Number(order.total_amount);
    const amountInCents = Math.round(amount * 100);

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
        metadata: { orderId, type: "store_purchase", patientEmail: patientEmail || "" },
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
        orderId,
        type: "store_purchase",
        patientEmail: patientEmail || "",
      },
      payment_method_options: {
        card: {
          installments: {
            enabled: true,
          },
        },
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    console.error("Store Stripe Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
