// Caminho: C:\valente_conecta\lib\saude\nivelAcesso.ts
//
// Confere o nivel de acesso de um usuario numa unidade de saude (ver
// unidade_saude_equipe, 106_fila_saude.sql). Usado nas rotas que so'
// atendente/administrador podem chamar -- sem essa checagem, o "niveis de
// acesso" da proposta seria so' decorativo.

import type { SupabaseClient } from '@supabase/supabase-js';

export type NivelAcessoSaude = 'administrar' | 'atender' | 'ler' | 'imprimir';

export async function nivelDoUsuarioNaUnidade(
  supabase: SupabaseClient,
  unidadeId: string,
  usuarioId: string
): Promise<NivelAcessoSaude | null> {
  if (!unidadeId || !usuarioId) return null;
  const { data } = await supabase
    .from('unidade_saude_equipe')
    .select('nivel')
    .eq('unidade_id', unidadeId)
    .eq('usuario_id', usuarioId)
    .maybeSingle();
  return (data?.nivel as NivelAcessoSaude) || null;
}

export function podeAtender(nivel: NivelAcessoSaude | null): boolean {
  return nivel === 'administrar' || nivel === 'atender';
}
