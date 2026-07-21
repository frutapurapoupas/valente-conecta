import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('estoque')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Erro ao buscar estoque:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar estoque' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();

    console.log('Dados para inserir no estoque:', body);

    const { data, error } = await supabase
      .from('estoque')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Erro Supabase ao criar item:', error);
      throw error;
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao criar item:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao criar item' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID não informado' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('estoque')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID não informado' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('estoque')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir item:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao excluir item' },
      { status: 500 }
    );
  }
}



