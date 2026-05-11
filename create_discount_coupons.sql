-- ============================================================
-- TABELA: discount_coupons
-- Cupons de desconto para checkout de serviços e loja
-- ============================================================

CREATE TABLE IF NOT EXISTS public.discount_coupons (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,       -- ex: "BEMVINDO10" (case-insensitive no lookup)
  discount    NUMERIC(5,2) NOT NULL       -- percentual: 0.0 a 100.0
                CHECK (discount > 0 AND discount <= 100),
  active      BOOLEAN DEFAULT true,
  max_uses    INTEGER,                    -- NULL = ilimitado
  used_count  INTEGER DEFAULT 0,          -- contador de usos
  expires_at  TIMESTAMPTZ,               -- NULL = sem validade
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- RLS: admin tem acesso total, pacientes só leitura de cupons ativos
ALTER TABLE public.discount_coupons ENABLE ROW LEVEL SECURITY;

-- Acesso total para roles autenticadas (admin)
CREATE POLICY "Admin full access coupons"
  ON public.discount_coupons
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Comentário da tabela
COMMENT ON TABLE public.discount_coupons IS 'Cupons de desconto gerenciados pelo admin. max_uses=NULL significa ilimitado.';
