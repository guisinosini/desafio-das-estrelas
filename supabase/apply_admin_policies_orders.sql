-- POLÍTICAS DE ACESSO PARA ADMINISTRADORES (ORDERS & ORDER_ITEMS)

-- Permitir que administradores vejam todos os pedidos
CREATE POLICY "Admins podem ver todos os pedidos"
ON public.orders FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Permitir que administradores vejam todos os itens de pedidos
CREATE POLICY "Admins podem ver todos os itens de pedidos"
ON public.order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Permitir que administradores atualizem pedidos (ex: marcar como pago manualmente)
CREATE POLICY "Admins podem atualizar pedidos"
ON public.orders FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
