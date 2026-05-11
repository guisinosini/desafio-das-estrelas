-- ============================================================
-- SCRIPT DE LIMPEZA PRÉ-LANÇAMENTO — Instituto Kamaleon
-- ============================================================
-- OBJETIVO: Remover APENAS os dados de teste.
-- PRESERVA: admin, serviços, produtos, prova social (testimonials),
--            pílulas (wellness_tips), ferramentas (resources/tools),
--            cupons de desconto e disponibilidade de profissionais.
--
-- INSTRUÇÕES:
-- 1. Acesse o painel do Supabase em: https://app.supabase.com
-- 2. Vá em "SQL Editor" > "New query"
-- 3. Cole este script e clique em "Run"
-- 4. DEPOIS: vá em Authentication > Users e delete manualmente
--    os usuários de teste (deixe somente o admin)
-- ============================================================

BEGIN;

-- ── 1. DADOS CLÍNICOS DE PACIENTES ────────────────────────
DELETE FROM public.patient_assessments;    -- Escalas BAI/BDI e diários
DELETE FROM public.patient_tasks;          -- Tarefas atribuídas
DELETE FROM public.patient_anamnesis;      -- Anamneses
DELETE FROM public.patient_messages;       -- Mensagens internas
DELETE FROM public.prescriptions;          -- Receituários

-- ── 2. AGENDAMENTOS E PAGAMENTOS ──────────────────────────
DELETE FROM public.appointments;           -- Todos os agendamentos de teste
DELETE FROM public.payments;               -- Todos os pagamentos de teste
DELETE FROM public.orders;                 -- Pedidos da loja de teste

-- ── 3. PROFISSIONAIS ──────────────────────────────────────
-- Remove disponibilidade primeiro (FK) depois o profissional
DELETE FROM public.professional_availability;
DELETE FROM public.professionals;

-- ── 4. PACIENTES ──────────────────────────────────────────
DELETE FROM public.patients;

-- ── 5. PROFILES DE TESTE (exceto o admin) ─────────────────
-- ⚠️ ATENÇÃO: substitua o email do seu admin abaixo antes de rodar!
DELETE FROM public.profiles
WHERE role != 'admin';

-- ============================================================
-- ✅ O QUE PERMANECE INTOCADO:
-- • public.services        (serviços do instituto)
-- • public.products        (loja / produtos digitais)
-- • public.testimonials    (prova social)
-- • public.wellness_tips   (pílulas de bem-estar)
-- • public.resources       (ferramentas/materiais)
-- • public.discount_coupons (cupons BEMVINDO50, LIVRE50, FOCO50)
-- • public.profiles        (somente o admin)
-- ============================================================

COMMIT;

-- ============================================================
-- PASSO FINAL (MANUAL NO PAINEL DO SUPABASE):
-- Authentication > Users > selecione e delete os usuários de
-- teste. Deixe APENAS o usuário admin cadastrado.
-- ============================================================
