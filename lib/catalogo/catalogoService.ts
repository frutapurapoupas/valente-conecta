// Caminho: C:\valente_conecta\lib\catalogo\catalogoService.ts
//
// Camada de acesso a dados do marketplace, usada pelas rotas /api/catalogo/*.
// Concentra as chamadas ao Supabase (tabelas de 003_marketplace_interesse.sql)
// para que nenhuma tela precise falar com o banco diretamente — mantem a
// separacao Design/Logica exigida pelo MASTER_SPEC, secao 2.

import { createClient } from '@/lib/supabase/server';
import { calcularDistanciaMetros } from '@/utils/geo';
import { verificarECConsumirPlanoGeral } from '@/lib/planoGeral';
import { fromDbToCanonical } from '@/app/api/cozinha/receitas/canonical';
import type {
  CatalogoItem,
  NovoCatalogoItem,
  FiltrosBusca,
  ResultadoVitrine,
  Interesse,
  PerfilFornecedor,
  HorarioDia,
} from './marketplaceTypes';

function distanciaKm(lat: number | null, lng: number | null, latUsuario?: number, lngUsuario?: number): number | null {
  if (lat == null || lng == null || latUsuario == null || lngUsuario == null) return null;
  return calcularDistanciaMetros(latUsuario, lngUsuario, lat, lng) / 1000;
}

// Busca nos diretorios gratuitos (056/053/014) que a busca inteligente da
// home nunca alcancava — so' consultava catalogo_itens (o marketplace pago,
// quase vazio hoje). Sem RPC dedicada: sao 3 tabelas com schema bem
// diferente, mais simples mapear cada uma pro formato ResultadoVitrine aqui
// do que forcar todas num RPC generico so' pra isso.
export async function buscarDiretoriosLivres(filtros: FiltrosBusca): Promise<ResultadoVitrine[]> {
  const supabase = createClient();
  const termo = filtros.termo?.trim();
  if (!termo) return [];
  const padrao = `%${termo}%`;

  const [comercios, saude, aguaGas] = await Promise.all([
    supabase
      .from('comercios_diretorio')
      .select('id, modulo, categoria, nome, endereco, foto, latitude, longitude')
      .eq('status', 'publicado')
      .or(`nome.ilike.${padrao},categoria.ilike.${padrao}`)
      .limit(15),
    supabase
      .from('saude_estabelecimentos')
      .select('id, tipo, nome, endereco, foto, latitude, longitude')
      .eq('status', 'publicado')
      .or(`nome.ilike.${padrao},tipo.ilike.${padrao}`)
      .limit(15),
    supabase
      .from('agua_gas_fornecedores')
      .select('id, nome, bairro, endereco, foto, latitude, longitude')
      .eq('status', 'publicado')
      .or(`nome.ilike.${padrao},responsavel.ilike.${padrao}`)
      .limit(15),
  ]);

  const resultados: ResultadoVitrine[] = [];

  for (const c of comercios.data || []) {
    if (filtros.modulo && filtros.modulo !== c.modulo) continue;
    resultados.push({
      id: c.id,
      modulo: c.modulo,
      categoria: c.categoria,
      titulo: c.nome,
      descricao_publica: c.endereco,
      preco: null,
      midia: c.foto ? [{ tipo: 'imagem', url: c.foto, thumb_url: c.foto, ordem: 0 }] : [],
      distancia_km: distanciaKm(c.latitude, c.longitude, filtros.latUsuario, filtros.lngUsuario),
      interesses_recentes: 0,
      menor_preco_categoria: false,
      destaque_posicao: null,
      metadata: { link_externo: `/${c.modulo}?busca=${encodeURIComponent(c.nome)}` },
    });
  }

  for (const e of saude.data || []) {
    if (filtros.modulo && filtros.modulo !== 'saude') continue;
    resultados.push({
      id: e.id,
      modulo: 'saude',
      categoria: e.tipo,
      titulo: e.nome,
      descricao_publica: e.endereco,
      preco: null,
      midia: e.foto ? [{ tipo: 'imagem', url: e.foto, thumb_url: e.foto, ordem: 0 }] : [],
      distancia_km: distanciaKm(e.latitude, e.longitude, filtros.latUsuario, filtros.lngUsuario),
      interesses_recentes: 0,
      menor_preco_categoria: false,
      destaque_posicao: null,
      metadata: { link_externo: `/saude?busca=${encodeURIComponent(e.nome)}` },
    });
  }

  for (const f of aguaGas.data || []) {
    if (filtros.modulo && filtros.modulo !== 'agua-gas') continue;
    resultados.push({
      id: f.id,
      modulo: 'agua-gas',
      categoria: 'Água e Gás',
      titulo: f.nome,
      descricao_publica: f.endereco || f.bairro,
      preco: null,
      midia: f.foto ? [{ tipo: 'imagem', url: f.foto, thumb_url: f.foto, ordem: 0 }] : [],
      distancia_km: distanciaKm(f.latitude, f.longitude, filtros.latUsuario, filtros.lngUsuario),
      interesses_recentes: 0,
      menor_preco_categoria: false,
      destaque_posicao: null,
      metadata: { link_externo: '/agua-gas' },
    });
  }

  resultados.sort((a, b) => (a.distancia_km ?? Infinity) - (b.distancia_km ?? Infinity));
  return resultados;
}

// A busca inteligente da home nunca alcancava a Cozinha Chef Neide: os
// pratos dela vivem em `receitas` (RECEITA e' a fonte unica da verdade do
// modulo, ver docs/cozinha-chef-neide/00_FILOSOFIA_DO_MODULO.md), nunca
// publicados em catalogo_itens -- publicar la' duplicaria preco/imagem,
// contrariando esse principio. Por isso essa busca aqui e' uma fonte a
// parte, no mesmo espirito de buscarDiretoriosLivres acima, lendo direto de
// `receitas` sem duplicar nada.
//
// "marmita"/"quentinha" e' tratado como sinonimo de TODOS os pratos
// principais da cozinha (categoria='Prato Principal') -- e' literalmente
// o que a Chef Neide vende, mas nenhuma receita se chama "marmita" no
// nome, entao um ILIKE simples nunca acharia nada pra esse termo (pedido
// explicito do dono do projeto: quem procurar "marmita" em Valente
// precisa achar o cardapio dela).
export async function buscarCozinhaChefNeide(filtros: FiltrosBusca): Promise<ResultadoVitrine[]> {
  const supabase = createClient();
  const termo = filtros.termo?.trim();
  if (!termo) return [];

  const buscandoMarmita = /marmita|marmitex|quentinha/i.test(termo);

  let query = supabase.from('receitas').select('id, nome, categoria, imagem_url, instrucoes');
  query = buscandoMarmita
    ? query.eq('categoria', 'Prato Principal')
    : query.or(`nome.ilike.%${termo}%,categoria.ilike.%${termo}%`);

  const { data, error } = await query.limit(15);
  if (error || !data) return [];

  return data
    .map((row): ResultadoVitrine | null => {
      const canonica = fromDbToCanonical(row as any);
      if (canonica.status === 'inativo') return null;
      const midia: ResultadoVitrine['midia'] = canonica.imagem
        ? [{ tipo: 'imagem', url: canonica.imagem, thumb_url: canonica.imagem, ordem: 0 }]
        : [];
      return {
        id: canonica.id,
        modulo: 'alimentacao',
        categoria: canonica.categoria || 'Cozinha Chef Neide',
        titulo: canonica.nome,
        descricao_publica: canonica.descricao || null,
        preco: canonica.preco_venda || null,
        midia,
        distancia_km: null,
        interesses_recentes: 0,
        menor_preco_categoria: false,
        destaque_posicao: null,
        metadata: { link_externo: '/cozinha/catalogo' },
      };
    })
    .filter((item): item is ResultadoVitrine => item !== null);
}

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

  // Ja existe interesse desse comprador nesse item -- devolve o mesmo em
  // vez de criar duplicado (e consumir cota diaria de novo) a cada clique
  // em "Tenho interesse".
  const { data: existente } = await supabase
    .from('interesses')
    .select('*')
    .eq('item_id', itemId)
    .eq('comprador_id', compradorId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existente) return existente;

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

  const { statusComprador, valorTaxaComprador } = await decidirLiberacaoComprador(item, compradorId, compradorIsento);

  const { data, error } = await supabase
    .from('interesses')
    .insert({
      item_id: itemId,
      comprador_id: compradorId,
      fornecedor_id: item.dono_id,
      status_comprador: statusComprador,
      status_fornecedor: fornecedorIsento ? 'isento_assinatura' : taxaFornecedor?.ativo ? 'pendente_pagamento' : 'liberado',
      valor_taxa_comprador: valorTaxaComprador,
      valor_taxa_fornecedor: taxaFornecedor?.ativo ? taxaFornecedor.valor : 0,
      mensagem: mensagem || null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

// Fornecedor em plano pago -> contato sempre aberto (promessa ja escrita em
// /planos: "itens pagos ficam com anuncio aberto"). Fornecedor gratis (ou
// sem perfil ainda) -> comprador tem uma cota diaria gratis, reaproveitando
// o mesmo sistema ja usado por carona/mototaxi/agua-gas/academia
// (plano_geral_limites/plano_geral_uso, 055_plano_geral.sql — so' um
// servico novo, 'desbloqueio_contato', ver 076_vitrine_desbloqueio_contato.sql).
// Estourou a cota -> vira pendente de pagamento pelo valor configurado no
// admin master (unlockContactPrice), cobrado via Mercado Pago.
async function decidirLiberacaoComprador(
  item: CatalogoItem,
  compradorId: string,
  compradorIsento: boolean
): Promise<{ statusComprador: 'liberado' | 'isento_assinatura' | 'pendente_pagamento'; valorTaxaComprador: number }> {
  const supabase = createClient();

  const { data: perfis } = await supabase.rpc('meu_perfil_fornecedor', { p_usuario_id: item.dono_id });
  const planoFornecedor = perfis?.[0]?.plano;
  if (planoFornecedor && planoFornecedor !== 'gratis') {
    return { statusComprador: 'isento_assinatura', valorTaxaComprador: 0 };
  }

  if (compradorIsento) {
    return { statusComprador: 'isento_assinatura', valorTaxaComprador: 0 };
  }

  const cota = await verificarECConsumirPlanoGeral(compradorId, 'desbloqueio_contato');
  if (cota.permitido) {
    return { statusComprador: 'liberado', valorTaxaComprador: 0 };
  }

  return { statusComprador: 'pendente_pagamento', valorTaxaComprador: await obterUnlockContactPrice() };
}

async function obterUnlockContactPrice(): Promise<number> {
  const supabase = createClient();
  const { data } = await supabase.from('admin_configuracoes').select('valor').eq('chave', 'planos_config').maybeSingle();
  if (!data?.valor) return 0.5;
  try {
    const preco = Number(JSON.parse(data.valor)?.settings?.unlockContactPrice);
    return Number.isFinite(preco) && preco >= 0 ? preco : 0.5;
  } catch {
    return 0.5;
  }
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
  const { data, error } = await supabase.rpc('salvar_perfil_fornecedor_v3', {
    p_usuario_id: perfil.usuario_id,
    p_nome_exibicao: perfil.nome_exibicao,
    p_telefone: perfil.telefone,
    p_whatsapp: perfil.whatsapp,
    p_endereco: perfil.endereco,
    p_latitude: perfil.latitude,
    p_longitude: perfil.longitude,
    p_plano: perfil.plano,
    p_horarios: perfil.horarios,
    p_cnpj_cpf: perfil.cnpj_cpf,
    p_inscricao_estadual: perfil.inscricao_estadual,
    p_regime_tributario: perfil.regime_tributario,
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
