-- Fix: Confirmar agendamentos que estão como "scheduled" mas foram pagos
-- Execute APENAS os agendamentos que você sabe que foram pagos com sucesso.

-- 1. Ver todos os agendamentos pendentes (para revisar antes de confirmar)
SELECT 
  id,
  start_time,
  status,
  notes,
  created_at
FROM appointments
WHERE status = 'scheduled'
ORDER BY created_at DESC;

-- 2. Confirmar agendamentos pendentes dos últimos 7 dias
--    (ajuste o intervalo conforme necessário)
UPDATE appointments
SET 
  status = 'confirmed',
  notes = COALESCE(NULLIF(notes, ''), 'Pagamento confirmado manualmente')
WHERE 
  status = 'scheduled'
  AND created_at >= now() - interval '7 days';

-- 3. Verificar resultado
SELECT id, status, notes, created_at
FROM appointments
ORDER BY created_at DESC
LIMIT 10;
