import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ============================================
// API DE ITENS DE MENU - CRUD COMPLETO
// ============================================

// GET - Listar todos os itens ou buscar por ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // Buscar item por ID
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        // Se não encontrar, retornar 404
        if (error.code === 'PGRST116') {
          return NextResponse.json(
            { success: false, error: 'Item não encontrado' },
            { status: 404 }
          );
        }
        throw error;
      }
      
      return NextResponse.json({ success: true, data });
    }
    
    // Buscar todos os itens ordenados
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json({ 
      success: true, 
      data: data || [],
      count: data?.length || 0
    });
    
  } catch (error) {
    console.error('Erro ao buscar itens:', error);
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

// POST - Criar novo item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validação básica
    if (!body.nome || !body.preco) {
      return NextResponse.json(
        { success: false, error: 'Nome e preço são obrigatórios' },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('menu_items')
      .insert([{ 
        ...body, 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();
    
    if (error) throw error;
    
    return NextResponse.json(
      { 
        success: true, 
        data: data?.[0],
        message: 'Item criado com sucesso'
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Erro ao criar item:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao criar item',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// PUT - Atualizar item existente
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
      .from('menu_items')
      .update({ 
        ...body, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Item não encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: data[0],
      message: 'Item atualizado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao atualizar item',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// DELETE - Remover item
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
    
    // Verificar se o item existe antes de deletar
    const { data: existingItem, error: findError } = await supabase
      .from('menu_items')
      .select('id')
      .eq('id', id)
      .single();
    
    if (findError || !existingItem) {
      return NextResponse.json(
        { success: false, error: 'Item não encontrado' },
        { status: 404 }
      );
    }
    
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Item removido com sucesso' 
    });
    
  } catch (error) {
    console.error('Erro ao remover item:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao remover item',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}