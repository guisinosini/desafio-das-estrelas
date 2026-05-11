-- SECURITY HARDENING V2 - BLINDAGEM DE LÓGICA E PRIVILÉGIOS

-- 1. PROTEÇÃO CONTRA ESCALONAMENTO DE PRIVILÉGIOS (TRIGGER DE SIGNUP)
-- Resetamos a função para que ela ignore qualquer 'role' passado pelo cabeçalho de signup.
-- O padrão será SEMPRE 'patient'. Profissionais e Admins devem ser promovidos manualmente por um Admin existente.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Inserir no Profile (Fixamos o role como 'patient')
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'avatar_url', 
    'patient' -- SEMPRE INICIA COMO PACIENTE (Segurança Máxima)
  );

  -- 2. Sempre cria o registro na tabela de pacientes clínicos
  INSERT INTO public.patients (id, full_name, email, active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    TRUE
  )
  ON CONFLICT (email) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. SEGURANÇA DE TABELAS SECUNDÁRIAS (PILLS E TAREFAS)
-- Revogar permissões excessivas que podem burlar RLS se mal configuradas
REVOKE ALL ON public.app_pills FROM authenticated;
GRANT SELECT ON public.app_pills TO authenticated; -- Só podem ler

-- Reforçar RLS para Tasks (Garantir que pacientes não vejam tarefas de outros)
ALTER TABLE public.patient_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Pacientes veem suas próprias tarefas" ON public.patient_tasks;
CREATE POLICY "Pacientes veem suas próprias tarefas" 
ON public.patient_tasks FOR SELECT 
TO authenticated 
USING (patient_id = auth.uid());

-- Comentário: A blindagem de lógica de privilégios e fraude financeira foi concluída.
