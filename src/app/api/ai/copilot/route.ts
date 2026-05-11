import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `Você é um assistente sênior em saúde mental, treinado como um Copiloto Clínico para psicólogos e terapeutas. 
Seu papel é ajudar o profissional a estruturar raciocínio clínico.

Diretrizes rigorosas:
1. NÃO diagnostique o paciente diretamente e NÃO fale diretamente com o paciente. Suas respostas devem ser direcionadas ao profissional (ex: "Considerando os sintomas que você descreveu, o diagnóstico diferencial pode incluir...").
2. Sempre considere os critérios do DSM-5-TR e da CID-11.
3. Se os sintomas forem vagos, sugira perguntas adicionais que o profissional pode fazer ao paciente para refinar a hipótese diagnóstica.
4. Sugira abordagens terapêuticas baseadas em evidências (ex: TCC, DBT, ACT, Psicanálise) de forma estruturada.
5. Mantenha um tom profissional, acadêmico, compreensivo e colaborativo.
6. Formate as suas respostas usando Markdown (listas, negritos, quebras de linha) para facilitar a leitura.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Formato de mensagens inválido." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "A chave de API do Gemini (GEMINI_API_KEY) não está configurada." },
        { status: 500 }
      );
    }

    // Filtra a mensagem inicial de boas-vindas do frontend (pois ela não foi gerada pelo modelo da API e pode causar erros de formato)
    const conversationHistory = messages.filter(
      (msg) => !(msg.role === "assistant" && msg.content.includes("Olá, sou o seu Copiloto Clínico"))
    );

    const formattedContents = conversationHistory.map((msg: any, index: number) => {
      let content = msg.content;
      
      // Injeta as instruções de sistema na primeira mensagem para garantir o comportamento
      if (index === 0 && msg.role === "user") {
        content = `${SYSTEM_PROMPT}\n\n---\n\nSOLICITAÇÃO DO PROFISSIONAL: ${msg.content}`;
      }

      return {
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: content }],
      };
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: formattedContents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error?.message || "Erro interno da API do Gemini.";
      console.error("Gemini API Error Detail:", data);
      return NextResponse.json(
        { error: errorMsg },
        { status: response.status }
      );
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Desculpe, não consegui processar uma resposta.";

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Copilot Error:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro inesperado no servidor." },
      { status: 500 }
    );
  }
}
