-- ============================================================
-- TABELAS: partners_benefits e user_benefit_usages
-- Gerenciamento de Benefícios e Parceiros para Profissionais e Pacientes
-- ============================================================

-- Criação da tabela de parceiros e benefícios
CREATE TABLE IF NOT EXISTS public.partners_benefits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  description TEXT NOT NULL,
  coupon_code TEXT NOT NULL,
  contact_link TEXT NOT NULL,
  image_url TEXT,
  max_uses_per_user INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.partners_benefits ENABLE ROW LEVEL SECURITY;

-- Políticas para partners_benefits
-- Admins têm acesso total
CREATE POLICY "Admin full access partners_benefits"
  ON public.partners_benefits
  FOR ALL
  USING (auth.role() = 'authenticated' AND (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  ));

-- Autenticados (pacientes e profissionais) podem visualizar benefícios ativos
CREATE POLICY "Users can view active benefits"
  ON public.partners_benefits
  FOR SELECT
  USING (auth.role() = 'authenticated' AND active = true);

-- Criação da tabela de registro de usos
CREATE TABLE IF NOT EXISTS public.user_benefit_usages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  benefit_id UUID NOT NULL REFERENCES public.partners_benefits(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.user_benefit_usages ENABLE ROW LEVEL SECURITY;

-- Políticas para user_benefit_usages
-- Admins têm acesso total
CREATE POLICY "Admin full access user_benefit_usages"
  ON public.user_benefit_usages
  FOR ALL
  USING (auth.role() = 'authenticated' AND (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  ));

-- Usuários podem ver seus próprios usos
CREATE POLICY "Users can view their own usages"
  ON public.user_benefit_usages
  FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem inserir seus próprios usos
CREATE POLICY "Users can insert their own usages"
  ON public.user_benefit_usages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Criar um bucket para as imagens de benefícios caso não exista (Isso precisa ser feito via interface ou função plpgsql se quiser via script, mas assumiremos que será feito no Dashboard do Supabase, ou podemos apenas usar o bucket público "assets" ou "products")
-- INSERT INTO storage.buckets (id, name, public) VALUES ('benefits', 'benefits', true) ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL ON TABLE public.partners_benefits TO authenticated;
GRANT ALL ON TABLE public.partners_benefits TO service_role;
GRANT ALL ON TABLE public.user_benefit_usages TO authenticated;
GRANT ALL ON TABLE public.user_benefit_usages TO service_role;
