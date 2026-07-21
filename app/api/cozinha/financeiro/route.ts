import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('financeiro')
      .select('*')
      .order('data', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Erro ao buscar financeiro:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar dados financeiros' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('financeiro')
      .insert([{
        descricao: body.descricao,
        valor: body.valor,
        tipo: body.tipo,
        categoria: body.categoria,
        data: body.data || new Date().toISOString(),
        forma_pagamento: body.forma_pagamento || 'PIX',
        status: body.status || 'pendente',
        observacoes: body.observacoes || null,
        recorrencia: body.recorrencia || 'nenhuma',
        recorrencia_quantidade: body.recorrencia_quantidade || 0,
        recorrencia_intervalo: body.recorrencia_intervalo || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao criar registro financeiro:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar registro financeiro' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID não informado' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('financeiro')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao atualizar registro financeiro:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar registro financeiro' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID não informado' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('financeiro')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir registro financeiro:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao excluir registro financeiro' },
      { status: 500 }
    );
  }
}



