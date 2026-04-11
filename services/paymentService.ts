import { supabase } from '@/lib/supabase'

/**
 * Realiza o pagamento de um produto usando saldo de bônus
 */
export async function payWithBonus(senderId: string, merchantId: string, amount: number) {
  // 1. Verifica se o usuário tem saldo de bônus suficiente
  const { data: user } = await supabase.from('users').select('referral_balance').eq('id', senderId).single();
  
  if (!user || user.referral_balance < amount) {
    throw new Error("Saldo de bônus insuficiente.");
  }

  // 2. Transfere o saldo do usuário para o 'crédito de resgate' do lojista
  // O lojista recebe esse valor como "Saldo a Resgatar"
  await supabase.rpc('transfer_bonus_to_merchant', {
    p_sender_id: senderId,
    p_merchant_id: merchantId,
    p_amount: amount
  });

  return { success: true, message: "Pagamento realizado com bônus!" };
}