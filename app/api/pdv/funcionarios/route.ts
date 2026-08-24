// Caminho: C:\valente_conecta\app\api\pdv\funcionarios\route.ts
//
// CRUD dos funcionários (operadores internos) do PDV de uma loja. Leitura
// sempre pela view pdv_funcionarios_publico (nunca expõe pin_hash pro
// navegador). Criação e redefinição de PIN passam pelas RPCs
// criar_funcionario_pdv/redefinir_pin_funcionario_pdv (hash feito dentro
// do banco, ver 072_pdv_funcionarios.sql). Sem DELETE físico — desligar é
// ativo=false, pra preservar o rastro em pdv_vendas.funcionario_id.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const donoId = searchParams.get('donoId');
  if (!donoId) return NextResponse.json({ success: false, error: 'donoId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase
    .from('pdv_funcionarios_publico')
    .select('*')
    .eq('dono_id', donoId)
    .order('nome');
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const donoId = String(body.donoId || '').trim();
    const nome = String(body.nome || '').trim();
    const pin = String(body.pin || '').trim();
    const permissoes = body.permissoes && typeof body.permissoes === 'object' ? body.permissoes : {};

    if (!donoId) return NextResponse.json({ success: false, error: 'donoId é obrigatório' }, { status: 400 });
    if (!nome) return NextResponse.json({ success: false, error: 'Nome é obrigatório' }, { status: 400 });
    if (!/^\d{4,6}$/.test(pin)) return NextResponse.json({ success: false, error: 'PIN precisa ter de 4 a 6 números' }, { status: 400 });

    const supabase = createClient();
    const { data, error } = await supabase
      .rpc('criar_funcionario_pdv', { p_dono_id: donoId, p_nome: nome, p_pin: pin, p_permissoes: permissoes })
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao cadastrar funcionário' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });
    const body = await request.json();

    const supabase = createClient();

    if (body.pin) {
      const pin = String(body.pin).trim();
      if (!/^\d{4,6}$/.test(pin)) return NextResponse.json({ success: false, error: 'PIN precisa ter de 4 a 6 números' }, { status: 400 });
      const { error: erroPin } = await supabase.rpc('redefinir_pin_funcionario_pdv', { p_funcionario_id: id, p_pin: pin });
      if (erroPin) throw erroPin;
    }

    const patch: Record<string, any> = {};
    if (body.nome !== undefined) patch.nome = String(body.nome).trim();
    if (body.permissoes !== undefined) patch.permissoes = body.permissoes;
    if (body.ativo !== undefined) patch.ativo = Boolean(body.ativo);

    if (Object.keys(patch).length === 0) {
      const { data } = await supabase.from('pdv_funcionarios_publico').select('*').eq('id', id).single();
      return NextResponse.json({ success: true, data });
    }

    patch.updated_at = new Date().toISOString();
    const { error } = await supabase.from('pdv_funcionarios').update(patch).eq('id', id);
    if (error) throw error;

    const { data } = await supabase.from('pdv_funcionarios_publico').select('*').eq('id', id).single();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao atualizar funcionário' }, { status: 500 });
  }
}
