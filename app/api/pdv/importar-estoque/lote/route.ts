// Caminho: C:\valente_conecta\app\api\pdv\importar-estoque\lote\route.ts
//
// Processa um lote (~25 linhas) de uma importação de planilha de estoque
// pelo lojista. Cada linha vira, nessa ordem, um produto no catálogo
// colaborativo do PDV (pdv_produtos_catalogo) + um item no estoque do
// lojista (pdv_estoque_itens) + um item publicado na vitrine (catalogo_itens,
// já vinculado via catalogo_item_id) — o MESMO caminho usado pelo cadastro
// individual em /pdv/estoque, pra que produto importado por planilha também
// apareça em "Meu Estoque" e possa ser vendido no caixa físico do PDV, não
// só na vitrine pública. Nunca deixa uma linha travar as outras: erro numa
// linha vira status "erro" nela mesma, o resto do lote segue normalmente
// (ver plano em C:\Users\Usuario\.claude\plans\parallel-jumping-dragon.md).
//
// Ordem de resolução de foto por linha: catálogo colaborativo interno por
// EAN → API Kodebar (se KODEBAR_API_KEY estiver setada e a cota diária
// permitir) → placeholder fixo, marcando metadata.foto_ficticia=true pro
// lojista saber que precisa atualizar depois.
//
// Segmento do PDV: a planilha não pede segmento (só "onde publicar" na
// vitrine, um módulo mais amplo) — produto importado sempre entra no
// catálogo colaborativo como segmento "geral" (decisão: simplificação
// aceitável, o mesmo fallback que o resto do PDV já usa pra produto sem
// categoria clara).
//
// Publicação na vitrine é automática (decisão com o dono do produto), então
// esta rota exige perfil de fornecedor completo (endereço + categoria do
// negócio) ANTES de processar qualquer linha — mesma exigência que já existe
// pro botão "Publicar estoque no app" do cadastro individual
// (publicar-vitrine/route.ts). Sem isso, devolve 'perfil_incompleto' pro
// wizard pedir esses dados antes de tentar de novo.

import { NextRequest, NextResponse } from 'next/server';
import { buscarFotoPorEan } from '@/lib/pdv/kodebarService';
import { obterPerfilFornecedor } from '@/lib/pdv/perfilFornecedorPdv';
import { encontrarOuCriarProdutoCatalogo, upsertItemEstoque } from '@/lib/pdv/catalogoColaborativoService';
import { publicarItemNaVitrine } from '@/lib/pdv/publicarVitrineService';
import { TAMANHO_LOTE, type PayloadLote, type ResultadoLinha } from '@/lib/pdv/importacaoEstoqueTypes';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const maxDuration = 60;

const PLACEHOLDER_URL = '/placeholders/produto-sem-foto.svg';
const SEGMENTO_IMPORTACAO = 'geral';

export async function POST(request: NextRequest) {
  try {
    const body: PayloadLote = await request.json();
    const donoId = String(body.donoId || '').trim();
    const modulo = String(body.modulo || '').trim();
    const linhas = Array.isArray(body.linhas) ? body.linhas.slice(0, TAMANHO_LOTE) : [];

    if (!donoId) return NextResponse.json({ success: false, error: 'donoId é obrigatório' }, { status: 400 });
    if (!modulo) return NextResponse.json({ success: false, error: 'modulo é obrigatório' }, { status: 400 });
    if (!linhas.length) return NextResponse.json({ success: false, error: 'nenhuma linha para processar' }, { status: 400 });

    const perfil = await obterPerfilFornecedor(donoId);
    if (!perfil?.endereco || !perfil?.categoria_negocio) {
      return NextResponse.json({ success: false, error: 'perfil_incompleto', perfil }, { status: 409 });
    }
    const latitude = perfil?.latitude ?? null;
    const longitude = perfil?.longitude ?? null;

    const resultados: ResultadoLinha[] = [];

    for (let i = 0; i < linhas.length; i++) {
      const linha = linhas[i];
      try {
        const nome = String(linha.nome || '').trim();
        const preco = Number(linha.preco);
        if (!nome) throw new Error('Nome não informado');
        if (!Number.isFinite(preco) || preco < 0) throw new Error('Preço inválido');

        const ean = linha.ean ? String(linha.ean).trim() : '';
        const fotoEncontrada = ean ? await buscarFotoPorEan(ean) : null;
        const fotoFicticia = !fotoEncontrada;

        const { produto } = await encontrarOuCriarProdutoCatalogo({
          nome,
          segmento: SEGMENTO_IMPORTACAO,
          ean,
          fotoUrl: fotoEncontrada?.url || null,
          categoria: linha.categoria?.trim() || null,
        });

        const itemEstoque = await upsertItemEstoque({
          usuarioId: donoId,
          catalogoId: produto.id,
          quantidade: linha.quantidade ?? 0,
          precoVenda: preco,
          ativo: true,
        });

        // Reimportar uma planilha (ex.: atualizar preços do mesmo estoque)
        // cai num item que já tem catalogo_item_id de uma importação
        // anterior — nesse caso o upsert acima já atualizou preco_venda/
        // quantidade, e o trigger pdv_estoque_sincroniza_vitrine
        // (073_pdv_estoque_vitrine.sql) já reflete isso sozinho na vitrine;
        // publicar de novo criaria um item duplicado na vitrine.
        let catalogoItemId = itemEstoque.catalogo_item_id;
        if (!catalogoItemId) {
          const publicado = await publicarItemNaVitrine({
            usuarioId: donoId,
            itemEstoqueId: itemEstoque.id,
            quantidade: linha.quantidade ?? 0,
            precoVenda: preco,
            produtoNome: produto.nome,
            produtoSegmento: produto.segmento,
            produtoCategoria: linha.categoria?.trim() || produto.categoria,
            produtoFotoUrl: fotoEncontrada?.url || produto.foto_url || PLACEHOLDER_URL,
            modulo,
            latitude,
            longitude,
            metadataExtra: {
              foto_ficticia: fotoFicticia,
              foto_origem: fotoEncontrada?.origem || 'placeholder',
              importado_via: 'planilha',
              ...(ean ? { ean } : {}),
            },
          });
          catalogoItemId = publicado.catalogoItemId;
        }

        resultados.push({
          linha_index: i,
          status: 'publicado',
          item_id: catalogoItemId,
          foto_origem: fotoEncontrada?.origem || 'placeholder',
          foto_ficticia: fotoFicticia,
        });
      } catch (erroLinha: any) {
        resultados.push({ linha_index: i, status: 'erro', erro: erroLinha?.message || 'Erro ao publicar linha' });
      }
    }

    return NextResponse.json({ success: true, resultados });
  } catch (error: any) {
    console.error('Erro ao processar lote de importação:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erro ao processar lote' }, { status: 500 });
  }
}
