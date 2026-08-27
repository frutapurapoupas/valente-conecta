// Caminho: C:\valente_conecta\lib\pdv\catalogoColaborativoService.ts
//
// Find-or-create de produto no catalogo colaborativo do PDV
// (pdv_produtos_catalogo, ver 038_pdv_catalogo_colaborativo.sql) e upsert do
// item de estoque de um lojista (pdv_estoque_itens) — logica compartilhada
// entre o cadastro individual (app/api/pdv/catalogo, app/api/pdv/estoque) e
// a importacao de planilha (app/api/pdv/importar-estoque/lote), pra que os
// dois caminhos alimentem o MESMO estoque em vez de dois modelos de dados
// separados.

import { createClient } from '@/lib/supabase/server';

export interface ProdutoCatalogo {
  id: string;
  ean: string | null;
  sku: string;
  nome: string;
  segmento: string;
  categoria: string | null;
  foto_url: string | null;
}

export async function encontrarOuCriarProdutoCatalogo(input: {
  nome: string;
  segmento: string;
  ean?: string | null;
  fotoUrl?: string | null;
  categoria?: string | null;
  criadoPor?: string | null;
}): Promise<{ produto: ProdutoCatalogo; jaExistia: boolean }> {
  const supabase = createClient();
  const ean = input.ean?.trim() || null;

  if (ean) {
    const { data: existente } = await supabase.from('pdv_produtos_catalogo').select('*').eq('ean', ean).maybeSingle();
    if (existente) {
      // Produto ja existe no catalogo colaborativo mas ainda nao tem foto —
      // se esta chamada trouxe uma (achada por Kodebar ou tirada agora),
      // aproveita pra completar o cadastro compartilhado.
      if (!existente.foto_url && input.fotoUrl) {
        const { data: atualizado } = await supabase
          .from('pdv_produtos_catalogo')
          .update({ foto_url: input.fotoUrl, updated_at: new Date().toISOString() })
          .eq('id', existente.id)
          .select('*')
          .single();
        return { produto: atualizado || existente, jaExistia: true };
      }
      return { produto: existente, jaExistia: true };
    }
  }

  const { data: skuGerado, error: erroSku } = await supabase.rpc('pdv_proximo_sku_v1', { p_segmento: input.segmento });
  if (erroSku) throw erroSku;

  const { data: criado, error: erroCriar } = await supabase
    .from('pdv_produtos_catalogo')
    .insert({
      ean,
      sku: skuGerado,
      nome: input.nome,
      segmento: input.segmento,
      categoria: input.categoria || null,
      foto_url: input.fotoUrl || null,
      criado_por: input.criadoPor || null,
    })
    .select('*')
    .single();

  if (erroCriar) {
    // 23505 = unique_violation no EAN — outra requisicao cadastrou o mesmo
    // EAN entre o select e este insert (corrida entre duas importacoes/
    // cadastros simultaneos). Busca de novo em vez de falhar a linha toda.
    if (ean && (erroCriar as any).code === '23505') {
      const { data: existenteAgora } = await supabase.from('pdv_produtos_catalogo').select('*').eq('ean', ean).maybeSingle();
      if (existenteAgora) return { produto: existenteAgora, jaExistia: true };
    }
    throw erroCriar;
  }

  return { produto: criado, jaExistia: false };
}

// Quando o lojista sobe (ou o admin master aprova) a foto real de um item
// que tinha sido publicado com placeholder na importação de planilha, essa
// foto tambem beneficia o catalogo colaborativo do PDV — nao so' aquele
// item na vitrine. So' sobrescreve se o produto ainda nao tem foto (nunca
// substitui uma foto real ja definida por outro lojista nesse meio tempo).
export async function sincronizarFotoNoCatalogoColaborativo(itemEstoqueId: string | undefined | null, fotoUrl: string): Promise<void> {
  if (!itemEstoqueId) return;
  const supabase = createClient();

  const { data: itemEstoque } = await supabase.from('pdv_estoque_itens').select('catalogo_id').eq('id', itemEstoqueId).maybeSingle();
  if (!itemEstoque?.catalogo_id) return;

  const { data: produto } = await supabase.from('pdv_produtos_catalogo').select('id, foto_url').eq('id', itemEstoque.catalogo_id).maybeSingle();
  if (!produto || produto.foto_url) return;

  await supabase.from('pdv_produtos_catalogo').update({ foto_url: fotoUrl, updated_at: new Date().toISOString() }).eq('id', produto.id);
}

export async function upsertItemEstoque(input: {
  usuarioId: string;
  catalogoId: string;
  quantidade: number;
  precoVenda: number;
  precoCusto?: number | null;
  estoqueMinimo?: number;
  validade?: string | null;
  variante?: string;
  ativo?: boolean;
}): Promise<{ id: string; catalogo_item_id: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('pdv_estoque_itens')
    .upsert(
      {
        usuario_id: input.usuarioId,
        catalogo_id: input.catalogoId,
        quantidade: Number(input.quantidade || 0),
        preco_custo: input.precoCusto ?? null,
        preco_venda: Number(input.precoVenda || 0),
        estoque_minimo: Number(input.estoqueMinimo || 0),
        validade: input.validade || null,
        variante: String(input.variante || '').trim(),
        ativo: input.ativo !== undefined ? !!input.ativo : true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'usuario_id,catalogo_id,variante' }
    )
    .select('id, catalogo_item_id')
    .single();
  if (error) throw error;
  return data;
}
