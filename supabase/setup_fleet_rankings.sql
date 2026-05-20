-- ==============================================================================
-- 1. CRIAÇÃO DA TABELA PÚBLICA DE RANKING
-- Armazena apenas dados não-sensíveis para o Ranking da Frota
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.fleet_rankings (
    child_id TEXT PRIMARY KEY,
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    fleet_id TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT NOT NULL,
    stars INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 2. POLÍTICAS DE SEGURANÇA (RLS) DA NOVA TABELA
-- ==============================================================================
ALTER TABLE public.fleet_rankings ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário logado pode LER o ranking de frotas
CREATE POLICY "Leitura pública de rankings" 
    ON public.fleet_rankings FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Apenas o próprio dono pode Inserir/Atualizar/Deletar via banco (embora o Trigger vá fazer isso)
CREATE POLICY "Usuário gerencia seu ranking" 
    ON public.fleet_rankings FOR ALL 
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);

-- ==============================================================================
-- 3. FUNÇÃO TRIGGER PARA SINCRONIZAÇÃO AUTOMÁTICA
-- Extrai os dados do JSONB 'state' e salva na tabela pública de forma invisível
-- ==============================================================================
CREATE OR REPLACE FUNCTION sync_fleet_rankings()
RETURNS TRIGGER AS $$
DECLARE
    child_record JSONB;
BEGIN
    -- Só prossegue se houver um fleet_id e se o state contiver o array 'children'
    IF NEW.fleet_id IS NOT NULL AND NEW.state ? 'children' THEN
        
        -- Loop através do array de crianças dentro do JSONB
        FOR child_record IN SELECT * FROM jsonb_array_elements(NEW.state->'children')
        LOOP
            -- Upsert na tabela fleet_rankings
            INSERT INTO public.fleet_rankings (child_id, profile_id, fleet_id, name, avatar, stars, updated_at)
            VALUES (
                child_record->>'id',
                NEW.profile_id,
                NEW.fleet_id,
                child_record->>'name',
                child_record->>'avatar',
                (child_record->>'stars')::INTEGER,
                now()
            )
            ON CONFLICT (child_id) DO UPDATE SET
                fleet_id = EXCLUDED.fleet_id,
                name = EXCLUDED.name,
                avatar = EXCLUDED.avatar,
                stars = EXCLUDED.stars,
                updated_at = now();
        END LOOP;
        
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 4. ATRELAR O TRIGGER À TABELA GAMIFICATION
-- ==============================================================================
DROP TRIGGER IF EXISTS trigger_sync_fleet ON public.patient_gamification;

CREATE TRIGGER trigger_sync_fleet
AFTER INSERT OR UPDATE ON public.patient_gamification
FOR EACH ROW
EXECUTE FUNCTION sync_fleet_rankings();

-- ==============================================================================
-- 5. ATUALIZAR A RPC (FUNÇÃO) DO NEXT.JS PARA LER DA NOVA TABELA
-- ==============================================================================
DROP FUNCTION IF EXISTS get_fleet_ranking(TEXT);

CREATE OR REPLACE FUNCTION get_fleet_ranking(p_fleet_id TEXT)
RETURNS TABLE (
    child_id TEXT,
    name TEXT,
    avatar TEXT,
    stars INTEGER
) AS $$
BEGIN
    RETURN QUERY 
    SELECT f.child_id, f.name, f.avatar, f.stars
    FROM public.fleet_rankings f
    WHERE f.fleet_id = p_fleet_id
    ORDER BY f.stars DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
