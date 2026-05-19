/**
 * Constantes compartilhadas em todo o app.
 * Importar daqui em vez de definir localmente em cada arquivo.
 */

/**
 * Set de Price IDs do Stripe que correspondem ao plano ANUAL.
 * Atualizar aqui ao adicionar novos planos anuais — reflete em todo o sistema.
 */
export const YEARLY_PRICE_IDS = new Set([
  'price_1TXjo1Pc1qFQfvf50bPNi3i7', // BRL Anual
  'price_1TXjv3Pc1qFQfvf5wps2BmFU', // USD Anual
  'price_1TXjw5Pc1qFQfvf5cfszDbqI', // EUR Anual
  'price_1TXjy3Pc1qFQfvf5pCgaPX8Q', // CNY Anual
]);

/**
 * Mapeamento de código de idioma para bandeira emoji.
 * Importar daqui em vez de duplicar blocos ternários em múltiplos componentes.
 */
export const LANGUAGE_FLAGS: Record<string, string> = {
  'pt-BR': '🇧🇷',
  'pt-PT': '🇵🇹',
  'en':    '🇺🇸',
  'es':    '🇪🇸',
  'fr':    '🇫🇷',
  'it':    '🇮🇹',
  'zh':    '🇨🇳',
};

/**
 * Nome de exibição por código de idioma.
 */
export const LANGUAGE_NAMES: Record<string, string> = {
  'pt-BR': 'Português (BR)',
  'pt-PT': 'Português (PT)',
  'en':    'English',
  'es':    'Español',
  'fr':    'Français',
  'it':    'Italiano',
  'zh':    '中文',
};

/** Lista de todos os idiomas suportados pelo app */
export const SUPPORTED_LANGUAGES = Object.keys(LANGUAGE_FLAGS);
