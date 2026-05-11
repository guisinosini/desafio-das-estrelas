import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { professionalId, email } = await req.json();

    if (!professionalId || !email) {
      return NextResponse.json({ error: "Parâmetros obrigatórios ausentes" }, { status: 400 });
    }

    // 1. Atualizar a tabela de profissionais com o novo e-mail
    const { error: profError } = await supabaseAdmin
      .from("professionals")
      .update({ email })
      .eq("id", professionalId);

    if (profError) {
      throw new Error(`Erro ao atualizar professional: ${profError.message}`);
    }

    // 2. Buscar o ID do perfil vinculado através do e-mail
    const { data: patientData, error: patientError } = await supabaseAdmin
      .from("patients")
      .select("profile_id")
      .eq("email", email)
      .single();

    if (patientError && patientError.code !== 'PGRST116') {
      console.error("Erro ao buscar vínculo do paciente:", patientError);
    }

    // Se o usuário existir, atualiza sua Role para professional E vincula o ID na ficha do especialista
    if (patientData?.profile_id) {
      const authUserId = patientData.profile_id;

      // 2a. Atualizar Role no Perfil
      const { error: roleError } = await supabaseAdmin
        .from("profiles")
        .update({ role: "professional" })
        .eq("id", authUserId);

      if (roleError) {
        throw new Error(`Erro ao promover perfil para profissional: ${roleError.message}`);
      }

      // 2b. Vínculo Eterno: Salvar o Profile ID na ficha do Especialista
      const { error: linkError } = await supabaseAdmin
        .from("professionals")
        .update({ profile_id: authUserId })
        .eq("id", professionalId);
      
      if (linkError) {
        console.error("Erro ao gravar vínculo de ID:", linkError);
      }
    } else {
        // Se o usuário ainda não se cadastrou na plataforma, aguardamos. O disparo do backend o encontrará depois.
        console.log("Usuário não tem perfil gerado. Role e Profile ID não vinculados.");
    }

    return NextResponse.json({ success: true, message: "Especialista vinculado e perfil promovido" });
  } catch (error: any) {
    console.error("Link Professional Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
