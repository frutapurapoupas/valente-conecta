// Caminho: C:\valente_conecta\lib\pdv\validacaoProprietario.ts
//
// Status de validacao de dono/responsavel da loja (documento comprobatorio,
// ver 094_validacao_proprietario_loja.sql) -- gate obrigatorio antes do
// lojista poder aprovar cadastros de produto feitos por consumidores (ver
// app/api/pdv/aprovacoes-consumidor/route.ts). Consulta direto
// perfis_fornecedor em vez de estender a RPC meu_perfil_fornecedor (usada
// em muitos lugares) pra manter o raio de mudanca pequeno.
//
// Usa createAdminClient: perfis_fornecedor de proposito NAO tem policy de
// select publica (telefone/whatsapp sao dados de contato protegidos, ver
// 003_marketplace_interesse.sql) -- com createClient (chave anon) o select
// sempre voltava vazio e o gate ficava preso em "nao_enviado" pra sempre.

import { createAdminClient } from '@/lib/supabase/server';

export interface StatusValidacaoProprietario {
  status: 'nao_enviado' | 'pendente' | 'aprovado' | 'recusado';
  motivoRecusa: string | null;
}

export async function obterValidacaoProprietario(usuarioId: string): Promise<StatusValidacaoProprietario> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('perfis_fornecedor')
    .select('validacao_status, validacao_motivo_recusa')
    .eq('usuario_id', usuarioId)
    .maybeSingle();

  return {
    status: (data?.validacao_status as StatusValidacaoProprietario['status']) || 'nao_enviado',
    motivoRecusa: data?.validacao_motivo_recusa || null,
  };
}
