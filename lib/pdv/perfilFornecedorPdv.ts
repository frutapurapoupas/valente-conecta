// Caminho: C:\valente_conecta\lib\pdv\perfilFornecedorPdv.ts
//
// Ponte entre o PDV e perfis_fornecedor (003_marketplace_interesse.sql) —
// a tabela que TODOS os módulos do marketplace usam pra guardar nome de
// exibição/telefone/endereço/localização da loja. O PDV não tem cadastro
// próprio pra isso: reaproveita esse perfil em vez de duplicar campo.
// Usado tanto pela captura de localização (lib/pdv/solicitarLocalizacao.ts)
// quanto pelo formulário de completar perfil antes de publicar no app
// (app/pdv/estoque/page.tsx).

import { createClient } from '@/lib/supabase/server';

export interface PerfilFornecedorPdv {
  nome_exibicao: string;
  telefone: string;
  whatsapp: string | null;
  endereco: string | null;
  latitude: number | null;
  longitude: number | null;
  plano: string;
}

export async function obterPerfilFornecedor(usuarioId: string): Promise<PerfilFornecedorPdv | null> {
  const supabase = createClient();
  const { data } = await supabase.rpc('meu_perfil_fornecedor', { p_usuario_id: usuarioId });
  return data?.[0] || null;
}

export async function salvarCamposPerfilFornecedor(
  usuarioId: string,
  campos: Partial<{ nomeExibicao: string; endereco: string; latitude: number; longitude: number }>
): Promise<PerfilFornecedorPdv> {
  const supabase = createClient();
  const perfil = await obterPerfilFornecedor(usuarioId);

  let nomeExibicao = campos.nomeExibicao ?? perfil?.nome_exibicao;
  let telefone = perfil?.telefone;
  if (!nomeExibicao || !telefone) {
    const { data: usuario } = await supabase.from('usuarios').select('nome, whatsapp').eq('id', usuarioId).maybeSingle();
    nomeExibicao = nomeExibicao || usuario?.nome || 'Loja';
    telefone = telefone || usuario?.whatsapp || '';
  }

  const { data, error } = await supabase.rpc('salvar_perfil_fornecedor_v3', {
    p_usuario_id: usuarioId,
    p_nome_exibicao: nomeExibicao,
    p_telefone: telefone,
    p_whatsapp: perfil?.whatsapp ?? telefone,
    p_endereco: campos.endereco ?? perfil?.endereco ?? null,
    p_latitude: campos.latitude ?? perfil?.latitude ?? null,
    p_longitude: campos.longitude ?? perfil?.longitude ?? null,
    p_plano: perfil?.plano ?? 'gratis',
  });
  if (error) throw error;
  return data;
}
