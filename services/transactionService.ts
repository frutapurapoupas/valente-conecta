import { supabase } from '@/lib/supabase'

export interface Transaction {
  id: string
  from_user_id: string | null // null se for emissão do sistema (bônus)
  to_user_id: string
  amount: number
  type: 'WELCOME_BONUS' | 'PURCHASE' | 'REFERRAL' | 'COMPENSATION' | 'OFFER_UNLOCK'
  description: string
  cidade_base: string  // coluna 'cidade' no DB
  created_at: string
}

/**
 * Injeta o saldo inicial de boas-vindas (Criptomoeda Conecta)
 * Fase 1: Atração de novos usuários
 */
export async function createWelcomeBonus(userId: string, amount: number = 10, city: string): Promise<void> {
  const { error } = await supabase.from('transactions').insert({
    to_user_id: userId,
    amount: amount,
    type: 'WELCOME_BONUS',
    description: 'Bônus de boas-vindas Valente Conecta',
    cidade: city
  })

  if (error) throw new Error(`Erro ao gerar bônus: ${error.message}`)
}

/**
 * Busca o saldo total de um usuário ou empresa
 */
export async function getUserBalance(userId: string): Promise<number> {
  const { data: incoming } = await supabase
    .from('transactions')
    .select('amount')
    .eq('to_user_id', userId)

  const { data: outgoing } = await supabase
    .from('transactions')
    .select('amount')
    .eq('from_user_id', userId)

  const totalIn = incoming?.reduce((acc, curr) => acc + curr.amount, 0) || 0
  const totalOut = outgoing?.reduce((acc, curr) => acc + curr.amount, 0) || 0

  return totalIn - totalOut
}

/**
 * Realiza a transferência da Moeda Conecta para desbloqueio de contato (R$ 1,00)
 */
export async function unlockContact(userId: string, companyId: string): Promise<boolean> {
  const balance = await getUserBalance(userId)
  
  if (balance < 1) return false

  const { error } = await supabase.from('transactions').insert({
    from_user_id: userId,
    to_user_id: companyId,
    amount: 1,
    type: 'OFFER_UNLOCK',
    description: 'Desbloqueio de contato de oferta',
  })

  return !error
}

/**
 * Estatísticas para o Dashboard Admin (Fase 5 e 6)
 */
export async function getEconomyStats(): Promise<{ circulating: number; volumeMonth: number }> {
  const { data: all } = await supabase.from('transactions').select('amount, created_at')
  
  const circulating = all?.reduce((acc, curr) => acc + curr.amount, 0) || 0
  
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  
  const volumeMonth = all?.filter(t => new Date(t.created_at) >= startOfMonth)
    .reduce((acc, curr) => acc + curr.amount, 0) || 0

  return { circulating, volumeMonth }
}