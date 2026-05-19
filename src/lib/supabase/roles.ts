import { type User } from '@supabase/supabase-js'

/**
 * Tipo para os cargos (roles) válidos no sistema.
 */
export type UserRole = 'admin' | 'professional' | 'patient'

/**
 * Lista canônica de e-mails com acesso de Administrador Mestre.
 * ÚNICA fonte de verdade — importar e usar em todo o sistema.
 * Nota: Gmail trata 'instituto.kamaleon@gmail.com' e 'institutokamaleon@gmail.com'
 * como o mesmo endereço, mas sistemas externos podem armazená-los diferentemente.
 */
export const MASTER_ADMIN_EMAILS: string[] = [
  'desafioestrelas@gmail.com',
];

/**
 * Verifica se um e-mail pertence a um Administrador Mestre.
 * Use esta função em vez de comparações inline hardcoded.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return MASTER_ADMIN_EMAILS.includes(email);
}

/**
 * Detecta o cargo do usuário com máxima robustez.
 * Prioridade 1: Metadados do Usuário (Auth) - Instantâneo.
 * Prioridade 2: Perfil do Banco de Dados (opcional) - Backup.
 *
 * @param user O objeto de usuário do Supabase Auth
 * @param profile Opcionalmente, o objeto de perfil vindo da tabela 'profiles'
 * @returns O cargo detectado ou 'patient' como fallback seguro.
 */
export function getUserRole(user: User | null, profile?: { role?: string } | null): UserRole {
  if (!user) return 'patient'

  const metadataRole = user.user_metadata?.role as string | undefined
  const profileRole = profile?.role
  const userEmail = user.email || ""

  // 0. REGRA DE OURO: Administradores Mestres por E-mail
  if (isAdminEmail(userEmail)) {
    return 'admin'
  }

  // 1. PRIORIDADE MÁXIMA: Se for ADMIN em qualquer lugar, é ADMIN
  if (metadataRole === 'admin' || profileRole === 'admin') {
    return 'admin'
  }

  // 2. FONTE DE VERDADE: Banco de Dados (Perfil)
  if (profileRole && ['admin', 'professional', 'patient'].includes(profileRole)) {
    return profileRole as UserRole
  }

  // 3. FALLBACK: Metadados
  if (metadataRole && ['admin', 'professional', 'patient'].includes(metadataRole)) {
    return metadataRole as UserRole
  }

  // 4. PADRÃO: Paciente
  return 'patient'
}
