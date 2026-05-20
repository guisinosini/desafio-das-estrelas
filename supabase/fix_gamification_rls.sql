-- ==============================================================================
-- DESAFIO DAS ESTRELAS - FIX PATIENT GAMIFICATION TABLE
-- Execute este script no SQL Editor do seu Supabase para garantir 
-- que a tabela e as políticas RLS estão corretas.
-- ==============================================================================

-- 1. Cria a tabela se não existir
CREATE TABLE IF NOT EXISTS public.patient_gamification (
    profile_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    state JSONB NOT NULL DEFAULT '{}'::jsonb,
    fleet_id TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilita RLS
ALTER TABLE public.patient_gamification ENABLE ROW LEVEL SECURITY;

-- 3. Remove políticas antigas caso existam para evitar conflitos
DROP POLICY IF EXISTS "Usuário gerencia seu próprio jogo" ON public.patient_gamification;
DROP POLICY IF EXISTS "Leitura de Frotas para Ranking" ON public.patient_gamification;
DROP POLICY IF EXISTS "Permitir Select no próprio jogo" ON public.patient_gamification;
DROP POLICY IF EXISTS "Permitir Insert no próprio jogo" ON public.patient_gamification;
DROP POLICY IF EXISTS "Permitir Update no próprio jogo" ON public.patient_gamification;
DROP POLICY IF EXISTS "Permitir Delete no próprio jogo" ON public.patient_gamification;

-- 4. Cria políticas separadas e mais seguras para evitar bugs de UPSERT
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

-- 5. Política de Ranking removida
-- A leitura de frotas agora é feita na nova tabela pública 'fleet_rankings'.
-- Não permita leitura de terceiros na patient_gamification!
