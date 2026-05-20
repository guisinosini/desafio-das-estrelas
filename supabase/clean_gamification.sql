-- ==============================================================================
-- DESAFIO DAS ESTRELAS - CLEAN & FIX PATIENT GAMIFICATION
-- Execute este script no SQL Editor do seu Supabase para limpar políticas
-- corrompidas e restaurar o acesso correto do aplicativo.
-- ==============================================================================

-- 1. Garante que as permissões básicas da tabela existam para a role authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_gamification TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_gamification TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fleet_rankings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fleet_rankings TO anon;

-- 2. Apaga dinamicamente TODAS as políticas da patient_gamification
-- (Isso remove qualquer política antiga que esteja consultando auth.users indevidamente)
DO $$ 
DECLARE 
    pol RECORD; 
BEGIN 
    FOR pol IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'patient_gamification') 
    LOOP 
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON public.patient_gamification'; 
    END LOOP; 
END $$;

-- 3. Habilita RLS novamente (por segurança)
ALTER TABLE public.patient_gamification ENABLE ROW LEVEL SECURITY;

-- 4. Recria as políticas oficiais 100% isoladas (sem vazamentos de permissão)
CREATE POLICY "Permitir Select no próprio jogo" 
    ON public.patient_gamification FOR SELECT 
    USING (auth.uid() = profile_id);

CREATE POLICY "Permitir Insert no próprio jogo" 
    ON public.patient_gamification FOR INSERT 
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Permitir Update no próprio jogo" 
    ON public.patient_gamification FOR UPDATE 
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Permitir Delete no próprio jogo" 
    ON public.patient_gamification FOR DELETE 
    USING (auth.uid() = profile_id);

-- 5. Força a atualização do cache do Supabase PostgREST 
-- (Corrige erros "fantasmas" de schema desatualizado)
NOTIFY pgrst, 'reload schema';
