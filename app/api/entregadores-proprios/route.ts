// Caminho: C:\valente_conecta\app\api\entregadores-proprios\route.ts
//
// Entregador proprio GENERICO (086/088_entrega_avulsa.sql) -- cadastro
// simples pelo dono do negocio (nome/telefone/veiculo), sem login. Mesmo
// espirito de agua_gas_entregadores, generalizado por `origem_modulo` pra
// qualquer modulo que ainda nao tenha o proprio (comeca pela Cozinha).
// Link de rastreio: /entregador/[id] (app/entregador/[id]/page.tsx).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const id = request.nextUrl.searchParams.get('id');
  const origemModulo = request.nextUrl.searchParams.get('origemModulo');

  if (id) {
    const { data, error } = await supabase.from('entregadores_proprios').select('*').eq('id', id).maybeSingle();
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ success: false, error: 'Entregador não encontrado' }, { status: 404 });
    return NextResponse.json({ success: true, data });
  }

  let query = supabase.from('entregadores_proprios').select('*').order('created_at', { ascending: false });
  if (origemModulo) query = query.eq('origem_modulo', origemModulo);
  const { data, error } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const origemModulo = String(body.origemModulo || '').trim();
    const nome = String(body.nome || '').trim();
    const telefone = String(body.telefone || '').trim();
    if (!origemModulo || !nome || !telefone) {
      return NextResponse.json({ success: false, error: 'origemModulo, nome e telefone são obrigatórios' }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('entregadores_proprios')
      .insert({
        origem_modulo: origemModulo,
        dono_id: body.donoId || null,
        nome,
        telefone,
        veiculo: body.veiculo || null,
        ativo: true,
      })
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao cadastrar entregador' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });
    const body = await request.json();

    const atualizacao: Record<string, any> = {};
    if (body.latitude !== undefined && body.longitude !== undefined) {
      atualizacao.latitude = body.latitude;
      atualizacao.longitude = body.longitude;
      atualizacao.atualizado_em = new Date().toISOString();
    }
    if (body.ativo !== undefined) atualizacao.ativo = !!body.ativo;
    if (body.nome !== undefined) atualizacao.nome = String(body.nome).trim();
    if (body.telefone !== undefined) atualizacao.telefone = String(body.telefone).trim();
    if (body.veiculo !== undefined) atualizacao.veiculo = body.veiculo || null;

    if (Object.keys(atualizacao).length === 0) {
      return NextResponse.json({ success: false, error: 'Nada para atualizar' }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase.from('entregadores_proprios').update(atualizacao).eq('id', id).select('*').single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao atualizar entregador' }, { status: 500 });
  }
}
