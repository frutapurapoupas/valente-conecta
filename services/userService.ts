import { supabase } from '@/lib/supabase'
import { createWelcomeBonus } from './transactionService'

export interface User {
  id: string
  name?: string
  email?: string
  role?: string
  status?: string
  created_at?: string
  [key: string]: unknown
}

/**
 * Busca a lista de todos os usuários (necessário para o admin/usuarios)
 */
export async function getUsers() {
  const { data, error } = await supabase
    .from('profiles') // Certifique-on de que o nome da tabela é 'profiles' ou 'users'
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Aprova um usuário pendente
 */
export async function approveUser(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ status: 'active', approved_at: new Date() })
    .eq('id', userId);

  if (error) throw error;
  return data;
}

/**
 * Bloqueia um usuário
 */
export async function blockUser(userId: string, blocked = true) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ status: blocked ? 'blocked' : 'active' })
    .eq('id', userId);

  if (error) throw error;
  return data;
}

/**
 * Esta função deve ser chamada logo após o cadastro do usuário
 * para garantir que ele já comece com saldo.
 */
export async function completeUserRegistration(userId: string, city: string): Promise<void> {
  try {
    // 1. Injeta o bônus inicial (Ex: 10 Moedas Conecta)
    await createWelcomeBonus(userId, 10, city);
    
    console.log(`Bônus de boas-vindas creditado para o usuário ${userId}`);
  } catch (error) {
    console.error("Erro ao processar bônus inicial:", error);
  }
}