-- ============================================================
-- PONTO DE RESTAURAÇÃO DE SEGURANÇA - Instituto Kamaleon
-- DATA: 2026-04-27
-- OBJETIVO: Reverter as políticas de RLS e funções para o estado original
-- ============================================================

BEGIN;

-- 1. Restaurar handle_new_user original
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'avatar_url', 
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Restaurar RLS de patient_anamnesis
DROP POLICY IF EXISTS "Professionals can view anamnesis of patients" ON public.patient_anamnesis;
CREATE POLICY "Professionals can view anamnesis of patients"
  ON public.patient_anamnesis FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'professional'
    )
  );

-- 3. Restaurar RLS de patient_assessments
DROP POLICY IF EXISTS "Professionals and Admins can view all assessments" ON public.patient_assessments;
CREATE POLICY "Professionals and Admins can view all assessments"
    ON public.patient_assessments
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'professional')
      )
    );

-- 4. Restaurar RLS de professionals
DROP POLICY IF EXISTS "Professionals are viewable by everyone" ON public.professionals;
CREATE POLICY "Professionals are viewable by everyone" ON public.professionals
  FOR SELECT USING (true);

-- 5. Remover trigger de proteção de role (será criado no hardening)
DROP TRIGGER IF EXISTS ensure_role_not_changed ON public.profiles;
DROP FUNCTION IF EXISTS public.prevent_role_change();

COMMIT;
