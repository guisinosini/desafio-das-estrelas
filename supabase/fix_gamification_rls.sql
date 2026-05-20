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

-- 4. Cria política robusta para o próprio usuário (Permite Select, Insert, Update, Delete)
CREATE POLICY "Usuário gerencia seu próprio jogo" 
    ON public.patient_gamification 
    FOR ALL 
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);

-- 5. Cria política para o Ranking Galáctico (Apenas leitura)
CREATE POLICY "Leitura de Frotas para Ranking"
    ON public.patient_gamification
    FOR SELECT
    USING (auth.role() = 'authenticated');
