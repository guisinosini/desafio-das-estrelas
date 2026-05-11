-- ============================================================
-- pending_payment_rules.sql
-- ⚠️  NÃO É NECESSÁRIO EXECUTAR ESTE ARQUIVO
-- A limpeza automática de agendamentos pending_payment (+24h)
-- já está implementada diretamente no código da página de
-- agendamento (booking/page.tsx) e roda sem pg_cron.
-- ============================================================

-- OPCIONAL: para limpeza MANUAL via SQL Editor do Supabase
-- Execute somente se quiser liberar slots manualmente agora:

-- DELETE FROM public.appointments
-- WHERE status = 'pending_payment'
--   AND created_at < NOW() - INTERVAL '24 hours';
