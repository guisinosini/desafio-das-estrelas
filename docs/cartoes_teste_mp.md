# Cartões de Teste - Mercado Pago

Estes são os cartões de teste oficiais do Mercado Pago para você utilizar no seu ambiente de desenvolvimento ou staging (usando chaves `TEST-`).

**Importante:** Para que o pagamento seja processado como teste, o e-mail inserido durante o processo deve ser um e-mail de teste (ex: `test@testuser.com` ou o seu próprio e-mail se já não for uma conta vendedora) e a chave pública/privada devem ter o prefixo `TEST-`.

---

## Números de Cartões Locais (Brasil)

### Crédito
| Bandeira | Número do Cartão | Vencimento | CVV |
| :--- | :--- | :--- | :--- |
| **Mastercard** | `5031 4332 1540 6351` | `11/30` | `123` |
| **Visa** | `4235 6477 2802 5682` | `11/30` | `123` |
| **American Express** | `3753 651535 56885` | `11/30` | `1234` |

### Débito
| Bandeira | Número do Cartão | Vencimento | CVV |
| :--- | :--- | :--- | :--- |
| **Elo** | `5067 7667 8388 8311` | `11/30` | `123` |

*(A data de vencimento pode ser qualquer data futura válida, ex: 12/28)*

---

## Como simular diferentes status de pagamento (APROVADO, RECUSADO, etc.)

No Mercado Pago, o status da transação não é definido apenas pelo número do cartão, mas **pelo nome do titular** que você digita no formulário do Checkout Transparente.

Ao preencher o campo "Nome impresso no cartão" (Cardholder Name), utilize um dos prefixos abaixo seguido do seu nome, ou apenas o prefixo:

| Prefixo no Nome | Status Simulado | Descrição |
| :--- | :--- | :--- |
| **`APRO`** | **Aprovado** (approved) | Pagamento confirmado com sucesso. Ex: `APRO Joao Silva` |
| **`CONT`** | **Pendente** (in_process) | Pagamento em análise manual de risco. |
| **`OTHE`** | **Recusado** (rejected) | Recusado por erro geral ou outra falha. |
| **`FUND`** | **Recusado** (rejected) | Recusado por saldo/limite insuficiente. |
| **`SECU`** | **Recusado** (rejected) | Recusado por código de segurança (CVV) inválido. |
| **`EXPI`** | **Recusado** (rejected) | Recusado por problema com a data de vencimento. |

---

### Links Úteis
* [Documentação Oficial MP - Cartões de Teste](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-test/test-cards)
* Lembre-se: Após terminar os testes em localhost, sempre altere no painel da Vercel as variáveis para `APP_USR-` para processar pagamentos reais em Produção!
