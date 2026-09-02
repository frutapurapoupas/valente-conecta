// Caminho: C:\valente_conecta\app\api\pdv\reivindicar-cadastro-consumidor\route.ts
//
// Cadastros de produto feitos por consumidor SEM loja identificada (a busca
// nao achou o lojista ainda -- ver 098_reivindicacao_cadastro_consumidor.sql
// e nome_loja_texto). Aqui o lojista ja' cadastrado e validado pelo admin
// master (mesmo gate de /api/pdv/aprovacoes-consumidor) reivindica esses
// itens pra si -- isso preenche fornecedor_id, e a partir dai' o item entra
// na fila normal de aprovacao dele (GET /api/pdv/aprovacoes-consumidor).
// Nao expoe as fotos privadas (nota fiscal/QR code) aqui -- so' depois de
// reivindicado e' que o lojista ve' o comprovante, na fila normal.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { obterValidacaoProprietario } from '@/lib/pdv/validacaoProprietario';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('consumidor_cadastros_produto')
    .select('id, nome_produto, categoria, nome_loja_texto, cidade, foto_produto_url, created_at')
    .is('fornecedor_id', null)
    .eq('status', 'pendente')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data });
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });
    const body = await request.json();
    const fornecedorId = String(body?.fornecedorId || '').trim();
    if (!fornecedorId) return NextResponse.json({ success: false, error: 'fornecedorId é obrigatório' }, { status: 400 });

    const validacao = await obterValidacaoProprietario(fornecedorId);
    if (validacao.status !== 'aprovado') {
      return NextResponse.json({ success: false, error: 'Você precisa ter seu documento de dono/responsável validado pelo admin master antes de reivindicar cadastros' }, { status: 403 });
    }

    const supabase = createClient();
    const { data: item, error: erroItem } = await supabase.from('consumidor_cadastros_produto').select('id, fornecedor_id, status').eq('id', id).maybeSingle();
    if (erroItem) throw erroItem;
    if (!item) return NextResponse.json({ success: false, error: 'Cadastro não encontrado' }, { status: 404 });
    if (item.fornecedor_id) return NextResponse.json({ success: false, error: 'Esse cadastro já foi reivindicado' }, { status: 400 });
    if (item.status !== 'pendente') return NextResponse.json({ success: false, error: 'Cadastro já foi processado' }, { status: 400 });

    const { data: atualizado, error: erroUpdate } = await supabase
      .from('consumidor_cadastros_produto')
      .update({ fornecedor_id: fornecedorId, reivindicado_em: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (erroUpdate) throw erroUpdate;

    return NextResponse.json({ success: true, data: atualizado });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao reivindicar cadastro' }, { status: 500 });
  }
}
