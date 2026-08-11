// Caminho: C:\valente_conecta\app\api\admin-master\taxas-config\route.ts
//
// CRUD de taxas_config para o admin master (ver 003_marketplace_interesse.sql
// e MODULO_MARKETPLACE_MONETIZACAO.md secao 2.3). escopo: 'global' |
// 'modulo:xxx' | 'categoria:xxx'.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const escopo = searchParams.get('escopo');
    const supabase = createClient();
    let query = supabase.from('taxas_config').select('*').order('escopo');
    if (escopo) query = query.eq('escopo', escopo);
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Erro ao listar taxas:', error);
    return NextResponse.json({ success: false, error: 'Erro ao listar taxas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.escopo || !body.tipo) {
      return NextResponse.json({ success: false, error: 'escopo e tipo são obrigatórios' }, { status: 400 });
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from('taxas_config')
      .upsert(
        { escopo: body.escopo, tipo: body.tipo, valor: body.valor ?? 0, ativo: !!body.ativo, updated_at: new Date().toISOString() },
        { onConflict: 'escopo,tipo' }
      )
      .select('*')
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao salvar taxa:', error);
    return NextResponse.json({ success: false, error: 'Erro ao salvar taxa' }, { status: 500 });
  }
}
