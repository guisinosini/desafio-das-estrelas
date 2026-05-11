-- Create app_pills table for weekly tips, quotes, videos and media
CREATE TABLE IF NOT EXISTS public.app_pills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('text', 'quote', 'image', 'video', 'book')),
    media_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS
ALTER TABLE public.app_pills ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Everyone can view active pills"
    ON public.app_pills
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins have full access to pills"
    ON public.app_pills
    FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Grant access
GRANT ALL ON TABLE public.app_pills TO authenticated;
GRANT ALL ON TABLE public.app_pills TO service_role;
