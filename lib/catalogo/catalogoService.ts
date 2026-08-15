// Caminho: C:\valente_conecta\lib\catalogo\catalogoService.ts
//
// Camada de acesso a dados do marketplace, usada pelas rotas /api/catalogo/*.
// Concentra as chamadas ao Supabase (tabelas de 003_marketplace_interesse.sql)
// para que nenhuma tela precise falar com o banco diretamente — mantem a
// separacao Design/Logica exigida pelo MASTER_SPEC, secao 2.

import { createClient } from '@/lib/supabase/server';
import type {
  CatalogoItem,
  NovoCatalogoItem,
  FiltrosBusca,
  ResultadoVitrine,
  Interesse,
  PerfilFornecedor,
  HorarioDia,
} from './marketplaceTypes';

export async function listarItens(modulo?: string, donoId?: string): Promise<CatalogoItem[]> {
  const supabase = createClient();
  let query = supabase.from('catalogo_itens').select('*').neq('status', 'removido').order('created_at', { ascending: false });
  if (modulo) query = query.eq('modulo', modulo);
  if (donoId) query = query.eq('dono_id', donoId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function obterItem(id: string): Promise<CatalogoItem | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from('catalogo_itens').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function criarItem(item: NovoCatalogoItem): Promise<CatalogoItem> {
  const supabase = createClient();
  const { data, error } = await supabase.from('catalogo_itens').insert(item).select('*').single();
  if (error) throw error;
  return data;
}

export async function atualizarItem(id: string, donoId: string, patch: Partial<NovoCatalogoItem>): Promise<CatalogoItem> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('catalogo_itens')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('dono_id', donoId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function removerItem(id: string, donoId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('catalogo_itens').update({ status: 'removido' }).eq('id', id).eq('dono_id', donoId);
  if (error) throw error;
}

export async function buscarVitrine(filtros: FiltrosBusca): Promise<ResultadoVitrine[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('catalogo_busca_vitrine_v3', {
    termo: filtros.termo || null,
    modulo_filtro: filtros.modulo || null,
    categoria_filtro: filtros.categoria || null,
    lat_usuario: filtros.latUsuario ?? null,
    lng_usuario: filtros.lngUsuario ?? null,
    limite: filtros.limite ?? 30,
    offset_: filtros.offset ?? 0,
  });
  if (error) throw error;
  return data || [];
}

export async function criarInteresse(itemId: string, compradorId: string, mensagem?: string): Promise<Interesse> {
  const supabase = createClient();
  const item = await obterItem(itemId);
  if (!item) throw new Error('Item não encontrado');

  const { data: taxaComprador } = await supabase
    .from('taxas_config')
    .select('valor, ativo')
    .in('escopo', [`categoria:${item.categoria}`, `modulo:${item.modulo}`, 'global'])
    .eq('tipo', 'taxa_comprador')
    .order('escopo')
    .limit(1)
    .maybeSingle();
  const { data: taxaFornecedor } = await supabase
    .from('taxas_config')
    .select('valor, ativo')
    .in('escopo', [`categoria:${item.categoria}`, `modulo:${item.modulo}`, 'global'])
    .eq('tipo', 'taxa_fornecedor')
    .order('escopo')
    .limit(1)
    .maybeSingle();

  const compradorIsento = await temAssinaturaAtiva(compradorId);
  const fornecedorIsento = await temAssinaturaAtiva(item.dono_id);

  const { data, error } = await supabase
    .from('interesses')
    .insert({
      item_id: itemId,
      comprador_id: compradorId,
      fornecedor_id: item.dono_id,
      status_comprador: compradorIsento ? 'isento_assinatura' : taxaComprador?.ativo ? 'pendente_pagamento' : 'liberado',
      status_fornecedor: fornecedorIsento ? 'isento_assinatura' : taxaFornecedor?.ativo ? 'pendente_pagamento' : 'liberado',
      valor_taxa_comprador: taxaComprador?.ativo ? taxaComprador.valor : 0,
      valor_taxa_fornecedor: taxaFornecedor?.ativo ? taxaFornecedor.valor : 0,
      mensagem: mensagem || null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

async function temAssinaturaAtiva(usuarioId: string): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from('assinaturas_usuario')
    .select('id, valido_ate')
    .eq('usuario_id', usuarioId)
    .eq('status', 'ativa')
    .maybeSingle();
  if (!data) return false;
  if (!data.valido_ate) return true;
  return new Date(data.valido_ate) > new Date();
}

export async function listarInteresses(params: { fornecedorId?: string; compradorId?: string }): Promise<Interesse[]> {
  const supabase = createClient();
  let query = supabase.from('interesses').select('*').order('created_at', { ascending: false });
  if (params.fornecedorId) query = query.eq('fornecedor_id', params.fornecedorId);
  if (params.compradorId) query = query.eq('comprador_id', params.compradorId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function obterMeuPerfilFornecedor(usuarioId: string): Promise<PerfilFornecedor | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('meu_perfil_fornecedor', { p_usuario_id: usuarioId });
  if (error) throw error;
  return (data && data[0]) || null;
}

export async function salvarPerfilFornecedor(perfil: Omit<PerfilFornecedor, 'id' | 'created_at' | 'updated_at'>): Promise<PerfilFornecedor> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('salvar_perfil_fornecedor_v2', {
    p_usuario_id: perfil.usuario_id,
    p_nome_exibicao: perfil.nome_exibicao,
    p_telefone: perfil.telefone,
    p_whatsapp: perfil.whatsapp,
    p_endereco: perfil.endereco,
    p_latitude: perfil.latitude,
    p_longitude: perfil.longitude,
    p_plano: perfil.plano,
    p_horarios: perfil.horarios,
  });
  if (error) throw error;
  return data;
}

export async function obterContatoLiberado(interesseId: string) {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('contato_liberado_comprador', { p_interesse_id: interesseId });
  if (error) throw error;
  return (data && data[0]) || null;
}

// Horario e' publico (nao e' dado de contato) — RPC dedicada devolve so'
// isso, sem vazar telefone/endereco de perfis_fornecedor (ver migration
// 042_horario_funcionamento_fornecedor.sql).
export async function obterHorarioPublico(usuarioId: string): Promise<HorarioDia[] | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('horario_publico_fornecedor_v1', { p_usuario_id: usuarioId });
  if (error) throw error;
  return data || null;
}

export async function obterNomesFornecedoresPublico(usuarioIds: string[]): Promise<Record<string, string>> {
  if (usuarioIds.length === 0) return {};
  const supabase = createClient();
  const { data, error } = await supabase.rpc('nomes_fornecedores_publico_v1', { p_usuario_ids: usuarioIds });
  if (error) throw error;
  const mapa: Record<string, string> = {};
  for (const row of data || []) mapa[row.usuario_id] = row.nome_exibicao;
  return mapa;
}
