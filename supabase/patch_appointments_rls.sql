-- PATCH DE SEGURANÇA: TABELA DE AGENDAMENTOS (APPOINTMENTS)
-- Este script resolve o alerta do Supabase "Table public.appointments is exposed via API without RLS"

-- 1. Habilitar a proteção (Row Level Security) - ISSO RESOLVE O ALERTA DO SUPABASE
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 2. Limpar políticas soltas (caso existam)
DROP POLICY IF EXISTS "Admins have full access to appointments" ON public.appointments;
DROP POLICY IF EXISTS "Professionals can manage their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Patients can manage their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins possuem acesso total as consultas" ON public.appointments;
DROP POLICY IF EXISTS "Profissionais gerenciam suas consultas" ON public.appointments;
DROP POLICY IF EXISTS "Pacientes gerenciam suas consultas" ON public.appointments;

-- 3. Criar Políticas Restritas e Seguras

-- A) ADMINISTRADORES: Podem ver, criar, editar e deletar qualquer consulta
CREATE POLICY "Admins have full access to appointments" 
ON public.appointments 
FOR ALL 
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- B) PROFISSIONAIS: Podem apenas acessar as próprias consultas (onde eles são os responsáveis)
CREATE POLICY "Professionals can manage their own appointments" 
ON public.appointments 
FOR ALL 
TO authenticated
USING (
  professional_id IN (SELECT id FROM public.professionals WHERE email = (auth.jwt() ->> 'email'))
);

-- C) PACIENTES: Podem apenas acessar e agendar suas próprias consultas
CREATE POLICY "Patients can manage their own appointments" 
ON public.appointments 
FOR ALL 
TO authenticated
USING (
  patient_id IN (SELECT id FROM public.patients WHERE email = (auth.jwt() ->> 'email'))
);
