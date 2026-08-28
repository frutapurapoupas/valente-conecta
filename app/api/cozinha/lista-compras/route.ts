import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Caminho: C:\valente_conecta\app\api\cozinha\lista-compras\route.ts
//
// Fluxo completo (migration 085_lista_compras_workflow.sql):
// 1. POST cria uma REMESSA (todos os itens de um clique em "Enviar para
//    Lista de Compras", ligados por remessa_id) com status 'pendente' --
//    aparece recolhida na tela, com nome da receita + data/hora.
// 2. POST /aprovar (route.ts irmao) aprova a remessa inteira ou so' alguns
//    itens dela -- so' NESSE momento a quantidade e' arredondada pra cima
//    ate' a unidade minima vendida (ex: 25g de ovo -> 1 ovo), nunca antes.
// 3. Itens aprovados formam a lista final unica (status 'aprovado'), com
//    fornecedor e preco real editaveis (PUT).
// 4. PUT marcando comprado=true credita a quantidade comprada no estoque e
//    atualiza o preco unitario pro que foi pago de verdade.

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = createClient();
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
    const supabase = createClient();
    const body = await request.json();

    const receitaId = String(body?.receita_id ?? '');
    const receitaNome = String(body?.receita_nome ?? '');
    const itens = Array.isArray(body?.itens) ? body.itens : [];

    if (!receitaId || itens.length === 0) {
      return NextResponse.json({ success: false, error: 'receita_id e itens são obrigatórios' }, { status: 400 });
    }

    const remessaId = crypto.randomUUID();

    const payload = itens.map((item: any) => ({
      remessa_id: remessaId,
      ingrediente_id: item?.ingredienteId || null,
      origem_tipo: 'receita',
      origem_id: receitaId,
      origem_nome: receitaNome,
      ingrediente_nome: String(item?.nome ?? item?.ingrediente_nome ?? ''),
      quantidade: Number(item?.quantidadeCompra ?? item?.quantidade ?? 0),
      unidade: String(item?.unidadeCompra ?? item?.unidade ?? 'un'),
      custo_estimado: Number(item?.custo ?? item?.custo_estimado ?? 0),
      status: 'pendente',
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
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID não informado' }, { status: 400 });
    }

    const { data: atual, error: erroAtual } = await supabase
      .from('lista_compras_itens')
      .select('*')
      .eq('id', id)
      .single();

    if (erroAtual || !atual) {
      return NextResponse.json({ success: false, error: 'Item não encontrado' }, { status: 404 });
    }

    const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if ('fornecedor' in body) updatePayload.fornecedor = body.fornecedor ? String(body.fornecedor) : null;
    if ('preco_real' in body) updatePayload.preco_real = body.preco_real === null ? null : Number(body.preco_real);
    if ('comprado' in body) {
      const marcandoComprado = Boolean(body.comprado) && !atual.comprado;
      updatePayload.comprado = Boolean(body.comprado);
      updatePayload.status = body.comprado ? 'comprado' : 'aprovado';

      // So' credita no estoque na transicao pendente/aprovado -> comprado
      // (nunca de novo se ja estava comprado, senao duplicaria estoque a
      // cada PUT). Precisa de ingrediente_id (liga pro estoque) e
      // preco_real (senao nao da pra saber o preco unitario pago).
      if (marcandoComprado && atual.ingrediente_id) {
        const precoReal = 'preco_real' in body ? Number(body.preco_real) : Number(atual.preco_real);
        const quantidade = Number(atual.quantidade) || 0;

        const { data: itemEstoque } = await supabase
          .from('estoque')
          .select('id, quantidade, preco_unitario')
          .eq('id', atual.ingrediente_id)
          .maybeSingle();

        if (itemEstoque && quantidade > 0) {
          const novaQuantidade = Number(itemEstoque.quantidade || 0) + quantidade;
          const novoPrecoUnitario = precoReal > 0 ? precoReal / quantidade : Number(itemEstoque.preco_unitario || 0);
          await supabase
            .from('estoque')
            .update({
              quantidade: novaQuantidade,
              preco_unitario: novoPrecoUnitario,
              updated_at: new Date().toISOString(),
            })
            .eq('id', itemEstoque.id);
        }
      }
    }

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
    const supabase = createClient();
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
