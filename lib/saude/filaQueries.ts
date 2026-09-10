// Caminho: C:\valente_conecta\lib\saude\filaQueries.ts
//
// Query compartilhada da fila ordenada por prioridade legal (tier 1 antes
// de tier 2 antes de tier 3, e dentro do mesmo tier por ordem de chegada)
// -- usada tanto no painel do atendente quanto em "minha posição" do
// paciente. Nunca ordenar so' por created_at.

import type { SupabaseClient } from '@supabase/supabase-js';

// So' entra na fila do dia quem nao tem agendamento eletivo (data_agendada
// nula, ou seja, entrou pelo caminho normal) ou cujo agendamento e' HOJE
// (ver 109_fila_saude_agendamento_pagamento.sql) -- um agendamento pra
// daqui a 3 dias nao pode aparecer na fila de hoje.
export async function buscarFilaOrdenada(supabase: SupabaseClient, unidadeId: string, statuses: string[]) {
  const hoje = new Date().toISOString().slice(0, 10);
  // fila_saude_senhas tem duas FKs pra usuarios (usuario_id = paciente,
  // registrado_por = quem lancou o walk-in) -- sem "!usuario_id" o
  // PostgREST nao sabe qual usar e da erro de embed ambiguo assim que os
  // dois tipos de senha coexistem na mesma unidade.
  const { data, error } = await supabase
    .from('fila_saude_senhas')
    .select('*, usuarios!usuario_id(nome, whatsapp)')
    .eq('unidade_id', unidadeId)
    .in('status', statuses)
    .or(`data_agendada.is.null,data_agendada.eq.${hoje}`)
    .order('prioridade_tier', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}
