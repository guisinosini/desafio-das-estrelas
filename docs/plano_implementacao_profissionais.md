# Plano de Implementação: Fluxo B2B2C - Profissionais e Pais/Mentores

Este documento detalha o passo a passo para a implementação do novo fluxo onde Profissionais podem assinar planos, gerar convites e gerenciar pais/mentores e crianças, mantendo restrições de acesso adequadas.

## Fase 1: Banco de Dados (Supabase)

### 1.1 Atualização da Tabela `profiles`
Adicionar colunas para armazenar dados adicionais de usuários com a role `professional`.
*   `specialty` (text): Especialidade do profissional.
*   `council_registration` (text): Número de registro no conselho (CRM, CRP, etc.).
*   `company` (text): Nome da empresa ou clínica.
*   `linked_professional_id` (uuid): Chave estrangeira referenciando `profiles(id)`. Será usada para os pais/mentores identificarem quem os convidou.

### 1.2 Criação da Tabela `professional_subscriptions`
Gerencia os planos escolhidos pelos profissionais.
*   `id` (uuid, primary key)
*   `professional_id` (uuid, fk profiles)
*   `plan_limit` (integer): 4, 9, 14 ou 20.
*   `used_invites` (integer): Contador de convites aceitos.
*   `status` (text): 'active', 'expired', 'pending_payment'.
*   `created_at` e `updated_at` (timestamps)

### 1.3 Criação da Tabela `professional_invites`
Gerencia os convites enviados.
*   `id` (uuid, primary key)
*   `professional_id` (uuid, fk profiles)
*   `parent_email` (text)
*   `access_code` (text, único)
*   `status` (text): 'pending', 'used', 'revoked'.
*   `created_at` e `used_at` (timestamps)

### 1.4 Ajuste das Políticas de Segurança (RLS)
*   **Perfis e Convites:** Pais só podem ler convites destinados ao e-mail deles; Profissionais podem ler/editar seus próprios convites.
*   **Crianças/Pacientes:** 
    *   Pais: Podem `SELECT`, `INSERT` e `UPDATE` seus próprios dependentes. Não podem `DELETE`.
    *   Profissionais: Podem `SELECT`, `UPDATE` e `DELETE` dependentes vinculados aos pais que pertencem à sua carteira (`linked_professional_id`).

---

## Fase 2: Interface do Profissional (Frontend)

### 2.1 Cadastro e Perfil
*   Atualizar o formulário de cadastro/edição de perfil para exibir e salvar os campos de `specialty`, `council_registration` e `company` quando a role for `professional`.

### 2.2 Escolha de Plano
*   Criar tela de seleção de assinaturas (Planos: Até 4, 9, 14 ou 20 pais).
*   *Otimização futura:* Integração com Stripe/Mercado Pago para checkout automático.

### 2.3 Painel de Gestão (Dashboard do Profissional)
*   Criar view para exibir: "Convites Disponíveis: X / Y".
*   Criar formulário para gerar novo convite (inserir e-mail do pai).
*   **Ação:** Ao submeter, o sistema cria o registro em `professional_invites` e dispara a rotina de envio de e-mail.

### 2.4 Disparo de E-mail
*   Implementar Rota de API (ex: `app/api/send-invite/route.ts`) ou Edge Function para disparar o e-mail transacional contendo:
    *   Mensagem de boas-vindas do profissional.
    *   Código de acesso.
    *   *Melhoria de UX:* Link parametrizado (ex: `/cadastro?code=123&email=...`) para preenchimento automático.

---

## Fase 3: Interface do Pai/Mentor (Frontend)

### 3.1 Fluxo de Cadastro Adaptado
*   Modificar a tela de onboarding. Se o usuário estiver se cadastrando como Pai/Mentor, exibir a opção "Tenho um código de acesso".
*   Se a URL contiver os parâmetros (`?code=...`), preencher automaticamente o campo e bloqueá-lo para edição para melhorar a UX.

### 3.2 Validação e Criação
*   Ao submeter, bater o código contra a tabela `professional_invites`.
*   Se válido:
    1.  Criar usuário no Auth.
    2.  Criar registro em `profiles`, preenchendo `linked_professional_id`.
    3.  Atualizar o `professional_invites.status` para 'used'.
    4.  Atualizar `used_invites` na assinatura do profissional.
*   Redirecionar diretamente para o "Cadastro da Criança".

---

## Fase 4: Restrições de Acesso na Aplicação

### 4.1 Controle de UI para Pais
*   No painel da família/criança, verificar se o usuário é um pai vinculado (`linked_professional_id` não é nulo).
*   Se sim, ocultar:
    *   Botão "Excluir Criança" (ou botão da Lixeira).
    *   Abas/Botões de "Gerar Relatórios Oficiais".

### 4.2 Controle de UI para Profissionais
*   Criar uma área no Dashboard do Profissional listando todos os pais/pacientes vinculados a ele.
*   Permitir que o profissional acesse o perfil da criança.
*   Habilitar para o profissional os botões de "Excluir Criança" e "Gerar Relatório".

---

## Sugestões de Desempenho e UX Aplicadas

1.  **Deep Linking:** Uso de links parametrizados nos e-mails para zerar o esforço de digitação do pai, diminuindo a taxa de abandono do cadastro.
2.  **Cache de Estado:** Armazenar no contexto global (`useAuth` ou similar) se o usuário atual tem `linked_professional_id`. Isso evita queries repetitivas para checar permissões ao renderizar botões restritos.
3.  **Processamento Assíncrono:** O envio de e-mails será feito sem bloquear a interface do profissional (feedback imediato de sucesso, enquanto o e-mail sai em background).
