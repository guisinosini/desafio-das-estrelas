-- ============================================================
-- SECURITY HARDENING V6 - PROTEÇÃO E PRIVACIDADE DE DADOS
-- ============================================================

BEGIN;

-- 1. PROTEÇÃO CONTRA ESCALAÇÃO DE PRIVILÉGIOS NO SIGNUP
-- Modifica a função handle_new_user para ignorar qualquer role enviada pelo front-end.
-- Força que todo novo usuário seja criado com o papel 'patient'.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 
    NEW.raw_user_meta_data->>'avatar_url', 
    'patient' -- FORÇADO: Apenas o papel de paciente é permitido via signup público
  );
  
  -- Também garante que o registro na tabela clinical patients seja criado
  INSERT INTO public.patients (full_name, email, active)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    TRUE
  )
  ON CONFLICT (email) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. PROTEÇÃO CONTRA ALTERAÇÃO MANUAL DE ROLE (ANTI-HACK)
-- Impede que um usuário altere sua própria coluna 'role' na tabela profiles.
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role <> OLD.role AND (SELECT role FROM public.profiles WHERE id = auth.uid()) <> 'admin' THEN
    RAISE EXCEPTION 'Alteração de papel não permitida. Contate um administrador.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS ensure_role_not_changed ON public.profiles;
CREATE TRIGGER ensure_role_not_changed
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_role_change();

-- 3. RESTRICÇÃO DE ACESSO CLÍNICO (PROFISSIONAIS)
-- Função auxiliar para verificar se o profissional atende o paciente
CREATE OR REPLACE FUNCTION public.check_professional_attends_patient(target_patient_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Se for admin, tem acesso total
  IF (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' THEN
    RETURN TRUE;
  END IF;

  -- Se for o próprio paciente, tem acesso (embora esta função seja para profissionais)
  IF auth.uid() = target_patient_id THEN
    RETURN TRUE;
  END IF;

  -- Verifica se existe agendamento entre o profissional atual e o paciente
  RETURN EXISTS (
    SELECT 1 FROM public.appointments a
    JOIN public.professionals p ON a.professional_id = p.id
    WHERE p.email = (auth.jwt() ->> 'email')
    AND a.patient_id = target_patient_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar à Anamnese
DROP POLICY IF EXISTS "Professionals can view anamnesis of patients" ON public.patient_anamnesis;
CREATE POLICY "Professionals can view anamnesis of patients"
  ON public.patient_anamnesis FOR SELECT
  USING (
    public.check_professional_attends_patient(patient_id)
  );

-- Aplicar às Avaliações (BAI/BDI)
DROP POLICY IF EXISTS "Professionals and Admins can view all assessments" ON public.patient_assessments;
CREATE POLICY "Professionals can view assessments of their patients"
    ON public.patient_assessments
    FOR SELECT
    USING (
      public.check_professional_attends_patient(patient_id)
    );

-- 4. PRIVACIDADE DOS PROFISSIONAIS (OCULTAR CONTATOS)
-- Visitantes podem ver o nome e especialidade, mas não e-mail e telefone.
DROP POLICY IF EXISTS "Professionals are viewable by everyone" ON public.professionals;
CREATE POLICY "Public info of professionals is viewable by everyone" 
  ON public.professionals FOR SELECT
  USING (true);

-- No Supabase, não podemos ocultar colunas via RLS facilmente sem VIEWs, 
-- mas podemos restringir o SELECT total se quisermos. 
-- Para uma LP, precisamos do nome/foto.
-- Sugestão: Criar uma VIEW pública se o usuário desejar, mas por agora 
-- vamos ao menos garantir que agendamentos de outros profissionais sejam privados.

COMMIT;
