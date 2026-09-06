// Caminho: C:\valente_conecta\app\api\indicacao-estabelecimento\route.ts
//
// Indicação de estabelecimento/fornecedor pelo usuário comum (ver
// 100_indicacao_estabelecimento_fornecedor.sql). POST cria a indicação
// pendente pro admin master avaliar (ver /api/admin-master/indicacao-estabelecimento).
// GET lista as indicações do próprio usuário (tela /indicar-estabelecimento).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const usuarioId = String(body.usuarioId || '').trim();
    const nome = String(body.nome || '').trim();
    const categoria = String(body.categoria || '').trim();
    const cidade = String(body.cidade || '').trim();
    const telefone = body.telefone ? String(body.telefone).trim() : null;
    const endereco = body.endereco ? String(body.endereco).trim() : null;
    const observacoes = body.observacoes ? String(body.observacoes).trim() : null;

    if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });
    if (!nome || nome.length < 3) return NextResponse.json({ success: false, error: 'Informe o nome do estabelecimento' }, { status: 400 });
    if (!categoria) return NextResponse.json({ success: false, error: 'Informe a categoria' }, { status: 400 });
    if (!cidade) return NextResponse.json({ success: false, error: 'Informe a cidade' }, { status: 400 });

    const supabase = createClient();
    const { data, error } = await supabase
      .from('indicacoes_estabelecimento')
      .insert({ usuario_id: usuarioId, nome, categoria, cidade, telefone, endereco, observacoes })
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao registrar indicação' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase
    .from('indicacoes_estabelecimento')
    .select('id, nome, categoria, cidade, status, motivo_recusa, created_at')
    .eq('usuario_id', usuarioId)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data });
}
