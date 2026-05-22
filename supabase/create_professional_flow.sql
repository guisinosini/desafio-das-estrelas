-- Migração: Fluxo B2B2C - Profissionais e Pais/Mentores

-- 1. Atualização da tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS specialty text,
ADD COLUMN IF NOT EXISTS council_registration text,
ADD COLUMN IF NOT EXISTS company text,
ADD COLUMN IF NOT EXISTS linked_professional_id uuid REFERENCES public.profiles(id);

-- 2. Tabela de assinaturas do profissional
CREATE TABLE IF NOT EXISTS public.professional_subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_limit integer DEFAULT 4,
    used_invites integer DEFAULT 0,
    status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending_payment')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS para professional_subscriptions
ALTER TABLE public.professional_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view their own subscriptions"
ON public.professional_subscriptions
FOR SELECT
USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can insert/update their own subscriptions"
ON public.professional_subscriptions
FOR ALL
USING (auth.uid() = professional_id);

-- 3. Tabela de convites (invites)
CREATE TABLE IF NOT EXISTS public.professional_invites (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_email text NOT NULL,
    access_code text UNIQUE NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'revoked')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    used_at timestamp with time zone
);

-- RLS para professional_invites
ALTER TABLE public.professional_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can manage their own invites"
ON public.professional_invites
FOR ALL
USING (auth.uid() = professional_id);

-- Qualquer pessoa pode verificar um código (necessário para validação no cadastro do pai sem estar logado)
CREATE POLICY "Anyone can view an invite by code"
ON public.professional_invites
FOR SELECT
USING (true);

-- 4. Função e Trigger para atualizar updated_at da subscription
CREATE OR REPLACE FUNCTION public.update_professional_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_professional_subscription_modtime ON public.professional_subscriptions;
CREATE TRIGGER update_professional_subscription_modtime
BEFORE UPDATE ON public.professional_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_professional_subscription_updated_at();
