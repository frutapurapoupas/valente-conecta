// Caminho: C:\valente_conecta\lib\pdv\kodebarQuota.ts
//
// Controla a cota diária (grátis: 50 consultas/dia) da API Kodebar,
// compartilhada entre todos os lojistas (ver 064_pdv_importacao_estoque.sql).
// O incremento é atômico no banco — nunca faz SELECT e depois UPDATE aqui,
// pra não estourar a cota com chamadas concorrentes de importações
// diferentes rodando ao mesmo tempo.

import { createClient } from '@/lib/supabase/server';

const LIMITE_DIARIO_PADRAO = 50;

export async function reservarConsultaKodebar(): Promise<boolean> {
  const limite = Number(process.env.KODEBAR_LIMITE_DIARIO || LIMITE_DIARIO_PADRAO);
  const supabase = createClient();
  const { data, error } = await supabase.rpc('pdv_kodebar_incrementar_contador_v1', { p_limite: limite });
  if (error) {
    console.error('Erro ao reservar consulta Kodebar:', error);
    return false;
  }
  return Boolean(data);
}
