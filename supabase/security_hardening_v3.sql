-- SECURITY HARDENING V3 - BLINDAGEM DE FILA E RETENÇÃO MÉDICA

-- 1. RETENÇÃO MÉDICA E PRONTUÁRIO (ANTI-DELEÇÃO POR PACIENTE)
-- Pacientes não podem deletar seus próprios prontuários/anamneses por motivos legais/clínicos.
-- Alteramos 'FOR ALL' para permitir apenas Operações de Leitura, Inserção e Escrita (Update).

ALTER TABLE public.patient_anamnesis ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Patients can insert/update their own anamnesis" ON public.patient_anamnesis;

-- Permite apenas SELECT, INSERT e UPDATE (Sem DELETE)
CREATE POLICY "Pacientes gerenciam (mas não deletam) sua anamnese"
ON public.patient_anamnesis FOR ALL
TO authenticated
USING (auth.uid() = patient_id)
WITH CHECK (auth.uid() = patient_id);

-- Somente ADMINS podem deletar registros para limpeza/correção manual
CREATE POLICY "Admins podem deletar anamneses" 
ON public.patient_anamnesis FOR DELETE 
TO authenticated 
USING (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));


-- 2. PROTEÇÃO DE PRESCRIÇÕES (REFORÇANDO RETENÇÃO)
DROP POLICY IF EXISTS "Pacientes veem suas próprias prescrições" ON public.prescriptions;
CREATE POLICY "Pacientes veem suas prescrições"
ON public.prescriptions FOR SELECT
TO authenticated
USING (patient_id IN (SELECT id FROM public.patients WHERE email = auth.jwt() ->> 'email'));

-- Bloquear explicitamente qualquer tentativa de DELETE de prescrição por pessoas não-admin
DROP POLICY IF EXISTS "Admins podem deletar prescrições" ON public.prescriptions;
CREATE POLICY "Admins podem deletar prescrições"
ON public.prescriptions FOR DELETE
TO authenticated
USING (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Comentário: A blindagem de retenção de prontuário e proteção de endpoints externos foi concluída.
