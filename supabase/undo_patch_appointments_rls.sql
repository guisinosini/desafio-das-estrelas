-- REVERTER PATCH DE SEGURANÇA: TABELA DE AGENDAMENTOS (APPOINTMENTS)
-- Este script desfaz a correção do Supabase e desativa o RLS (Row Level Security)
-- ATENÇÃO: Desabilitar o RLS pode expor seus dados, faça isso caso precise restaurar
--          o funcionamento urgente enquanto adequa as políticas de segurança.

-- 1. Limpar as políticas restritas criadas pelo patch de segurança
DROP POLICY IF EXISTS "Admins have full access to appointments" ON public.appointments;
DROP POLICY IF EXISTS "Professionals can manage their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Patients can manage their own appointments" ON public.appointments;

-- 2. Desabilitar completamente o RLS para restaurar o acesso
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
