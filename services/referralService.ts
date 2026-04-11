import { supabase } from '@/lib/supabase'

export interface ReferralBonus {
  type: 'AMIGO' | 'EMPRESA' | 'PROFISSIONAL'
  amount: number // R$ 1, R$ 2, R$ 2 (editáveis pelo Admin)
}

/**
 * Registra a indicação e credita o saldo total "a pagar"
 */
export async function processReferral(referrerId: string, referredType: string) {
  // Busca valores configurados pelo Admin Master
  const { data: config } = await supabase.from('admin_configs').select('referral_rates').single()
  const bonus = config?.referral_rates?.[referredType]

  // Adiciona ao saldo de bônus acumulado do usuário
  await supabase.rpc('increment_referral_balance', { 
    user_id: referrerId, 
    inc_amount: bonus 
  })
}

/**
 * Lógica de Pagamento Mensal (R$ 50/mês)
 * Executado pelo Admin Master no fechamento do mês
 */
export async function processMonthlyBonusPayout() {
  // Busca todos os usuários com saldo de bônus > 0
  const { data: usersWithBonus } = await supabase
    .from('users')
    .select('id, referral_balance')
    .gt('referral_balance', 0)

  for (const user of (usersWithBonus ?? [])) {
    const payoutAmount = Math.min(user.referral_balance, 50) // Máximo de R$ 50/mês
    
    // Transfere para a carteira ativa e subtrai do saldo de bônus
    await supabase.rpc('execute_bonus_release', {
      user_id: user.id,
      release_amount: payoutAmount
    })
  }
}