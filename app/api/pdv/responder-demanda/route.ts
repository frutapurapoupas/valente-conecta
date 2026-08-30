// Caminho: C:\valente_conecta\app\api\pdv\responder-demanda\route.ts
//
// "Quiz" de cadastro rapido do catalogo colaborativo do PDV: o fornecedor
// tira foto do codigo de barras + foto do produto, informa nome/preco/
// quantidade, e o item entra no catalogo compartilhado (pdv_produtos_catalogo)
// + no estoque dele (pdv_estoque_itens) + na vitrine publica (catalogo_itens).
// Cobre dois casos com o MESMO fluxo, sem tela separada:
//   - Produto novo na plataforma (EAN nao existe ainda em pdv_produtos_catalogo)
//   - Produto que outro fornecedor ja cadastrou (EAN ja existe) — aqui so'
//     estamos adicionando o estoque/preco DESTE fornecedor a um produto ja
//     conhecido, que e' exatamente "preencher estoque de quem ja tem catalogo
//     existente" (pedido do dono do produto).
// Se vier demandaId (fornecedor respondendo a um "avise-me" da busca
// inteligente), fecha o loop via lib/busca/atenderDemanda.ts.
//
// As fotos (produto e codigo de barras) ja chegam como URL/path: o upload em
// si acontece antes, no client, via MidiaUploader (bucket publico) e
// CapturaCodigoBarras (bucket PRIVADO catalogo-comprovantes) — essa rota so'
// grava referencia, e' rapida.
//
// A verificacao do EAN contra a base publica oficial (Kodebar, ver
// lib/pdv/kodebarService.ts) roda DEPOIS de responder ao fornecedor, via
// waitUntil (@vercel/functions) — pedido explicito do dono do produto pra
// nao travar a tela do fornecedor (que pode estar atendendo um cliente na
// hora) esperando uma chamada de rede externa e incerta.
//
// CAMPANHA DE BONUS (086_catalogo_colaborativo_bonus_moderacao.sql): produto
// GENUINAMENTE NOVO (EAN inedito ou sem EAN, ganhando SKU novo) exige foto
// do codigo de barras — ela vira "comprovante" numa fila de moderacao do
// admin master, que so' libera credito em Moeda Conecta depois de aprovar
// (dinheiro de verdade, gasto em qualquer comercio da cidade — precisa de
// humano checando antes). Reposicao de estoque de EAN ja conhecido continua
// sem exigir foto nem entra na fila — nao e' produto novo pra base.

import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { createClient } from '@/lib/supabase/server';
import { obterPerfilFornecedor } from '@/lib/pdv/perfilFornecedorPdv';
import { encontrarOuCriarProdutoCatalogo, upsertItemEstoque } from '@/lib/pdv/catalogoColaborativoService';
import { publicarItemNaVitrine } from '@/lib/pdv/publicarVitrineService';
import { buscarFotoPorEan } from '@/lib/pdv/kodebarService';
import { atenderDemanda } from '@/lib/busca/atenderDemanda';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const SEGMENTOS_VALIDOS = ['mercado', 'farmacia', 'auto_pecas', 'acougue', 'moda', 'papelaria', 'geral'];

async function verificarEanOficialEmBackground(ean: string) {
  try {
    await buscarFotoPorEan(ean);
  } catch (error) {
    console.error('Erro ao verificar EAN oficial em background:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const donoId = String(body.donoId || '').trim();
    const nome = String(body.nome || '').trim();
    const preco = Number(body.preco);
    const quantidade = Number(body.quantidade ?? 0);
    const segmento = SEGMENTOS_VALIDOS.includes(body.segmento) ? body.segmento : 'geral';
    const ean = body.ean ? String(body.ean).trim() : '';
    const demandaId = body.demandaId ? String(body.demandaId).trim() : null;

    if (!donoId) return NextResponse.json({ success: false, error: 'donoId é obrigatório' }, { status: 400 });
    if (!nome) return NextResponse.json({ success: false, error: 'Nome do produto é obrigatório' }, { status: 400 });
    if (!Number.isFinite(preco) || preco <= 0) {
      return NextResponse.json({ success: false, error: 'Preço de venda é obrigatório' }, { status: 400 });
    }

    const perfil = await obterPerfilFornecedor(donoId);
    if (!perfil?.endereco || !perfil?.categoria_negocio) {
      return NextResponse.json({ success: false, error: 'perfil_incompleto', perfil }, { status: 409 });
    }

    const supabaseCheck = createClient();
    const jaExisteNoCatalogo = ean
      ? !!(await supabaseCheck.from('pdv_produtos_catalogo').select('id').eq('ean', ean).maybeSingle()).data
      : false; // sem EAN e' sempre produto novo (ganha SKU novo)

    if (!jaExisteNoCatalogo && !body.fotoCodigoBarrasPath) {
      return NextResponse.json(
        {
          success: false,
          error: 'foto_comprovante_obrigatoria',
          message: 'Anexe uma foto do código de barras (ou da embalagem, se o produto não tiver código) para cadastrar um produto novo.',
        },
        { status: 400 }
      );
    }

    const { produto, jaExistia } = await encontrarOuCriarProdutoCatalogo({
      nome,
      segmento,
      ean: ean || null,
      fotoUrl: body.fotoProdutoUrl || null,
      categoria: body.categoria || null,
      criadoPor: donoId,
    });

    if (body.fotoCodigoBarrasPath && !produto.foto_codigo_barras_path) {
      const supabase = createClient();
      await supabase
        .from('pdv_produtos_catalogo')
        .update({ foto_codigo_barras_path: body.fotoCodigoBarrasPath, updated_at: new Date().toISOString() })
        .eq('id', produto.id)
        .is('foto_codigo_barras_path', null); // so' preenche se ninguem preencheu entre o find e agora
    }

    const itemEstoque = await upsertItemEstoque({
      usuarioId: donoId,
      catalogoId: produto.id,
      quantidade,
      precoVenda: preco,
      ativo: true,
    });

    // Produto genuinamente novo (nao restock) com comprovante anexado entra
    // na fila de moderacao do admin master — bonus em Moeda Conecta so' e'
    // liberado depois de aprovado (ver catalogo_colaborativo_aprovar_moderacao_v1).
    if (!jaExistia && body.fotoCodigoBarrasPath) {
      try {
        const supabase = createClient();
        const { data: usuarioRow } = await supabase.from('usuarios').select('cidade_base').eq('id', donoId).maybeSingle();
        await supabase.from('pdv_catalogo_colaborativo_moderacao').insert({
          produto_catalogo_id: produto.id,
          estoque_item_id: itemEstoque.id,
          usuario_id: donoId,
          cidade: (usuarioRow?.cidade_base || '').trim().toUpperCase(),
          tipo_identificador: ean ? 'ean' : 'sku_sem_ean',
          ean: ean || null,
          sku: produto.sku,
          nome_produto: produto.nome,
          foto_codigo_barras_path: body.fotoCodigoBarrasPath,
          foto_produto_url: body.fotoProdutoUrl || produto.foto_url || null,
        });
      } catch (err) {
        console.error('Erro ao registrar item na fila de moderação do catálogo colaborativo:', err);
        // fail-soft: nunca bloqueia a publicação do produto por causa disso
      }
    }

    let catalogoItemId = itemEstoque.catalogo_item_id;
    if (!catalogoItemId) {
      const publicado = await publicarItemNaVitrine({
        usuarioId: donoId,
        itemEstoqueId: itemEstoque.id,
        quantidade,
        precoVenda: preco,
        produtoNome: produto.nome,
        produtoSegmento: produto.segmento,
        produtoCategoria: body.categoria || produto.categoria,
        produtoFotoUrl: body.fotoProdutoUrl || produto.foto_url,
        latitude: perfil.latitude,
        longitude: perfil.longitude,
        metadataExtra: {
          origem_cadastro: 'responder_demanda',
          ...(ean ? { ean } : {}),
          ...(demandaId ? { demanda_id: demandaId } : {}),
        },
      });
      catalogoItemId = publicado.catalogoItemId;
    }

    if (demandaId && catalogoItemId) {
      await atenderDemanda(demandaId, catalogoItemId).catch((err) => {
        console.error('Erro ao fechar demanda a partir do PDV colaborativo:', err);
      });
    }

    if (ean) {
      waitUntil(verificarEanOficialEmBackground(ean));
    }

    return NextResponse.json({
      success: true,
      data: {
        produtoId: produto.id,
        jaExistiaNoCatalogo: jaExistia,
        itemEstoqueId: itemEstoque.id,
        catalogoItemId,
      },
    });
  } catch (error: any) {
    console.error('Erro ao responder demanda / publicar produto do PDV:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erro ao publicar produto' }, { status: 500 });
  }
}
