// Caminho: C:\valente_conecta\lib\planoGeral.ts
//
// Helper compartilhado pelos modulos que tem uso limitado por nivel do
// Plano Geral (ver 055_plano_geral.sql). Cada rota que precisa checar cota
// chama verificarECConsumirPlanoGeral ANTES de executar a acao real — se
// permitido vier false, a rota deve recusar com 402 (Payment Required) e
// devolver o tier atual pra tela oferecer upgrade.

import { createClient } from '@/lib/supabase/server';

export type ServicoPlanoGeral = 'carona_desbloqueio' | 'fila_hospital' | 'mototaxi' | 'agua_gas' | 'academia' | 'busca_google' | 'desbloqueio_contato';

export interface ResultadoPlanoGeral {
  permitido: boolean;
  restantes: number; // -1 = sem limite
  tier: string;
}

export async function verificarECConsumirPlanoGeral(usuarioId: string, servico: ServicoPlanoGeral): Promise<ResultadoPlanoGeral> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('plano_geral_verificar_e_consumir', {
    p_usuario_id: usuarioId,
    p_servico: servico,
  });
  if (error) throw error;
  const resultado = Array.isArray(data) ? data[0] : data;
  return {
    permitido: Boolean(resultado?.permitido),
    restantes: resultado?.restantes ?? 0,
    tier: resultado?.tier || 'gratis',
  };
}
