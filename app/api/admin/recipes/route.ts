import { supabase } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// ============================================
// API DE RECEITAS (RECIPES) - CRUD COMPLETO
// ============================================

// GET - Listar todas as receitas ou buscar por ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const categoria = searchParams.get('categoria');
    const usuarioId = searchParams.get('usuarioId');
    
    if (id) {
      // Buscar receita por ID
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        // Se nÃ£o encontrar, retornar 404
        if (error.code === 'PGRST116') {
          return NextResponse.json(
            { success: false, error: 'Receita nÃ£o encontrada' },
            { status: 404 }
          );
        }
        throw error;
      }
      
      return NextResponse.json({ success: true, data });
    }
    
    // Construir query para filtros opcionais
    let query = supabase.from('recipes').select('*');
    
    if (categoria) {
      query = query.eq('categoria', categoria);
    }
    
    if (usuarioId) {
      query = query.eq('usuario_id', usuarioId);
    }
    
    // Buscar todas as receitas ordenadas
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return NextResponse.json({ 
      success: true, 
      data: data || [],
      count: data?.length || 0
    });
    
  } catch (error) {
    console.error('Erro ao buscar receitas:', error);
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

// POST - Criar nova receita
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // ValidaÃ§Ã£o bÃ¡sica
    if (!body.titulo || !body.ingredientes || !body.modo_preparo) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'TÃ­tulo, ingredientes e modo de preparo sÃ£o obrigatÃ³rios' 
        },
        { status: 400 }
      );
    }
    
    // Garantir que os campos obrigatÃ³rios existam
    const novaReceita = {
      titulo: body.titulo,
      descricao: body.descricao || '',
      ingredientes: body.ingredientes,
      modo_preparo: body.modo_preparo,
      tempo_preparo: body.tempo_preparo || null,
      porcoes: body.porcoes || null,
      categoria: body.categoria || 'geral',
      imagem: body.imagem || null,
      usuario_id: body.usuario_id || null,
      curtidas: 0,
      visualizacoes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('recipes')
      .insert([novaReceita])
      .select();
    
    if (error) throw error;
    
    return NextResponse.json(
      { 
        success: true, 
        data: data?.[0],
        message: 'Receita criada com sucesso'
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Erro ao criar receita:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao criar receita',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// PUT - Atualizar receita existente
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID nÃ£o informado' },
        { status: 400 }
      );
    }
    
    // ValidaÃ§Ã£o: pelo menos um campo para atualizar
    if (Object.keys(body).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhum campo para atualizar' },
        { status: 400 }
      );
    }
    
    // Preparar dados para atualizaÃ§Ã£o
    const dadosAtualizados = {
      ...body,
      updated_at: new Date().toISOString()
    };
    
    // Se houver campo de visualizaÃ§Ãµes ou curtidas, incrementar
    if (body.incrementar_visualizacao) {
      // Para incrementar, precisamos buscar o valor atual primeiro
      const { data: currentData } = await supabase
        .from('recipes')
        .select('visualizacoes')
        .eq('id', id)
        .single();
      
      if (currentData) {
        dadosAtualizados.visualizacoes = (currentData.visualizacoes || 0) + 1;
      }
    }
    
    if (body.incrementar_curtida) {
      const { data: currentData } = await supabase
        .from('recipes')
        .select('curtidas')
        .eq('id', id)
        .single();
      
      if (currentData) {
        dadosAtualizados.curtidas = (currentData.curtidas || 0) + 1;
      }
    }
    
    const { data, error } = await supabase
      .from('recipes')
      .update(dadosAtualizados)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Receita nÃ£o encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: data[0],
      message: 'Receita atualizada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao atualizar receita:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao atualizar receita',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

// DELETE - Remover receita
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID nÃ£o informado' },
        { status: 400 }
      );
    }
    
    // Verificar se a receita existe antes de deletar
    const { data: existingRecipe, error: findError } = await supabase
      .from('recipes')
      .select('id')
      .eq('id', id)
      .single();
    
    if (findError || !existingRecipe) {
      return NextResponse.json(
        { success: false, error: 'Receita nÃ£o encontrada' },
        { status: 404 }
      );
    }
    
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Receita removida com sucesso' 
    });
    
  } catch (error) {
    console.error('Erro ao remover receita:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao remover receita',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

