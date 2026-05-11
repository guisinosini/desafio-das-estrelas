-- OTIMIZAÇÕES DE PERFORMANCE - ÍNDICES DE BANCO DE DADOS

-- 1. Índices para a tabela de Pedidos (Orders)
-- Acelera o carregamento do extrato e dashboards
CREATE INDEX IF NOT EXISTS idx_orders_patient_id ON public.orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 2. Índices para a tabela de Agendamentos (Appointments)
-- Acelera filtros por data e paciente no painel financeiro
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments(start_time DESC);

-- 3. Índices para Itens de Pedido (Order Items)
-- Essencial para o faturamento detalhado e joins
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- Para aplicar: Execute este script no SQL Editor do Supabase.
