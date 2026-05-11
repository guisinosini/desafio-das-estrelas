-- Adiciona o campo session_duration_seconds na tabela appointments
-- Esse campo armazena o tempo real de atendimento em segundos,
-- capturado pelo timer da sala virtual ao finalizar a sessão.

ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS session_duration_seconds INTEGER DEFAULT NULL;

-- Comentário na coluna
COMMENT ON COLUMN public.appointments.session_duration_seconds 
IS 'Duração real da sessão em segundos, registrada pelo timer da sala virtual ao finalizar o atendimento.';
