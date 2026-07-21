// ============================================================================
// ARQUIVO: app/api/admin/cambio/route.ts
// Funcionalidade: API para Admin Master gerenciar taxas de cÃ¢mbio
// Rotas: GET, POST, PUT, DELETE
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Verificar se o usuÃ¡rio Ã© Admin
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
    return false;
  }
}

// ============================================================================
// GET - Listar todas as configuraÃ§Ãµes de cÃ¢mbio
// ============================================================================
export async function GET(request: NextRequest) {
  const admin = await isAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'NÃ£o autorizado' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const cidade = searchParams.get('cidade');

  try {
    let query = supabase
      .from('configuracoes_cambio')
      .select('*')
      .order('cidade');

    if (cidade) {
      query = query.eq('cidade', cidade);
      const { data, error } = await query.single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao buscar configuraÃ§Ãµes de cÃ¢mbio:', error);
    return NextResponse.json({ error: 'Erro ao buscar configuraÃ§Ãµes' }, { status: 500 });
  }
}

// ============================================================================
// POST - Atualizar taxa de cÃ¢mbio
// ============================================================================
export async function POST(request: NextRequest) {
  const admin = await isAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'NÃ£o autorizado' }, { status: 401 });
  }

  try {
    const { cidade, taxa_cambio, taxa_compra, taxa_venda } = await request.json();

    if (!cidade || !taxa_cambio || taxa_cambio <= 0) {
      return NextResponse.json({ error: 'Dados invÃ¡lidos' }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();

    const updates: any = {
      taxa_cambio,
      atualizado_em: new Date().toISOString(),
      atualizado_por: user?.id || 'admin'
    };

    if (taxa_compra !== undefined) updates.taxa_compra = taxa_compra;
    if (taxa_venda !== undefined) updates.taxa_venda = taxa_venda;

    const { data, error } = await supabase
      .from('configuracoes_cambio')
      .update(updates)
      .eq('cidade', cidade)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      message: `Taxa de cÃ¢mbio para ${cidade} atualizada para 1 MC = R$ ${taxa_cambio}`
    });
  } catch (error) {
    console.error('Erro ao atualizar cÃ¢mbio:', error);
    return NextResponse.json({ error: 'Erro ao atualizar cÃ¢mbio' }, { status: 500 });
  }
}

// ============================================================================
// PUT - Criar/Atualizar configuraÃ§Ã£o de cÃ¢mbio para nova cidade
// ============================================================================
export async function PUT(request: NextRequest) {
  const admin = await isAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'NÃ£o autorizado' }, { status: 401 });
  }

  try {
    const { cidade, estado, taxa_cambio } = await request.json();

    if (!cidade || !estado) {
      return NextResponse.json({ error: 'Cidade e estado sÃ£o obrigatÃ³rios' }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    const taxa = taxa_cambio || 1.0;

    // Verificar se jÃ¡ existe
    const { data: existing } = await supabase
      .from('configuracoes_cambio')
      .select('id')
      .eq('cidade', cidade)
      .single();

    let result;
    if (existing) {
      // Atualizar existente
      const { data, error } = await supabase
        .from('configuracoes_cambio')
        .update({
          taxa_cambio: taxa,
          taxa_compra: taxa,
          taxa_venda: taxa,
          atualizado_em: new Date().toISOString(),
          atualizado_por: user?.id || 'admin',
          ativo: true
        })
        .eq('cidade', cidade)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Criar nova
      const { data, error } = await supabase
        .from('configuracoes_cambio')
        .insert({
          cidade,
          estado,
          taxa_cambio: taxa,
          taxa_compra: taxa,
          taxa_venda: taxa,
          ativo: true,
          atualizado_por: user?.id || 'admin'
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `ConfiguraÃ§Ã£o de cÃ¢mbio para ${cidade} salva com sucesso!`
    });
  } catch (error) {
    console.error('Erro ao salvar configuraÃ§Ã£o:', error);
    return NextResponse.json({ error: 'Erro ao salvar configuraÃ§Ã£o' }, { status: 500 });
  }
}

// ============================================================================
// DELETE - Remover configuraÃ§Ã£o de cÃ¢mbio
// ============================================================================
export async function DELETE(request: NextRequest) {
  const admin = await isAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'NÃ£o autorizado' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const cidade = searchParams.get('cidade');

  if (!cidade) {
    return NextResponse.json({ error: 'Nome da cidade Ã© obrigatÃ³rio' }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from('configuracoes_cambio')
      .delete()
      .eq('cidade', cidade);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `ConfiguraÃ§Ã£o de cÃ¢mbio para ${cidade} removida`
    });
  } catch (error) {
    console.error('Erro ao remover configuraÃ§Ã£o:', error);
    return NextResponse.json({ error: 'Erro ao remover configuraÃ§Ã£o' }, { status: 500 });
  }
}

