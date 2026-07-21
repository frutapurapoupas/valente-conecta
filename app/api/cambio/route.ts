// ============================================================================
// ARQUIVO: app/api/cambio/route.ts
// Funcionalidade: API para buscar e atualizar taxas de cÃ¢mbio
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cambioService } from '@/services/cambioService';

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
// GET - Buscar cÃ¢mbio
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

  // Buscar todas configuraÃ§Ãµes de cÃ¢mbio (apenas admin)
  if (todas) {
    const admin = await isAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'NÃ£o autorizado' }, { status: 401 });
    }
    const cambios = await cambioService.getAllCambios();
    return NextResponse.json({ success: true, data: cambios });
  }

  // Buscar cÃ¢mbio por ID do usuÃ¡rio
  if (usuarioId) {
    const cambio = await cambioService.getCambioPorUsuario(usuarioId);
    return NextResponse.json({ success: true, data: cambio });
  }

  // Buscar cÃ¢mbio por cidade
  if (cidade) {
    const cambio = await cambioService.getCambioPorCidade(cidade);
    return NextResponse.json({ success: true, data: cambio });
  }

  // Buscar cÃ¢mbio da cidade do usuÃ¡rio logado
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const cambio = await cambioService.getCambioPorUsuario(user.id);
    return NextResponse.json({ success: true, data: cambio });
  }

  return NextResponse.json({ error: 'ParÃ¢metros invÃ¡lidos' }, { status: 400 });
}

// ============================================================================
// POST - Atualizar cÃ¢mbio (apenas admin)
// ============================================================================
export async function POST(request: NextRequest) {
  const admin = await isAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: 'NÃ£o autorizado' }, { status: 401 });
  }

  try {
    const { cidade, taxa_cambio } = await request.json();
    
    if (!cidade || !taxa_cambio || taxa_cambio <= 0) {
      return NextResponse.json({ error: 'Dados invÃ¡lidos' }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    const sucesso = await cambioService.atualizarCambio(cidade, taxa_cambio, user?.id || 'admin');

    if (sucesso) {
      return NextResponse.json({ success: true, message: 'CÃ¢mbio atualizado' });
    } else {
      return NextResponse.json({ error: 'Erro ao atualizar cÃ¢mbio' }, { status: 500 });
    }
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

