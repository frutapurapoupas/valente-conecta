// app/api/cozinha/producao/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Listar todas as produções
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('producao')
      .select(`
        *,
        prato:pratos(id, nome)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Criar uma nova produção
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from('producao')
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Atualizar status da produção
export async function PUT(request: NextRequest) {
  try {
    const { id, status, quantidade_produzida } = await request.json();

    const updateData: any = { status };
    if (quantidade_produzida !== undefined) {
      updateData.quantidade_produzida = quantidade_produzida;
    }
    if (status === 'produzindo') {
      updateData.inicio = new Date().toISOString();
    }
    if (status === 'concluido') {
      updateData.fim = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('producao')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}