-- ============================================================
-- Tabela: email_reminder_logs
-- Objetivo: Controlar os lembretes de tarefas enviados por e-mail
--           para evitar spam (máximo 1 lembrete por tarefa por semana).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.email_reminder_logs (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id  uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  child_id    text        NOT NULL,   -- ID da criança (string gerada pelo JS no JSONB)
  task_id     text        NOT NULL,   -- ID da tarefa (string gerada pelo JS no JSONB)
  recipient   text        NOT NULL,   -- 'mentor' | 'professional'
  sent_at     timestamptz DEFAULT now() NOT NULL
);

-- Índice para consultas de deduplicação (verificar envios recentes)
CREATE INDEX IF NOT EXISTS idx_email_reminder_lookup
  ON public.email_reminder_logs (profile_id, task_id, recipient, sent_at DESC);

-- RLS: apenas service_role pode ler/escrever (acesso exclusivo via backend admin)
ALTER TABLE public.email_reminder_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_full_access" ON public.email_reminder_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.email_reminder_logs IS
  'Registra cada lembrete de tarefa enviado por e-mail. Usado para deduplicação (janela de 7 dias).';
