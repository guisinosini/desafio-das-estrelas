-- SECURITY HARDENING V5 - CORREÇÃO DE VISIBILIDADE PÚBLICA (TESTIMONIALS)

-- 1. Garante que o público anônimo (visitantes do site) tenha permissão de leitura técnica no banco de dados.
-- Isso é necessário porque o hardening anterior pode ter restringido o esquema público demais.
GRANT SELECT ON public.testimonials TO anon, authenticated;

-- 2. Reforça a política de visibilidade pública para depoimentos que estão marcados como ATIVOS.
-- Importante: A política se aplica agora a 'public' de forma explícita.
DROP POLICY IF EXISTS "Public can view active testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Everyone can see active testimonials" ON public.testimonials;

CREATE POLICY "Public can view active testimonials" 
ON public.testimonials FOR SELECT 
TO public 
USING (active = true);

-- 3. Mantém a segurança do gerenciamento apenas para ADMINS (conforme o que já temos no painel administrativo).
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
CREATE POLICY "Admins can manage testimonials" 
ON public.testimonials FOR ALL 
TO authenticated 
USING (
  exists (
    select 1 from public.profiles 
    where profiles.id = auth.uid() 
    and profiles.role = 'admin'
  )
);

-- Comentário: Correção de visibilidade de prova social concluída.
