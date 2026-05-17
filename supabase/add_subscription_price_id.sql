-- Executar no SQL Editor do Supabase
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_price_id TEXT;
