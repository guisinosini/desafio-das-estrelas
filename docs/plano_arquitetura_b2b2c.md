# Arquitetura e Modelo B2B2C - Desafio das Estrelas

## 1. Visão Geral do Modelo B2B2C
A migração para um modelo B2B2C (Business to Business to Consumer) posiciona o Desafio das Estrelas como uma **Ferramenta Terapêutica Prescrita** e não apenas um jogo de rotinas familiares.

- **B1 (Plataforma):** Desafio das Estrelas (SaaS).
- **B2 (Profissionais):** Psicólogos, terapeutas ABA, pediatras, clínicas. Eles assinam a plataforma (fonte de receita recorrente) para obter um painel clínico centralizado.
- **C (Consumidores/Famílias):** Pais, mentores e as crianças. Recebem o acesso ao aplicativo através de um "Código de Herói" fornecido pelo profissional para uso doméstico.

**Vantagens do Modelo:**
1. **Redução do Custo de Aquisição de Clientes (CAC):** O foco de marketing vai para a conversão de 1 profissional, que trará consigo dezenas de famílias.
2. **Autoridade Clínica:** O engajamento aumenta radicalmente, pois as missões fazem parte de um tratamento supervisionado.
3. **Retenção Extrema (Churn Baixo):** O profissional concentra seu fluxo de relatórios e evolução clínica na plataforma e dificilmente irá cancelar.

---

## 2. A Jornada do Usuário no Aplicativo

### A. O Cadastro
* **Profissional:** Acessa a Landing Page, seleciona o "Plano Clínico", faz o cadastro (informando e-mail, senha e registro como CRP/CRM). O banco de dados marca este perfil com `role: 'professional'`.
* **Família (Mentor):** Instala o aplicativo e clica em **"Entrar com Convite do Especialista"**. Não é necessário criar uma conta do zero usando e-mail e senha.

### B. O Cadastro das Crianças (Feito no Consultório)
* O profissional acessa o painel dele (no PC ou Tablet), clica em "Novo Paciente" e insere os dados da criança (nome, avatar, nível de dificuldade).
* O aplicativo gera um **"Cartão de Embarque Galáctico" (PDF/Imagem)** contendo um **Código de Acesso Único (ex: LUCAS-98X2)** e um QR Code.
* O profissional entrega este cartão para os pais ou envia por WhatsApp.

### C. O Login e Acesso em Casa
* Os pais abrem o app e digitam o código único do filho (`LUCAS-98X2`).
* Eles definem um PIN de 4 dígitos para bloquear a área administrativa (evitando que a criança mexa nas configurações).
* A partir daí, o app carrega o painel restrito e seguro daquela criança, sem exibir dados de faturamento ou lista de outros pacientes.

### D. Gerenciamento de Missões e Sincronização
* **Prescrição:** O profissional cadastra missões pelo painel clínico baseadas nas metas terapêuticas.
* **Execução:** A criança cumpre a missão em casa e o pai marca a tarefa como concluída no app, gerando estrelas.
* **Acompanhamento (Relatório):** Em tempo real (ou via sincronização otimizada), o painel do profissional é atualizado, criando gráficos de aderência ao tratamento que ajudam a guiar a próxima consulta.

### E. Diário de Bordo (Anotações Clínicas)
* Os pais podem registrar eventos no **Diário de Bordo** no app deles (ex: ocorrências de birra, crises).
* Esse diário alimenta a aba de anamnese do paciente dentro do dashboard do profissional.

---

## 3. Sugestões de Otimização e Desempenho (Técnicas)

1. **Agregação em Background (Edge Functions):** Como um profissional pode ter muitos pacientes, calcular totais de estrelas on-the-fly será lento. Uso de `Materialized Views` no Supabase ou de Edge Functions para somar/calcular aderências em segundo plano.
2. **PWA Offline-First para Pais:** Implementar cache agressivo (ex: LocalStorage/Zustand) para o uso diário dos pais. Eles podem ticar missões sem estarem online. Quando houver rede, o estado sincroniza com o dashboard do profissional.
3. **Isolamento de Estado (Tenant Isolation) JSONB:** Em vez de manter um único blob de JSONB enorme no profissional com todas as crianças (`patient_gamification`), a estrutura deve dividir o estado. O `patient_gamification` do pai baixa apenas o fragmento referente ao seu filho, economizando banda e garantindo segurança total (LGPD).

---

## 4. Plano Passo a Passo de Implementação (Proposta Futura)

Caso decida-se implementar esta funcionalidade, o cronograma seguirá esta ordem para não quebrar a aplicação atual:

1. **Fase 1: Estrutura de Banco de Dados:**
   - Adaptação da tabela/schema de heróis para geração do Código de Acesso Aleatório e seguro.
   - Ajustes nas políticas RLS do Supabase para leitura limitida usando o código.
2. **Fase 2: Portal Clínico do Profissional:**
   - Criação do layout `ClinicalDashboard.tsx` para gerenciar a lista de pacientes.
   - Funcionalidade de gerar e imprimir o Cartão de Embarque.
3. **Fase 3: O Fluxo de Convite B2C:**
   - Atualização da tela `AuthStage.tsx` com o fluxo "Entrar via Código de Especialista".
4. **Fase 4: Modo Restrito do Dashboard:**
   - Adaptação do `ParentDashboard.tsx` para ocultar os menus globais caso o usuário tenha logado através de um token/código.
