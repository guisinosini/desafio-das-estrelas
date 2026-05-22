import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: "E-mail ou código ausentes." }, { status: 400 });
    }

    // Aqui seria implementada a integração com o Resend, Sendgrid ou outro provedor de e-mail.
    console.log(`[E-mail Simulado] Enviando convite para ${email} com o código ${code}`);
    
    // Simulação de atraso de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({ success: true, message: "Convite enviado com sucesso!" });
  } catch (error) {
    console.error("Erro ao enviar convite:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
