-- TABELAS PARA O FLUXO DE COMPRAS DA LOJA

-- 1. Tabela de Pedidos
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pendente', -- pendente, pago, cancelado
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Itens do Pedido
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Políticas para Pacientes
CREATE POLICY "Pacientes podem ver seus próprios pedidos"
ON public.orders FOR SELECT
TO authenticated
USING (patient_id IN (SELECT id FROM public.patients WHERE email = (auth.jwt() ->> 'email')));

CREATE POLICY "Pacientes podem inserir seus próprios pedidos"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (patient_id IN (SELECT id FROM public.patients WHERE email = (auth.jwt() ->> 'email')));

CREATE POLICY "Pacientes podem ver itens de seus pedidos"
ON public.order_items FOR SELECT
TO authenticated
USING (order_id IN (SELECT id FROM public.orders WHERE patient_id IN (SELECT id FROM public.patients WHERE email = (auth.jwt() ->> 'email'))));

CREATE POLICY "Pacientes podem inserir itens em seus pedidos"
ON public.order_items FOR INSERT
TO authenticated
WITH CHECK (order_id IN (SELECT id FROM public.orders WHERE patient_id IN (SELECT id FROM public.patients WHERE email = (auth.jwt() ->> 'email'))));

-- Comentários
COMMENT ON TABLE public.orders IS 'Registra os pedidos realizados pelos pacientes na loja.';
COMMENT ON TABLE public.order_items IS 'Registra os itens individuais de cada pedido.';
