import { supabase } from '@/lib/supabase'

async function notifyReceiver(_receiverId: string, _amount: number): Promise<void> {
  // TODO: integrar com pushNotification / WhatsApp
}

/**
 * Realiza a transferência de bônus entre usuários ou para prestadores
 */
export async function transferBonus(senderId: string, receiverId: string, amount: number) {
  // 1. Verifica se quem envia tem saldo suficiente
  const { data: sender } = await supabase.from('users').select('referral_balance').eq('id', senderId).single();
  
  if (!sender || sender.referral_balance < amount) {
    throw new Error("Saldo de bônus insuficiente para esta transferência.");
  }

  // 2. Executa a transferência no banco de dados
  // O saldo continua sendo marcado como 'Bônus de Indicação' para respeitar a trava de R$ 50
  await supabase.rpc('execute_bonus_transfer', {
    p_sender_id: senderId,
    p_receiver_id: receiverId,
    p_amount: amount
  });

  // 3. Notificação Instantânea (Push/WhatsApp)
  await notifyReceiver(receiverId, amount);
}