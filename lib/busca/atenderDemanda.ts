// Caminho: C:\valente_conecta\lib\busca\atenderDemanda.ts
//
// Fecha uma demanda de busca (demandas_busca) quando um fornecedor publica
// o item que a atende, e avisa quem buscou. Extraido de
// app/api/demandas-busca/atender/route.ts pra ser reaproveitado tambem por
// app/api/pdv/responder-demanda/route.ts (fluxo do catalogo colaborativo do
// PDV), sem duplicar a logica de corrida idempotente entre fornecedores.

import { createClient } from '@/lib/supabase/server';
import { enviarPushParaUsuario } from '@/lib/push';

export async function atenderDemanda(demandaId: string, itemId: string) {
  const supabase = createClient();
  const { data: demanda, error: erroDemanda } = await supabase
    .from('demandas_busca')
    .select('*')
    .eq('id', demandaId)
    .maybeSingle();
  if (erroDemanda) throw erroDemanda;
  if (!demanda) return { success: false, error: 'Demanda não encontrada' as const };

  if (demanda.status === 'atendida') {
    return { success: true, data: demanda, jaAtendida: true };
  }

  const { data, error } = await supabase
    .from('demandas_busca')
    .update({ status: 'atendida', atendido_item_id: itemId, atendido_em: new Date().toISOString() })
    .eq('id', demandaId)
    .eq('status', 'aguardando') // evita corrida entre dois fornecedores publicando ao mesmo tempo
    .select('*')
    .maybeSingle();
  if (error) throw error;

  // Se outro fornecedor venceu a corrida entre o select e o update acima,
  // 'data' vem null aqui — nao e' erro, so' nao fomos nos que fechamos.
  if (data?.usuario_id) {
    await enviarPushParaUsuario(data.usuario_id, {
      titulo: 'Encontramos o que você procurava!',
      corpo: `"${data.termo}" já está disponível no Valente Conecta.`,
      url: `/busca?q=${encodeURIComponent(data.termo)}`,
    });
  }

  return { success: true, data: data || demanda };
}
