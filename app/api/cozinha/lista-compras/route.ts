import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Caminho: C:\valente_conecta\app\api\cozinha\lista-compras\route.ts
//
// Faltava essa rota inteira -- o botao "Enviar para Lista de Compras" na
// tela de receita (ReceitaFormularioCanonico.tsx) ja chamava
// POST /api/cozinha/lista-compras desde que foi criado, mas a rota nunca
// existiu, entao todo clique batia num 404 e caia direto no
// "Erro ao gerar lista de compras." (achado ao vivo: fetch contra rota
// inexistente).
//
// Grava em lista_compras_itens (tabela que ja existia no banco, criada por
// fora de migration, com o schema exato pra isso -- origem_tipo/origem_id/
// origem_nome/ingrediente_nome/quantidade/unidade/custo_estimado/comprado --
// so' que nada lia ou escrevia nela ainda). GET tambem devolvido aqui pra
// alimentar a tela /admin-master/cozinha-chef/compras (useCompras.ts),
// que antes lia de uma tabela "compras" sempre vazia -- sem essa ligacao,
// o botao ate' "funcionaria" mas o item enviado sumiria sem aparecer em
// lugar nenhum.
//
// createAdminClient (service role) em vez do client comum: diferente das
// outras tabelas da cozinha (estoque/receitas/cardapio), lista_compras_itens
// tem RLS habilitado sem policy nenhuma pra escrita anonima (confirmado ao
// vivo -- insert com a chave anon batia "42501 new row violates row-level
// security policy"). Mesma excecao ja documentada em lib/supabase/server.ts
// pra usuarios, aplicada aqui pelo mesmo motivo.

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('lista_compras_itens')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Erro ao buscar lista de compras:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar lista de compras' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    const receitaId = String(body?.receita_id ?? '');
    const receitaNome = String(body?.receita_nome ?? '');
    const itens = Array.isArray(body?.itens) ? body.itens : [];

    if (!receitaId || itens.length === 0) {
      return NextResponse.json({ success: false, error: 'receita_id e itens são obrigatórios' }, { status: 400 });
    }

    const payload = itens.map((item: any) => ({
      origem_tipo: 'receita',
      origem_id: receitaId,
      origem_nome: receitaNome,
      ingrediente_nome: String(item?.nome ?? item?.ingrediente_nome ?? ''),
      quantidade: Number(item?.quantidadeCompra ?? item?.quantidade ?? 0),
      unidade: String(item?.unidadeCompra ?? item?.unidade ?? 'un'),
      custo_estimado: Number(item?.custo ?? item?.custo_estimado ?? 0),
      comprado: false,
    }));

    const { data, error } = await supabase.from('lista_compras_itens').insert(payload).select();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao gerar lista de compras:', error);
    return NextResponse.json({ success: false, error: 'Erro ao gerar lista de compras' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID não informado' }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if ('comprado' in body) updatePayload.comprado = Boolean(body.comprado);

    const { data, error } = await supabase
      .from('lista_compras_itens')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao atualizar item da lista de compras:', error);
    return NextResponse.json({ success: false, error: 'Erro ao atualizar item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID não informado' }, { status: 400 });
    }

    const { error } = await supabase.from('lista_compras_itens').delete().eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir item da lista de compras:', error);
    return NextResponse.json({ success: false, error: 'Erro ao excluir item' }, { status: 500 });
  }
}
