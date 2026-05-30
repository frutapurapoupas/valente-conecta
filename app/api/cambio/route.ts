// ============================================================================
// ARQUIVO: app/api/cambio/route.ts
// Funcionalidade: API para buscar e atualizar taxas de câmbio
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cambioService } from '@/services/cambioService';

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
    return false;
  }
}

// ============================================================================
// GET - Buscar câmbio
// ============================================================================
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cidade = searchParams.get('cidade');
  const usuarioId = searchParams.get('usuarioId');
  const todas = searchParams.get('todas') === 'true';
  const cidades = searchParams.get('cidades') === 'true';

  // Buscar lista de cidades
  if (cidades) {
    const listaCidades = await cambioService.getAllCidades();
    return NextResponse.json({ success: true, data: listaCidades });
  }

  // Buscar todas configurações de câmbio (apenas admin)
  if (todas) {
    const admin = await isAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    const cambios = await cambioService.getAllCambios();
    return NextResponse.json({ success: true, data: cambios });
  }

  // Buscar câmbio por ID do usuário
  if (usuarioId) {
    const cambio = await cambioService.getCambioPorUsuario(usuarioId);
    return NextResponse.json({ success: true, data: cambio });
  }

  // Buscar câmbio por cidade
  if (cidade) {
    const cambio = await cambioService.getCambioPorCidade(cidade);
    return NextResponse.json({ success: true, data: cambio });
  }

  // Buscar câmbio da cidade do usuário logado
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const cambio = await cambioService.getCambioPorUsuario(user.id);
    return NextResponse.json({ success: true, data: cambio });
  }

  return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
}

// ============================================================================
// POST - Atualizar câmbio (apenas admin)
// ============================================================================
export async function POST(request: NextRequest) {
  const admin = await isAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { cidade, taxa_cambio } = await request.json();
    
    if (!cidade || !taxa_cambio || taxa_cambio <= 0) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    const sucesso = await cambioService.atualizarCambio(cidade, taxa_cambio, user?.id || 'admin');

    if (sucesso) {
      return NextResponse.json({ success: true, message: 'Câmbio atualizado' });
    } else {
      return NextResponse.json({ error: 'Erro ao atualizar câmbio' }, { status: 500 });
    }
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}