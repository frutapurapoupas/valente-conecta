// Caminho: C:\valente_conecta\lib\pdv\publicarVitrineService.ts
//
// Publica UM item de estoque do PDV (pdv_estoque_itens) na vitrine publica
// do app (catalogo_itens) e vincula catalogo_item_id de volta — logica
// compartilhada entre a publicacao manual em lote de
// app/api/pdv/estoque/publicar-vitrine e a publicacao automatica da
// importacao de planilha (app/api/pdv/importar-estoque/lote), pra que os
// dois caminhos gerem exatamente o mesmo formato de item na vitrine.

import { createClient } from '@/lib/supabase/server';
import { moduloVitrineParaSegmento } from './segmentoParaModuloVitrine';

export async function publicarItemNaVitrine(params: {
  usuarioId: string;
  itemEstoqueId: string;
  quantidade: number;
  precoVenda: number;
  variante?: string;
  produtoNome: string;
  produtoSegmento: string;
  produtoCategoria: string | null;
  produtoFotoUrl: string | null;
  modulo?: string; // quando informado (importacao em planilha, onde o lojista escolhe o modulo na tela), tem prioridade sobre o mapeamento por segmento
  latitude: number | null;
  longitude: number | null;
  metadataExtra?: Record<string, any>;
}): Promise<{ catalogoItemId: string }> {
  const supabase = createClient();

  const { data: novoItem, error: erroCriar } = await supabase
    .from('catalogo_itens')
    .insert({
      dono_id: params.usuarioId,
      modulo: params.modulo || moduloVitrineParaSegmento(params.produtoSegmento),
      categoria: params.produtoCategoria || 'Outros',
      titulo: params.variante ? `${params.produtoNome} (${params.variante})` : params.produtoNome,
      descricao_publica: null,
      preco: Number(params.precoVenda) || 0,
      midia: params.produtoFotoUrl ? [{ tipo: 'imagem', url: params.produtoFotoUrl, thumb_url: params.produtoFotoUrl, ordem: 0 }] : [],
      latitude: params.latitude,
      longitude: params.longitude,
      status: Number(params.quantidade) > 0 ? 'ativo' : 'pausado',
      metadata: { origem: 'pdv_estoque', pdv_estoque_id: params.itemEstoqueId, ...(params.metadataExtra || {}) },
    })
    .select('id')
    .single();
  if (erroCriar) throw erroCriar;

  const { error: erroVinculo } = await supabase
    .from('pdv_estoque_itens')
    .update({ catalogo_item_id: novoItem.id })
    .eq('id', params.itemEstoqueId);
  if (erroVinculo) throw erroVinculo;

  return { catalogoItemId: novoItem.id };
}
