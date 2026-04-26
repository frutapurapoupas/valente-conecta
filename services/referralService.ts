import { supabase } from '@/lib/supabase'

/**
 * ⚠️ SISTEMA DESATIVADO - USAR useIndicacoes.ts
 * 
 * Este sistema de bônus foi desativado em favor do sistema unificado
 * de bônus por módulo em hooks/useIndicacoes.ts
 * 
 * O novo sistema gerencia todas as regras de bônus de forma centralizada
 * com suporte para: ambulante, academia, profissional, servico, cidade,
 * empresa, imovel_alugar, imovel_vender, transporte_delivery
 */

export interface ReferralBonus {
  type: 'AMIGO' | 'EMPRESA' | 'PROFISSIONAL'
  amount: number // R$ 1, R$ 2, R$ 2 (editáveis pelo Admin)
}

/**
 * ⚠️ DESATIVADO - Usar hooks/useIndicacoes.ts
 * Registra a indicação e credita o saldo total "a pagar"
 */
export async function processReferral(referrerId: string, referredType: string) {
  console.warn('⚠️ processReferral está desativado. Use hooks/useIndicacoes.ts')
  return null
}

/**
 * ⚠️ DESATIVADO - Usar hooks/useIndicacoes.ts
 * Lógica de Pagamento Mensal (R$ 50/mês)
 * Executado pelo Admin Master no fechamento do mês
 */
export async function processMonthlyBonusPayout() {
  console.warn('⚠️ processMonthlyBonusPayout está desativado. Use hooks/useIndicacoes.ts')
  return null
}