import { supabase } from '@/lib/supabase'

/**
 * Define o limite global de resgate mensal (Padrão: R$ 50,00)
 */
export async function updateGlobalPayoutLimit(newAmount: number) {
  const { error } = await supabase
    .from('admin_configs')
    .update({ global_payout_limit: newAmount })
    .eq('id', 'master_config')
    
  return !error
}

/**
 * Cria uma exceção para um usuário específico
 * Pode remover a trava (null) ou definir um valor maior/menor
 */
export async function setUserPayoutException(userId: string, customLimit: number | null) {
  const { error } = await supabase
    .from('users')
    .update({ custom_payout_limit: customLimit })
    .eq('id', userId)

  return !error
}