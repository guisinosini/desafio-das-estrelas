-- Cria a tabela de Testimonials (Depoimentos)
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ativa o Row Level Security (RLS)
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Política 1: Todos (até não logados) podem ver os depoimentos que estão ativos
CREATE POLICY "Everyone can see active testimonials"
    ON public.testimonials FOR SELECT
    USING (active = true);

-- Política 2: Apenas Admins podem ver TODOS os depoimentos (incluindo inativos)
CREATE POLICY "Admins can view all testimonials"
    ON public.testimonials FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Política 3: Apenas Admins podem INSERIR
CREATE POLICY "Admins can insert testimonials"
    ON public.testimonials FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Política 4: Apenas Admins podem ATUALIZAR
CREATE POLICY "Admins can update testimonials"
    ON public.testimonials FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Política 5: Apenas Admins podem DELETAR
CREATE POLICY "Admins can delete testimonials"
    ON public.testimonials FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );
