-- Script Seguro para a tabela da Roda da Vida (Priorizador de Vida)

-- 1. Criar a tabela se não existir
CREATE TABLE IF NOT EXISTS public.life_wheel_assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    scores JSONB NOT NULL,
    activities JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Garantir que a coluna activities existe (caso a tabela já tenha sido criada antes)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='life_wheel_assessments' AND column_name='activities') THEN
        ALTER TABLE public.life_wheel_assessments ADD COLUMN activities JSONB;
    END IF;
END $$;

-- 3. Ativar RLS
ALTER TABLE public.life_wheel_assessments ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de forma segura (removendo as antigas se existirem)
DROP POLICY IF EXISTS "Users can view their own life wheel assessments" ON public.life_wheel_assessments;
CREATE POLICY "Users can view their own life wheel assessments" 
ON public.life_wheel_assessments FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own life wheel assessments" ON public.life_wheel_assessments;
CREATE POLICY "Users can insert their own life wheel assessments" 
ON public.life_wheel_assessments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own life wheel assessments" ON public.life_wheel_assessments;
CREATE POLICY "Users can update their own life wheel assessments" 
ON public.life_wheel_assessments FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own life wheel assessments" ON public.life_wheel_assessments;
CREATE POLICY "Users can delete their own life wheel assessments" 
ON public.life_wheel_assessments FOR DELETE 
USING (auth.uid() = user_id);
