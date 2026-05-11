import { type User } from '@supabase/supabase-js'

/**
 * Tipo para os cargos (roles) válidos no sistema.
 */
export type UserRole = 'admin' | 'professional' | 'patient'

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
  const masterAdmins = ['instituto.kamaleon@gmail.com', 'contato@kamaleon.com.br'];
  if (masterAdmins.includes(userEmail)) {
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
