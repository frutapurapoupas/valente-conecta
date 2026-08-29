// Caminho: C:\valente_conecta\app\api\profissionais\agendamentos\route.ts
//
// Agendamentos do diretorio de profissionais, agora no Supabase (ver
// 084_profissionais_diretorio.sql). Antes gravava em
// data/profissionais_agendamentos.json, que nao persiste em runtime
// serverless (Vercel) -- toda solicitacao de agendamento falhava com 500
// em producao.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

function paraApi(row: any) {
  return {
    id: row.id,
    profissionalId: row.profissional_id,
    profissionalNome: row.profissional_nome,
    clienteNome: row.cliente_nome,
    clienteTelefone: row.cliente_telefone,
    servico: row.servico,
    data: row.data,
    horario: row.horario || '',
    observacoes: row.observacoes || '',
    valorEstimado: Number(row.valor_estimado),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profissionalId = searchParams.get('profissionalId');

    const supabase = createClient();
    let query = supabase.from('profissionais_diretorio_agendamentos').select('*').order('created_at', { ascending: false });
    if (profissionalId) query = query.eq('profissional_id', profissionalId);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data: (data || []).map(paraApi) });
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao carregar agendamentos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.profissionalId || !body.clienteNome?.trim() || !body.clienteTelefone?.trim() || !body.servico?.trim() || !body.data) {
      return NextResponse.json(
        { success: false, error: 'profissionalId, clienteNome, clienteTelefone, servico e data são obrigatórios.' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('profissionais_diretorio_agendamentos')
      .insert({
        profissional_id: String(body.profissionalId),
        profissional_nome: String(body.profissionalNome || ''),
        cliente_nome: String(body.clienteNome).trim(),
        cliente_telefone: String(body.clienteTelefone).trim(),
        servico: String(body.servico).trim(),
        data: String(body.data),
        horario: String(body.horario || ''),
        observacoes: String(body.observacoes || '').trim(),
        valor_estimado: Number(body.valorEstimado || 0),
        status: 'pendente'
      })
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data: paraApi(data) });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID não informado' }, { status: 400 });

    const body = await request.json();
    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    if (body.status !== undefined) patch.status = String(body.status);
    if (body.horario !== undefined) patch.horario = String(body.horario || '');
    if (body.observacoes !== undefined) patch.observacoes = String(body.observacoes || '');
    if (body.valorEstimado !== undefined) patch.valor_estimado = Number(body.valorEstimado || 0);

    const supabase = createClient();
    const { data, error } = await supabase
      .from('profissionais_diretorio_agendamentos')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    if (!data) return NextResponse.json({ success: false, error: 'Agendamento não encontrado' }, { status: 404 });

    return NextResponse.json({ success: true, data: paraApi(data) });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
