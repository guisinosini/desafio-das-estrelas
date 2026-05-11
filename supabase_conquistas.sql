-- Estrutura para o App Jornada de Conquistas (Token Economy - ABA)

-- 1. Tabela de Tarefas
CREATE TABLE IF NOT EXISTS public.conquistas_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    stars INTEGER CHECK (stars >= 1 AND stars <= 3) NOT NULL,
    category TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Recompensas
CREATE TABLE IF NOT EXISTS public.conquistas_rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    cost_stars INTEGER NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Histórico de Execução (Logs de Estrelas)
CREATE TABLE IF NOT EXISTS public.conquistas_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.conquistas_tasks(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    approved_at TIMESTAMP WITH TIME ZONE
);

-- 4. Banco de Estrelas (Saldo)
CREATE TABLE IF NOT EXISTS public.conquistas_bank (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    child_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    total_stars INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security)
ALTER TABLE public.conquistas_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conquistas_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conquistas_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conquistas_bank ENABLE ROW LEVEL SECURITY;

-- Políticas Básicas (Simplificadas para o protótipo)
-- Em produção, deve-se vincular parent_id ao child_id via tabela de perfis
CREATE POLICY "Users can manage their own data" ON public.conquistas_tasks 
    FOR ALL USING (auth.uid() = parent_id);

CREATE POLICY "Users can manage their own data" ON public.conquistas_rewards 
    FOR ALL USING (auth.uid() = parent_id);

CREATE POLICY "Child can view and progress" ON public.conquistas_progress 
    FOR ALL USING (true); -- Permitir visualização geral para o protótipo

CREATE POLICY "Bank access" ON public.conquistas_bank 
    FOR ALL USING (true);
