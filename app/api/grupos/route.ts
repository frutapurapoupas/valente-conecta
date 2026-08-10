// ============================================================================
// ARQUIVO 4: app/api/grupos/route.ts
// Funcionalidade: API para gerenciar grupos de usuários
// Rotas:
//   GET /api/grupos - Listar todos os grupos
//   GET /api/grupos?usuarioId=xxx - Buscar grupos de um usuário
//   POST /api/grupos - Criar novo grupo
//   PUT /api/grupos - Atualizar grupo
//   DELETE /api/grupos?id=xxx - Deletar grupo
//   POST /api/grupos/usuario - Adicionar usuário a grupo
//   DELETE /api/grupos/usuario - Remover usuário de grupo
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Verificar se o usuário é Admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data } = await supabase
      .from('usuarios')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    return data?.is_admin === true;
  } catch (error) {
    console.error('Erro ao verificar admin:', error);
    return false;
  }
}

// ============================================================================
// GET - Buscar grupos
// ============================================================================
export async function GET(request: NextRequest) {
  const admin = await isAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const usuarioId = searchParams.get('usuarioId');
  const grupoId = searchParams.get('grupoId');

  // Buscar grupos de um usuário específico
  if (usuarioId) {
    try {
      const { data, error } = await supabase
        .from('usuarios_grupos')
        .select('grupo_id, grupos_dinamicos(*)')
        .eq('usuario_id', usuarioId)
        .eq('ativo', true);

      if (error) throw error;
      
      const grupos = data?.map(item => item.grupos_dinamicos) || [];
      return NextResponse.json({ success: true, data: grupos });
    } catch (error) {
      console.error('Erro ao buscar grupos do usuário:', error);
      return NextResponse.json({ error: 'Erro ao buscar grupos' }, { status: 500 });
    }
  }

  // Buscar usuários de um grupo específico
  if (grupoId) {
    try {
      const { data, error } = await supabase
        .from('usuarios_grupos')
        .select('usuario_id, usuarios(id, nome, email)')
        .eq('grupo_id', grupoId)
        .eq('ativo', true);

      if (error) throw error;
      
      const usuarios = data?.map(item => item.usuarios) || [];
      return NextResponse.json({ success: true, data: usuarios });
    } catch (error) {
      console.error('Erro ao buscar usuários do grupo:', error);
      return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 });
    }
  }

  // Buscar todos os grupos
  try {
    const { data, error } = await supabase
      .from('grupos_dinamicos')
      .select('*')
      .order('nome');

    if (error) throw error;
    
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Erro ao buscar grupos:', error);
    return NextResponse.json({ error: 'Erro ao buscar grupos' }, { status: 500 });
  }
}

// ============================================================================
// POST - Criar grupo ou adicionar usuário a grupo
// ============================================================================
export async function POST(request: NextRequest) {
  const admin = await isAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { tipo, ...dados } = body;

    // Adicionar usuário a grupo
    if (tipo === 'usuario') {
      const { usuarioId, grupoId } = dados;
      
      if (!usuarioId || !grupoId) {
        return NextResponse.json({ error: 'Usuário e grupo são obrigatórios' }, { status: 400 });
      }

      // Verificar se já existe
      const { data: existente } = await supabase
        .from('usuarios_grupos')
        .select('id')
        .eq('usuario_id', usuarioId)
        .eq('grupo_id', grupoId)
        .single();

      if (existente) {
        // Reativar se existia
        const { error } = await supabase
          .from('usuarios_grupos')
          .update({ ativo: true, atribuido_em: new Date().toISOString() })
          .eq('usuario_id', usuarioId)
          .eq('grupo_id', grupoId);
        
        if (error) throw error;
      } else {
        // Criar nova associação
        const { error } = await supabase
          .from('usuarios_grupos')
          .insert({
            usuario_id: usuarioId,
            grupo_id: grupoId,
            atribuido_em: new Date().toISOString(),
            atribuido_por: 'admin',
            ativo: true
          });
        
        if (error) throw error;
      }

      return NextResponse.json({ success: true, message: 'Usuário adicionado ao grupo' });
    }

    // Criar novo grupo
    const { nome, descricao, icone, cor, telegram_chat_id } = dados;
    
    if (!nome) {
      return NextResponse.json({ error: 'Nome do grupo é obrigatório' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('grupos_dinamicos')
      .insert({
        nome,
        descricao: descricao || '',
        icone: icone || 'Users',
        cor: cor || '#6366f1',
        telegram_chat_id: telegram_chat_id || null,
        ativo: true,
        criado_em: new Date().toISOString(),
        criado_por: 'admin'
      })
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json({ success: true, data, message: 'Grupo criado com sucesso' });
    
  } catch (error) {
    console.error('Erro na operação:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// ============================================================================
// PUT - Atualizar grupo
// ============================================================================
export async function PUT(request: NextRequest) {
  const admin = await isAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, nome, descricao, icone, cor, telegram_chat_id, ativo } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID do grupo é obrigatório' }, { status: 400 });
    }

    const { error } = await supabase
      .from('grupos_dinamicos')
      .update({
        nome,
        descricao,
        icone,
        cor,
        telegram_chat_id,
        ativo,
        atualizado_em: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
    
    return NextResponse.json({ success: true, message: 'Grupo atualizado com sucesso' });
    
  } catch (error) {
    console.error('Erro ao atualizar grupo:', error);
    return NextResponse.json({ error: 'Erro ao atualizar grupo' }, { status: 500 });
  }
}

// ============================================================================
// DELETE - Remover grupo ou remover usuário de grupo
// ============================================================================
export async function DELETE(request: NextRequest) {
  const admin = await isAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const tipo = searchParams.get('tipo');
  const id = searchParams.get('id');
  const usuarioId = searchParams.get('usuarioId');
  const grupoId = searchParams.get('grupoId');

  try {
    // Remover usuário de grupo
    if (tipo === 'usuario') {
      if (!usuarioId || !grupoId) {
        return NextResponse.json({ error: 'Usuário e grupo são obrigatórios' }, { status: 400 });
      }

      const { error } = await supabase
        .from('usuarios_grupos')
        .update({ ativo: false })
        .eq('usuario_id', usuarioId)
        .eq('grupo_id', grupoId);

      if (error) throw error;
      
      return NextResponse.json({ success: true, message: 'Usuário removido do grupo' });
    }

    // Deletar grupo (soft delete)
    if (id) {
      const { error } = await supabase
        .from('grupos_dinamicos')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;
      
      return NextResponse.json({ success: true, message: 'Grupo removido com sucesso' });
    }

    return NextResponse.json({ error: 'ID do grupo é obrigatório' }, { status: 400 });
    
  } catch (error) {
    console.error('Erro ao remover:', error);
    return NextResponse.json({ error: 'Erro ao remover' }, { status: 500 });
  }
}

