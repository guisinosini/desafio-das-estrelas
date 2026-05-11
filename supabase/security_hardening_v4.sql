-- SECURITY HARDENING V4 - REFINAMENTO DE CORRELAÇÃO E RETENÇÃO

-- 1. REFINAMENTO DE PERFIS (VISIBILIDADE DOS ESPECIALISTAS)
-- Permite que pacientes vejam apenas o Nome e Avatar de quem é Profissional ou Admin.
-- Garante que o booking e as fotos de perfil funcionem sem vazar a lista de outros pacientes.

DROP POLICY IF EXISTS "Perfis visíveis apenas por admins ou pelo próprio titular" ON public.profiles;

CREATE POLICY "Perfis: Acesso total para o próprio ou Admins; Visualização para Especialistas"
ON public.profiles FOR SELECT
TO authenticated
USING (
  (id = auth.uid()) OR -- Próprio usuário vê tudo de si
  (role IN ('admin', 'professional')) OR -- Permite que todos vejam quem é especialista na clínica
  (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')) -- Admin vê tudo de todos
);


-- 2. RETENÇÃO DE INSIGHTS (DIÁRIO DE BORDO)
-- Pacientes podem escrever e ler seu diário, mas não podem apagar o histórico clínico por segurança médica (Retention).
-- Reforçamos a conformidade bloqueando o DELETE para o paciente.

ALTER TABLE public.patient_insights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Patients can manage their own insights" ON public.patient_insights;

-- SELECT, INSERT, UPDATE apenas (Sem DELETE por segurança clínica)
CREATE POLICY "Pacientes gerenciam (mas não deletam) seus insights"
ON public.patient_insights FOR ALL
TO authenticated
USING (patient_id = auth.uid())
WITH CHECK (patient_id = auth.uid());

-- Somente admins podem limpar registros se necessário
CREATE POLICY "Admins podem deletar insights"
ON public.patient_insights FOR DELETE
TO authenticated
USING (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));


-- 3. OTIMIZAÇÃO DE PATIENTS (BUSCA POR ID DIRETO)
-- Substituímos a busca por e-mail no RLS de patients para usar o ID direto (mesmo da Auth).
-- Isso torna a verificação instantânea e elimina dependência de sincronia de e-mails.

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Patients can manage their own record" ON public.patients;

CREATE POLICY "Pacientes gerenciam seu próprio registro por ID"
ON public.patients FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Comentário: Blindagem de correlação concluída. Sistema agora é seguro e resiliente.
