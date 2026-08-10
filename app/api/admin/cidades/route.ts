// ============================================================================
// ARQUIVO: app/api/admin/cidades/route.ts
// Funcionalidade: API para Admin Master gerenciar cidades (CRUD completo)
// Rotas: GET, POST, PUT, DELETE
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
// GET - Listar cidades
// ============================================================================
export async function GET(request: NextRequest) {
  const admin = await isAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const ativo = searchParams.get('ativo');
  const estado = searchParams.get('estado');

  try {
    let query = supabase
      .from('cidades')
      .select('*')
      .order('nome');

    if (id) {
      query = query.eq('id', id);
      const { data, error } = await query.single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (ativo === 'true') {
      query = query.eq('ativo', true);
    } else if (ativo === 'false') {
      query = query.eq('ativo', false);
    }

    if (estado) {
      query = query.eq('estado', estado);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao buscar cidades:', error);
    return NextResponse.json({ error: 'Erro ao buscar cidades' }, { status: 500 });
  }
}

// ============================================================================
// POST - Criar nova cidade
// ============================================================================
export async function POST(request: NextRequest) {
  const admin = await isAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { nome, estado, regiao, taxa_cambio_inicial } = await request.json();

    if (!nome || !estado) {
      return NextResponse.json({ error: 'Nome e estado são obrigatórios' }, { status: 400 });
    }

    // Verificar se cidade já existe
    const { data: existing, error: checkError } = await supabase
      .from('cidades')
      .select('id')
      .eq('nome', nome)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Cidade já cadastrada' }, { status: 400 });
    }

    // Inserir cidade
    const { data: cidade, error: cidadeError } = await supabase
      .from('cidades')
      .insert({
        nome,
        estado,
        regiao: regiao || 'Nordeste',
        ativo: true
      })
      .select()
      .single();

    if (cidadeError) throw cidadeError;

    // Criar configuração de câmbio para a nova cidade
    const taxa = taxa_cambio_inicial || 1.0;
    const { data: cambio, error: cambioError } = await supabase
      .from('configuracoes_cambio')
      .insert({
        cidade: nome,
        estado,
        taxa_cambio: taxa,
        taxa_compra: taxa,
        taxa_venda: taxa,
        ativo: true,
        atualizado_por: 'admin'
      })
      .select()
      .single();

    if (cambioError) throw cambioError;

    return NextResponse.json({
      success: true,
      data: { cidade, cambio },
      message: `Cidade ${nome} adicionada com sucesso!`
    });
  } catch (error) {
    console.error('Erro ao criar cidade:', error);
    return NextResponse.json({ error: 'Erro ao criar cidade' }, { status: 500 });
  }
}

// ============================================================================
// PUT - Atualizar cidade
// ============================================================================
export async function PUT(request: NextRequest) {
  const admin = await isAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { id, nome, estado, regiao, ativo } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID da cidade é obrigatório' }, { status: 400 });
    }

    // Buscar cidade atual
    const { data: cidadeAtual, error: buscaError } = await supabase
      .from('cidades')
      .select('nome')
      .eq('id', id)
      .single();

    if (buscaError) throw buscaError;

    // Atualizar cidade
    const updates: any = {};
    if (nome !== undefined) updates.nome = nome;
    if (estado !== undefined) updates.estado = estado;
    if (regiao !== undefined) updates.regiao = regiao;
    if (ativo !== undefined) updates.ativo = ativo;

    const { data, error } = await supabase
      .from('cidades')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Se o nome mudou, atualizar também na tabela de câmbio
    if (nome && nome !== cidadeAtual.nome) {
      await supabase
        .from('configuracoes_cambio')
        .update({ cidade: nome })
        .eq('cidade', cidadeAtual.nome);
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Cidade atualizada com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao atualizar cidade:', error);
    return NextResponse.json({ error: 'Erro ao atualizar cidade' }, { status: 500 });
  }
}

// ============================================================================
// DELETE - Desativar/Remover cidade
// ============================================================================
export async function DELETE(request: NextRequest) {
  const admin = await isAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  const permanent = searchParams.get('permanent') === 'true';

  if (!id) {
    return NextResponse.json({ error: 'ID da cidade é obrigatório' }, { status: 400 });
  }

  try {
    if (permanent) {
      // Remoção permanente (cuidado!)
      const { error: cidadesError } = await supabase
        .from('cidades')
        .delete()
        .eq('id', id);

      if (cidadesError) throw cidadesError;

      // Remover também configuração de câmbio
      await supabase
        .from('configuracoes_cambio')
        .delete()
        .eq('cidade', (await supabase.from('cidades').select('nome').eq('id', id).single()).data?.nome);
    } else {
      // Soft delete - apenas desativar
      const { error } = await supabase
        .from('cidades')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      message: permanent ? 'Cidade removida permanentemente' : 'Cidade desativada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover cidade:', error);
    return NextResponse.json({ error: 'Erro ao remover cidade' }, { status: 500 });
  }
}

