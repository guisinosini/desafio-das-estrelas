-- SECURITY HARDENING - CORREÇÃO DE VULNERABILIDADES CRÍTICAS

-- 1. PRESCRIÇÕES (Proteção contra acesso público e injeção de prescrições)
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public viewing by ID" ON public.prescriptions;
DROP POLICY IF EXISTS "Professionals can insert" ON public.prescriptions;

-- Pacientes podem ver apenas suas próprias prescrições
CREATE POLICY "Pacientes veem suas próprias prescrições" 
ON public.prescriptions FOR SELECT 
TO authenticated 
USING (patient_id IN (SELECT id FROM public.patients WHERE email = auth.jwt() ->> 'email'));

-- Profissionais podem ver prescrições de pacientes que eles atendem (via appointments)
CREATE POLICY "Profissionais veem prescrições de seus pacientes"
ON public.prescriptions FOR SELECT
TO authenticated
USING (
  exists (
    select 1 from public.appointments a 
    join public.professionals prof on prof.id = a.professional_id
    where a.patient_id = prescriptions.patient_id
    and prof.email = auth.jwt() ->> 'email'
  )
);

-- Profissionais podem inserir prescrições confirmando sua própria identidade
CREATE POLICY "Profissionais podem inserir prescrições"
ON public.prescriptions FOR INSERT
TO authenticated
WITH CHECK (
  professional_id IN (SELECT id FROM public.professionals WHERE email = auth.jwt() ->> 'email')
);


-- 2. ANAMNESE (Restrição de acesso a pacientes sob cuidados do profissional)
ALTER TABLE public.patient_anamnesis ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Professionals can view anamnesis of patients" ON public.patient_anamnesis;

CREATE POLICY "Profissionais veem anamnese apenas de seus pacientes"
ON public.patient_anamnesis FOR SELECT
TO authenticated
USING (
  exists (
    select 1 from public.appointments a 
    join public.professionals prof on prof.id = a.professional_id
    where a.patient_id = patient_anamnesis.patient_id
    and prof.email = auth.jwt() ->> 'email'
  )
);


-- 3. PERFIS (Proteção contra listagem pública de usuários)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

CREATE POLICY "Perfis visíveis apenas por admins ou pelo próprio titular"
ON public.profiles FOR SELECT
TO authenticated
USING (
  (id = auth.uid()) OR 
  (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
);


-- 4. AGENDAMENTOS (Correção de loop recursivo e limpeza)
DROP POLICY IF EXISTS "Admins have full access to appointments" ON public.appointments;
CREATE POLICY "Admins full access appointments" ON public.appointments
FOR ALL TO authenticated
USING (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Comentário: O hardening foi concluído para os módulos clínicos e de identidade.
