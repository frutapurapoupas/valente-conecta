import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// ============================================
// API DE COMPRAS (PURCHASES) - CRUD COMPLETO
// ============================================

// GET - Listar todas as compras ou buscar por ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // Buscar compra por ID
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        // Se não encontrar, retornar 404
        if (error.code === 'PGRST116') {
          return NextResponse.json(
            { success: false, error: 'Compra não encontrada' },
            { status: 404 }
          );
        }
        throw error;
      }
      
      return NextResponse.json({ success: true, data });
    }
    
    // Buscar todas as compras ordenadas
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json({ 
      success: true, 
      data: data || [],
      count: data?.length || 0
    });
    
  } catch (error) {
    console.error('Erro ao buscar compras:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao carregar dados',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// POST - Criar nova compra
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validação básica
    if (!body.userId || !body.total || !body.items) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'userId, total e items são obrigatórios' 
        },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('purchases')
      .insert([{ 
        ...body, 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: body.status || 'pendente'
      }])
      .select();
    
    if (error) throw error;
    
    return NextResponse.json(
      { 
        success: true, 
        data: data?.[0],
        message: 'Compra criada com sucesso'
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Erro ao criar compra:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao criar compra',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// PUT - Atualizar compra existente
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID não informado' },
        { status: 400 }
      );
    }
    
    // Validação: pelo menos um campo para atualizar
    if (Object.keys(body).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhum campo para atualizar' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('purchases')
      .update({ 
        ...body, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Compra não encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: data[0],
      message: 'Compra atualizada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao atualizar compra:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao atualizar compra',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// DELETE - Remover compra
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID não informado' },
        { status: 400 }
      );
    }
    
    // Verificar se a compra existe antes de deletar
    const { data: existingPurchase, error: findError } = await supabase
      .from('purchases')
      .select('id')
      .eq('id', id)
      .single();
    
    if (findError || !existingPurchase) {
      return NextResponse.json(
        { success: false, error: 'Compra não encontrada' },
        { status: 404 }
      );
    }
    
    const { error } = await supabase
      .from('purchases')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Compra removida com sucesso' 
    });
    
  } catch (error) {
    console.error('Erro ao remover compra:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao remover compra',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

