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
  categoria_negocio?: string | null;
  // Dados fiscais -- preparacao pra emissao de NFC-e futura (ver
  // 091_pdv_preparacao_fiscal.sql). Ficam null ate o comerciante preencher
  // em /pdv/notas-fiscais; nao emitem nada sozinhos.
  cnpj_cpf?: string | null;
  inscricao_estadual?: string | null;
  regime_tributario?: string | null;
  crt?: number | null;
  endereco_logradouro?: string | null;
  endereco_numero?: string | null;
  endereco_complemento?: string | null;
  endereco_bairro?: string | null;
  endereco_municipio?: string | null;
  endereco_codigo_ibge?: string | null;
  endereco_uf?: string | null;
  endereco_cep?: string | null;
}

export async function obterPerfilFornecedor(usuarioId: string): Promise<PerfilFornecedorPdv | null> {
  const supabase = createClient();
  const { data } = await supabase.rpc('meu_perfil_fornecedor', { p_usuario_id: usuarioId });
  return data?.[0] || null;
}

export async function salvarCamposPerfilFornecedor(
  usuarioId: string,
  campos: Partial<{
    nomeExibicao: string; endereco: string; latitude: number; longitude: number; categoriaNegocio: string;
    cnpjCpf: string; inscricaoEstadual: string; regimeTributario: string; crt: number;
    enderecoLogradouro: string; enderecoNumero: string; enderecoComplemento: string; enderecoBairro: string;
    enderecoMunicipio: string; enderecoCodigoIbge: string; enderecoUf: string; enderecoCep: string;
  }>
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

  // Le' o perfil atual e preserva TODO campo nao enviado nesta chamada --
  // sem isso, cada tela que so' mexe num pedaco (ex: so' nome/endereco em
  // /pdv/estoque) zeraria os dados fiscais preenchidos em /pdv/notas-fiscais,
  // e vice-versa.
  const { data, error } = await supabase.rpc('salvar_perfil_fornecedor_v4', {
    p_usuario_id: usuarioId,
    p_nome_exibicao: nomeExibicao,
    p_telefone: telefone,
    p_whatsapp: perfil?.whatsapp ?? telefone,
    p_endereco: campos.endereco ?? perfil?.endereco ?? null,
    p_latitude: campos.latitude ?? perfil?.latitude ?? null,
    p_longitude: campos.longitude ?? perfil?.longitude ?? null,
    p_plano: perfil?.plano ?? 'gratis',
    p_categoria_negocio: campos.categoriaNegocio ?? perfil?.categoria_negocio ?? null,
    p_cnpj_cpf: campos.cnpjCpf ?? perfil?.cnpj_cpf ?? null,
    p_inscricao_estadual: campos.inscricaoEstadual ?? perfil?.inscricao_estadual ?? null,
    p_regime_tributario: campos.regimeTributario ?? perfil?.regime_tributario ?? null,
    p_crt: campos.crt ?? perfil?.crt ?? null,
    p_endereco_logradouro: campos.enderecoLogradouro ?? perfil?.endereco_logradouro ?? null,
    p_endereco_numero: campos.enderecoNumero ?? perfil?.endereco_numero ?? null,
    p_endereco_complemento: campos.enderecoComplemento ?? perfil?.endereco_complemento ?? null,
    p_endereco_bairro: campos.enderecoBairro ?? perfil?.endereco_bairro ?? null,
    p_endereco_municipio: campos.enderecoMunicipio ?? perfil?.endereco_municipio ?? null,
    p_endereco_codigo_ibge: campos.enderecoCodigoIbge ?? perfil?.endereco_codigo_ibge ?? null,
    p_endereco_uf: campos.enderecoUf ?? perfil?.endereco_uf ?? null,
    p_endereco_cep: campos.enderecoCep ?? perfil?.endereco_cep ?? null,
  });
  if (error) throw error;
  return data;
}
