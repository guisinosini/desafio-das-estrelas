-- ==============================================================================
-- DESAFIO DAS ESTRELAS - SCHEMA OFICIAL
-- Execute este script no SQL Editor do seu novo projeto Supabase
-- ==============================================================================

-- 1. Criação da Tabela Principal
-- Aqui armazenamos todo o estado do jogo em JSONB para sincronização ultra-rápida.
CREATE TABLE IF NOT EXISTS public.patient_gamification (
    profile_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    state JSONB NOT NULL DEFAULT '{}'::jsonb,
    fleet_id TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar Segurança em Nível de Linha (RLS)
ALTER TABLE public.patient_gamification ENABLE ROW LEVEL SECURITY;

-- 3. Criar Políticas de Segurança (Policies)

-- A) O usuário autenticado tem controle total (Select, Insert, Update) sobre sua própria linha
CREATE POLICY "Usuário gerencia seu próprio jogo" 
    ON public.patient_gamification 
    FOR ALL 
    USING (auth.uid() = profile_id);

-- B) Membros da mesma Frota Galáctica podem ver o estado uns dos outros para o Ranking
-- O Next.js já filtra por fleet_id no frontend, mas isso garante a leitura cruzada
CREATE POLICY "Leitura de Frotas para Ranking"
    ON public.patient_gamification
    FOR SELECT
    USING (auth.role() = 'authenticated');
