-- Adiciona a coluna contact_type à tabela partners_benefits
-- Valores possíveis: 'whatsapp', 'site', 'other'
ALTER TABLE public.partners_benefits ADD COLUMN IF NOT EXISTS contact_type TEXT DEFAULT 'site';
