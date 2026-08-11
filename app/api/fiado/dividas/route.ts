// Caminho: C:\valente_conecta\app\api\fiado\dividas\route.ts
//
// Lançar um débito de fiado. Ao criar, dispara push pro cliente (se ele
// tiver usuario+inscrição de push resolvidos) com total da compra, saldo
// devedor e data de vencimento — pedido explícito do usuário do projeto.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enviarPushParaUsuario } from '@/lib/push';

function formatarData(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const donoId = searchParams.get('donoId');
  const clienteId = searchParams.get('clienteId');
  if (!donoId) return NextResponse.json({ success: false, error: 'donoId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  let query = supabase.from('fiado_dividas').select('*, fiado_clientes(nome, telefone)').eq('dono_id', donoId).order('created_at', { ascending: false });
  if (clienteId) query = query.eq('cliente_id', clienteId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.donoId || !body.clienteId || !body.valorTotal || !body.dataVencimento) {
      return NextResponse.json({ success: false, error: 'donoId, clienteId, valorTotal e dataVencimento são obrigatórios' }, { status: 400 });
    }
    const supabase = createClient();

    const { data: divida, error } = await supabase
      .from('fiado_dividas')
      .insert({
        dono_id: body.donoId,
        cliente_id: body.clienteId,
        valor_total: Number(body.valorTotal),
        data_vencimento: body.dataVencimento,
        itens: Array.isArray(body.itens) ? body.itens : [],
        observacoes: body.observacoes || null,
      })
      .select('*, fiado_clientes(nome, telefone, cliente_usuario_id)')
      .single();
    if (error) throw error;

    const cliente = (divida as any).fiado_clientes;
    if (cliente?.cliente_usuario_id) {
      try {
        await enviarPushParaUsuario(cliente.cliente_usuario_id, {
          titulo: `Nova conta fiado — ${body.lojaNome || 'Valente Conecta'}`,
          corpo: `Total: R$ ${Number(body.valorTotal).toFixed(2)} · Saldo: R$ ${Number(body.valorTotal).toFixed(2)} · Vencimento: ${formatarData(body.dataVencimento)}`,
          url: '/pdv/fiado',
        });
      } catch {
        // push e' best-effort, nao bloqueia o lancamento do debito
      }
    }

    return NextResponse.json({ success: true, data: divida });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao lançar débito' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });
    const body = await request.json();

    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    if (body.status !== undefined) patch.status = body.status;
    if (body.observacoes !== undefined) patch.observacoes = body.observacoes;

    const supabase = createClient();
    const { data, error } = await supabase.from('fiado_dividas').update(patch).eq('id', id).select('*').single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao atualizar débito' }, { status: 500 });
  }
}
