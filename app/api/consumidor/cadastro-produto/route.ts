// Caminho: C:\valente_conecta\app\api\consumidor\cadastro-produto\route.ts
//
// Cadastro colaborativo de produto feito por CONSUMIDOR (comprovado por
// nota fiscal/cupom) — ver 093_cadastro_consumidor_produto.sql. POST cria a
// submissao pendente pro lojista escolhido aprovar (nao toca em
// pdv_produtos_catalogo ainda — so' a aprovacao faz isso, ver
// /api/pdv/aprovacoes-consumidor). GET lista os cadastros do proprio
// consumidor (tela "meus cadastros" no extrato).
//
// Dedup: bloqueia de verdade (409), diferente do fluxo do lojista em
// /pdv/estoque que so' sugere — aqui o objetivo e' popular o catalogo com
// itens exclusivos, entao duplicata nao pode passar.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enviarPushParaUsuario } from '@/lib/push';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const LIMIAR_SIMILARIDADE_BLOQUEIO = 0.4;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const usuarioId = String(body.usuarioId || '').trim();
    const fornecedorId = String(body.fornecedorId || '').trim();
    const nomeLojaTexto = String(body.nomeLojaTexto || '').trim();
    const nomeProduto = String(body.nomeProduto || '').trim();
    const categoria = String(body.categoria || '').trim();
    const ean = body.ean ? String(body.ean).trim() : null;
    const fotoProdutoUrl = String(body.fotoProdutoUrl || '').trim();
    const fotoNotaFiscalPath = String(body.fotoNotaFiscalPath || '').trim();
    const fotoQrcodePath = String(body.fotoQrcodePath || '').trim();
    const precoPago = body.precoPago !== undefined && body.precoPago !== null ? Number(body.precoPago) : NaN;

    if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });
    if (!fornecedorId && !nomeLojaTexto) {
      return NextResponse.json({ success: false, error: 'Informe a loja onde comprou (selecione da lista ou digite o nome)' }, { status: 400 });
    }
    if (!nomeProduto) return NextResponse.json({ success: false, error: 'Informe o nome do produto' }, { status: 400 });
    if (!categoria) return NextResponse.json({ success: false, error: 'Informe a categoria' }, { status: 400 });
    if (!fotoProdutoUrl || !fotoNotaFiscalPath || !fotoQrcodePath) {
      return NextResponse.json({ success: false, error: 'Foto da nota fiscal, foto do produto e foto do código de barras da nota são obrigatórias' }, { status: 400 });
    }
    if (!(precoPago > 0)) {
      return NextResponse.json({ success: false, error: 'Informe o preço que você pagou' }, { status: 400 });
    }

    const supabase = createClient();

    if (ean) {
      const { data: existente } = await supabase.from('pdv_produtos_catalogo').select('nome').eq('ean', ean).maybeSingle();
      if (existente) {
        return NextResponse.json({ success: false, error: 'produto_ja_existe', nomeExistente: existente.nome }, { status: 409 });
      }
    } else {
      const { data: similares } = await supabase.rpc('pdv_buscar_produto_similar_v2', { p_nome: nomeProduto, p_segmento: categoria, p_limite: 1 });
      const maisParecido = similares?.[0];
      if (maisParecido && maisParecido.similaridade > LIMIAR_SIMILARIDADE_BLOQUEIO) {
        return NextResponse.json({ success: false, error: 'produto_ja_existe', nomeExistente: maisParecido.nome }, { status: 409 });
      }
    }

    const { data: consumidor, error: erroConsumidor } = await supabase.from('usuarios').select('cidade_base').eq('id', usuarioId).maybeSingle();
    if (erroConsumidor) throw erroConsumidor;
    if (!consumidor) return NextResponse.json({ success: false, error: 'Usuário não encontrado' }, { status: 404 });

    const { data, error } = await supabase
      .from('consumidor_cadastros_produto')
      .insert({
        usuario_id: usuarioId,
        fornecedor_id: fornecedorId || null,
        nome_loja_texto: fornecedorId ? null : nomeLojaTexto,
        cidade: consumidor.cidade_base,
        nome_produto: nomeProduto,
        categoria,
        ean,
        preco_pago: precoPago,
        detalhes: body.detalhes ? String(body.detalhes).trim() : null,
        foto_produto_url: fotoProdutoUrl,
        foto_nota_fiscal_path: fotoNotaFiscalPath,
        foto_qrcode_path: fotoQrcodePath,
        qrcode_conteudo: body.qrcodeConteudo ? String(body.qrcodeConteudo) : null,
      })
      .select('*')
      .single();
    if (error) throw error;

    if (fornecedorId) {
      await enviarPushParaUsuario(fornecedorId, {
        titulo: 'Novo produto pra aprovar',
        corpo: `Um cliente cadastrou "${nomeProduto}" como comprado na sua loja. Confira e aprove.`,
        url: '/pdv/aprovacoes-consumidor',
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao cadastrar produto' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase
    .from('consumidor_cadastros_produto')
    .select('id, nome_produto, categoria, status, motivo_recusa, created_at')
    .eq('usuario_id', usuarioId)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data });
}
