import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fromDbToCanonical, fromPayloadToCanonical, toDbPayload } from './canonical';

export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('receitas')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw error;

    const receitasCanonicas = (data || []).map(fromDbToCanonical);
    return NextResponse.json({ success: true, data: receitasCanonicas });
  } catch (error) {
    console.error('Erro ao buscar receitas:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar receitas' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const canonical = fromPayloadToCanonical(body);
    const dbPayload = {
      ...toDbPayload(canonical, null, null),
      created_at: canonical.created_at,
    };

    const { data, error } = await supabase
      .from('receitas')
      .insert([dbPayload])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: fromDbToCanonical(data) });
  } catch (error) {
    console.error('Erro ao criar receita:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar receita' },
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

    const { data: atual, error: erroAtual } = await supabase
      .from('receitas')
      .select('*')
      .eq('id', id)
      .single();

    if (erroAtual || !atual) {
      return NextResponse.json(
        { success: false, error: 'Receita não encontrada' },
        { status: 404 }
      );
    }

    const atualCanonica = fromDbToCanonical(atual);
    const canonical = fromPayloadToCanonical({ ...body, id }, atualCanonica);
    const dbPayload = toDbPayload(canonical, atual.instrucoes, atual.tempo_preparo);

    const { data, error } = await supabase
      .from('receitas')
      .update(dbPayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data: fromDbToCanonical(data) });
  } catch (error) {
    console.error('Erro ao atualizar receita:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar receita' },
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
      .from('receitas')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir receita:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao excluir receita' },
      { status: 500 }
    );
  }
}




