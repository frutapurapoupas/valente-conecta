// Caminho: C:\valente_conecta\app\api\pdv\aprovacoes-consumidor\route.ts
//
// Lojista aprova/recusa cadastros de produto feitos por consumidores com
// nota fiscal (ver 093_cadastro_consumidor_produto.sql). Aprovar chama
// encontrarOuCriarProdutoCatalogo() (mesmo helper do fluxo do lojista em
// /pdv/estoque) — e' isso que faz o produto "aparecer no catalogo
// colaborativo imediatamente" pros PROXIMOS lojistas, sem reaprovacao. Em
// seguida processa o bonus em Moeda Conecta do consumidor (RPC
// consumidor_cadastro_processar_bonus_v1, idempotente por lote).
//
// As duas fotos privadas (nota fiscal, QR code) ficam no bucket
// catalogo-comprovantes — GET gera signed URL (5 min), mesmo padrao de
// /api/admin-master/pdv-catalogo-moderacao.

import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { enviarPushParaUsuario } from '@/lib/push';
import { encontrarOuCriarProdutoCatalogo } from '@/lib/pdv/catalogoColaborativoService';
import { obterValidacaoProprietario } from '@/lib/pdv/validacaoProprietario';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { data: itens, error } = await supabase
    .from('consumidor_cadastros_produto')
    .select('*')
    .eq('fornecedor_id', usuarioId)
    .eq('status', 'pendente')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const admin = createAdminClient();
  const comSignedUrl = await Promise.all(
    (itens || []).map(async (item: any) => {
      const [notaFiscal, qrcode] = await Promise.all([
        admin.storage.from('catalogo-comprovantes').createSignedUrl(item.foto_nota_fiscal_path, 300),
        admin.storage.from('catalogo-comprovantes').createSignedUrl(item.foto_qrcode_path, 300),
      ]);
      return {
        ...item,
        foto_nota_fiscal_signed_url: notaFiscal.data?.signedUrl || null,
        foto_qrcode_signed_url: qrcode.data?.signedUrl || null,
      };
    })
  );

  return NextResponse.json({ success: true, data: comSignedUrl });
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });
    const body = await request.json();
    const acao = body?.acao; // 'aprovar' | 'recusar'
    const fornecedorId = String(body?.fornecedorId || '').trim();
    if (!fornecedorId) return NextResponse.json({ success: false, error: 'fornecedorId é obrigatório' }, { status: 400 });

    const supabase = createClient();
    const { data: item, error: erroItem } = await supabase.from('consumidor_cadastros_produto').select('*').eq('id', id).maybeSingle();
    if (erroItem) throw erroItem;
    if (!item) return NextResponse.json({ success: false, error: 'Cadastro não encontrado' }, { status: 404 });
    if (item.fornecedor_id !== fornecedorId) return NextResponse.json({ success: false, error: 'Esse cadastro não é seu pra aprovar' }, { status: 403 });
    if (item.status !== 'pendente') return NextResponse.json({ success: false, error: 'Cadastro já foi processado' }, { status: 400 });

    const validacao = await obterValidacaoProprietario(fornecedorId);
    if (validacao.status !== 'aprovado') {
      return NextResponse.json({ success: false, error: 'Você precisa ter seu documento de dono/responsável validado pelo admin master antes de aprovar ou recusar cadastros' }, { status: 403 });
    }

    if (acao === 'aprovar') {
      const { produto } = await encontrarOuCriarProdutoCatalogo({
        nome: item.nome_produto,
        segmento: item.categoria,
        ean: item.ean,
        fotoUrl: item.foto_produto_url,
        criadoPor: item.usuario_id,
      });

      const { data: atualizado, error: erroUpdate } = await supabase
        .from('consumidor_cadastros_produto')
        .update({ status: 'aprovado', aprovado_por: fornecedorId, processado_em: new Date().toISOString(), produto_catalogo_id: produto.id, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();
      if (erroUpdate) throw erroUpdate;

      const { data: bonusPago } = await supabase.rpc('consumidor_cadastro_processar_bonus_v1', {
        p_usuario_id: item.usuario_id,
        p_categoria: item.categoria,
      });
      const totalBonus = (bonusPago || []).reduce((soma: number, b: any) => soma + Number(b.valor), 0);

      await enviarPushParaUsuario(item.usuario_id, {
        titulo: 'Produto aprovado!',
        corpo: totalBonus > 0
          ? `Seu cadastro de "${item.nome_produto}" foi aprovado — você ganhou R$ ${totalBonus.toFixed(2)} em Moeda Conecta!`
          : `Seu cadastro de "${item.nome_produto}" foi aprovado.`,
        url: '/extrato',
      });

      return NextResponse.json({ success: true, data: atualizado });
    }

    if (acao === 'recusar') {
      const { data: atualizado, error: erroUpdate } = await supabase
        .from('consumidor_cadastros_produto')
        .update({ status: 'recusado', aprovado_por: fornecedorId, motivo_recusa: body.motivo || null, processado_em: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();
      if (erroUpdate) throw erroUpdate;

      await enviarPushParaUsuario(item.usuario_id, {
        titulo: 'Cadastro de produto recusado',
        corpo: body.motivo ? `Seu cadastro de "${item.nome_produto}" foi recusado: ${body.motivo}` : `Seu cadastro de "${item.nome_produto}" foi recusado.`,
        url: '/extrato',
      });

      return NextResponse.json({ success: true, data: atualizado });
    }

    return NextResponse.json({ success: false, error: 'acao deve ser "aprovar" ou "recusar"' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao processar item' }, { status: 500 });
  }
}
