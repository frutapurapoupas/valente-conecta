// app/api/cozinha/receitas/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Buscar receita por ID (OTIMIZADO)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 🔥 OTIMIZAÇÃO 1: Buscar apenas os campos necessários
    const { data: receita, error: receitaError } = await supabase
      .from('receitas')
      .select('id, nome, descricao, categoria, porcoes, custo_total, preco_sugerido, created_at')
      .eq('id', id)
      .single();

    if (receitaError) throw receitaError;

    // 🔥 OTIMIZAÇÃO 2: Buscar ingredientes em uma query separada com índice
    const { data: ingredientes, error: ingredientesError } = await supabase
      .from('receita_ingredientes')
      .select('id, ingrediente_nome, quantidade, unidade, custo_unitario, custo_total')
      .eq('receita_id', id)
      .order('ingrediente_nome', { ascending: true });

    if (ingredientesError) throw ingredientesError;

    // 🔥 OTIMIZAÇÃO 3: Combinar os dados
    const data = {
      ...receita,
      ingredientes: ingredientes || []
    };

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Erro ao buscar receita:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}