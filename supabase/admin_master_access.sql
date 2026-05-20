-- ============================================================
-- MASTER ACCESS SCRIPT FOR ADMINS
-- Garantindo que o Admin tenha acesso absoluto aos dados da plataforma
-- ============================================================

BEGIN;

-- 1. Garante que a função de Bypass exista de forma segura (sem loop infinito)
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. MASTER KEY para PROFILES (Tabela de Mentores/Usuários)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles" ON public.profiles
  FOR ALL USING (public.check_is_admin());

-- 3. MASTER KEY para PATIENT_GAMIFICATION (Onde moram as Missões, Planetas, Histórico e Crianças)
ALTER TABLE public.patient_gamification ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins have full access to gamification" ON public.patient_gamification;
CREATE POLICY "Admins have full access to gamification" ON public.patient_gamification
  FOR ALL USING (public.check_is_admin());

-- 4. MASTER KEY para SHARED_REPORTS (Relatórios Gerados)
ALTER TABLE public.shared_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins have full access to shared reports" ON public.shared_reports;
CREATE POLICY "Admins have full access to shared reports" ON public.shared_reports
  FOR ALL USING (public.check_is_admin());

-- 6. Garantia de privilégios base para evitar erros 403 de Permissão de Coluna
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.patient_gamification TO authenticated;
GRANT ALL ON public.shared_reports TO authenticated;

COMMIT;
