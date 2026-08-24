// Caminho: C:\valente_conecta\app\api\pdv\estoque\publicar-vitrine\route.ts
//
// Publica em lote o estoque do PDV (pdv_estoque_itens) na vitrine pública
// do app (catalogo_itens) — decisão com o dono do produto: publica tudo de
// uma vez (não item a item), e a partir daí fica sincronizado sozinho via
// trigger (pdv_sincronizar_vitrine_trigger, 073_pdv_estoque_vitrine.sql).
// Essa rota só cuida da publicação INICIAL: itens que já têm catalogo_item_id
// são pulados (já estão publicados e o trigger já cuida deles).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { moduloVitrineParaSegmento } from '@/lib/pdv/segmentoParaModuloVitrine';
import { obterPerfilFornecedor } from '@/lib/pdv/perfilFornecedorPdv';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function emLotes<T, R>(itens: T[], tamanhoLote: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const resultados: R[] = [];
  for (let i = 0; i < itens.length; i += tamanhoLote) {
    const lote = itens.slice(i, i + tamanhoLote);
    resultados.push(...(await Promise.all(lote.map(fn))));
  }
  return resultados;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const usuarioId = String(body.usuarioId || '').trim();
    if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

    const supabase = createClient();

    // A vitrine carrega os dados da loja (nome de exibição, endereço) ANTES
    // de publicar -- se o fornecedor ainda não completou esse perfil (a
    // maioria de quem só usa o PDV nunca passou pela tela de "meu perfil"
    // dos outros módulos), pede pra completar em vez de publicar com um
    // nome genérico. Front mostra o formulário quando vê esse erro.
    const perfil = await obterPerfilFornecedor(usuarioId);
    if (!perfil?.endereco || !perfil?.categoria_negocio) {
      return NextResponse.json({ success: false, error: 'perfil_incompleto', perfil }, { status: 409 });
    }
    const latitude = perfil?.latitude ?? null;
    const longitude = perfil?.longitude ?? null;

    const { data: itens, error: erroItens } = await supabase
      .from('pdv_estoque_itens')
      .select('id, quantidade, preco_venda, ativo, variante, catalogo_item_id, produto:pdv_produtos_catalogo(nome, segmento, categoria, foto_url)')
      .eq('usuario_id', usuarioId)
      .eq('ativo', true);
    if (erroItens) throw erroItens;

    const pendentes = (itens || []).filter((i: any) => !i.catalogo_item_id);
    if (pendentes.length === 0) {
      return NextResponse.json({ success: true, publicados: 0, jaPublicados: (itens || []).length, categoriaNegocio: perfil.categoria_negocio });
    }

    let publicados = 0;
    let comErro = 0;

    await emLotes(pendentes, 10, async (item: any) => {
      const produto = item.produto;
      if (!produto) { comErro++; return; }
      try {
        const { data: novoItem, error: erroCriar } = await supabase
          .from('catalogo_itens')
          .insert({
            dono_id: usuarioId,
            modulo: moduloVitrineParaSegmento(produto.segmento),
            categoria: produto.categoria || 'Outros',
            titulo: item.variante ? `${produto.nome} (${item.variante})` : produto.nome,
            descricao_publica: null,
            preco: Number(item.preco_venda) || 0,
            midia: produto.foto_url ? [{ tipo: 'imagem', url: produto.foto_url, thumb_url: produto.foto_url, ordem: 0 }] : [],
            latitude,
            longitude,
            status: Number(item.quantidade) > 0 ? 'ativo' : 'pausado',
            metadata: { origem: 'pdv_estoque', pdv_estoque_id: item.id },
          })
          .select('id')
          .single();
        if (erroCriar) throw erroCriar;

        const { error: erroVinculo } = await supabase
          .from('pdv_estoque_itens')
          .update({ catalogo_item_id: novoItem.id })
          .eq('id', item.id);
        if (erroVinculo) throw erroVinculo;

        publicados++;
      } catch (err) {
        console.error('Erro ao publicar item na vitrine:', item.id, err);
        comErro++;
      }
    });

    return NextResponse.json({
      success: true,
      publicados,
      jaPublicados: (itens || []).length - pendentes.length,
      comErro,
      categoriaNegocio: perfil.categoria_negocio,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao publicar estoque na vitrine' }, { status: 500 });
  }
}
