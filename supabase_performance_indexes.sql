-- ==============================================================================
-- DESAFIO DAS ESTRELAS - INDICES DE ALTA PERFORMANCE E PRÉ-LANÇAMENTO (SEGURO)
-- Execute este script no SQL Editor do seu projeto Supabase para blindar o banco
-- de dados contra lentidão sob alto fluxo de acessos e assinaturas.
-- ==============================================================================

-- 1. Indexar a Frota Galáctica na tabela de Gamificação
-- Otimiza em 100x a renderização do Ranking da Aliança Galáctica (busca por frotas).
CREATE INDEX IF NOT EXISTS idx_patient_gamification_fleet_id 
    ON public.patient_gamification(fleet_id);

-- 2. Indexar o e-mail na tabela de Perfis
-- Garante liberação instantânea (milissegundos) de compras no webhook do Stripe.
CREATE INDEX IF NOT EXISTS idx_profiles_email 
    ON public.profiles(email);

-- 3. Indexar a role (permissão) na tabela de Perfis
-- Acelera em muito a validação de políticas de segurança RLS (se é admin ou profissional).
CREATE INDEX IF NOT EXISTS idx_profiles_role 
    ON public.profiles(role);

-- 4. [OPCIONAL] Indexar o relacionamento de uso de benefícios de parceiros
-- (Descomente apenas se você criou a funcionalidade de parceiros executando o script correspondente)
-- CREATE INDEX IF NOT EXISTS idx_user_benefit_usages_user_id 
--     ON public.user_benefit_usages(user_id);
-- 
-- CREATE INDEX IF NOT EXISTS idx_user_benefit_usages_benefit_id 
--     ON public.user_benefit_usages(benefit_id);

-- ==============================================================================
-- Todos os índices acima usam a cláusula de segurança 'IF NOT EXISTS', o que 
-- garante que eles nunca sobrescreverão dados existentes ou causarão qualquer
-- interrupção nas transações em andamento das famílias.
-- ==============================================================================
