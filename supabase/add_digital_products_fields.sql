ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_digital BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS digital_file_url TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Comentários para documentação
COMMENT ON COLUMN public.products.is_digital IS 'Indica se o produto é digital (ebook, áudio, vídeo, etc)';
COMMENT ON COLUMN public.products.digital_file_url IS 'URL do arquivo digital armazenado no Supabase Storage';
COMMENT ON COLUMN public.products.image_url IS 'URL da imagem do produto';

-- INSTRUÇÕES PARA O STORAGE (Executar no Dashboard do Supabase)
-- 1. Vá em Storage > New Bucket
-- 2. Nome do Bucket: digital_products
-- 3. Public: Sim (ou configure políticas RLS para download)

-- TROUBLESHOOTING "Bucket not found":
-- * Verifique se não há espaços antes ou depois do nome 'digital_products'.
-- * Certifique-se de que marcou como "Public" no Dashboard.
-- * Tente rodar o comando SQL abaixo no seu painel "SQL Editor" para criar o bucket programaticamente:

-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('digital_products', 'digital_products', true)
-- ON CONFLICT (id) DO NOTHING;

-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('products', 'products', true)
-- ON CONFLICT (id) DO NOTHING;

-- POLÍTICAS DE ACESSO (Obrigatórias para o upload funcionar)
-- Rodar estes comandos no SQL Editor para permitir que o sistema suba arquivos:

-- 1. Permitir que o Admin (Autenticado) suba arquivos nos dois buckets
-- CREATE POLICY "Permitir upload para digital_products" ON storage.objects 
-- FOR INSERT TO authenticated WITH CHECK (bucket_id = 'digital_products');

-- CREATE POLICY "Permitir upload para products" ON storage.objects 
-- FOR INSERT TO authenticated WITH CHECK (bucket_id = 'products');

-- 2. Permitir que qualquer pessoa veja/baixe os arquivos (Público)
-- CREATE POLICY "Permitir leitura pública de digital_products" ON storage.objects 
-- FOR SELECT USING (bucket_id = 'digital_products');

-- CREATE POLICY "Permitir leitura pública de products" ON storage.objects 
-- FOR SELECT USING (bucket_id = 'products');
