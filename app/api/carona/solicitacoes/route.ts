// Caminho: C:\valente_conecta\app\api\carona\solicitacoes\route.ts
//
// Pedido de carona feito pelo passageiro pra um destino que ainda nao tem
// viagem anunciada — qualquer motorista cadastrado pode ver e aceitar (ver
// 060_carona_solicitacoes.sql). GET tambem serve pra listar destinos ja
// usados antes (recurso=destinos), pro autocomplete do campo destino.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const recurso = searchParams.get('recurso');
  const supabase = createClient();

  // Destinos ja usados em viagens anunciadas (qualquer status) — alimenta o
  // autocomplete do campo destino tanto pro motorista quanto pro passageiro.
  if (recurso === 'destinos') {
    const { data, error } = await supabase.from('carona_viagens').select('cidade_destino');
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    const destinos = [...new Set((data || []).map((v: any) => v.cidade_destino).filter(Boolean))].sort();
    return NextResponse.json({ success: true, data: destinos });
  }

  const status = searchParams.get('status') || 'aberta';
  const usuarioId = searchParams.get('usuarioId');
  let query = supabase.from('carona_solicitacoes').select('*').order('created_at', { ascending: false });
  // Aceita lista separada por virgula (ex: "aberta,atendida") pro passageiro
  // acompanhar o proprio pedido tanto enquanto espera quanto depois do aceite.
  query = status.includes(',') ? query.in('status', status.split(',').map((s) => s.trim())) : query.eq('status', status);
  if (usuarioId) query = query.eq('usuario_id', usuarioId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const obrigatorios = ['nomePassageiro', 'telefonePassageiro', 'cidadeOrigem', 'cidadeDestino', 'dataViagem'];
    for (const campo of obrigatorios) {
      if (!body?.[campo]) return NextResponse.json({ success: false, error: `Campo obrigatório: ${campo}` }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('carona_solicitacoes')
      .insert({
        usuario_id: body.usuarioId || null,
        nome_passageiro: body.nomePassageiro.trim(),
        telefone_passageiro: body.telefonePassageiro.trim(),
        cidade_origem: body.cidadeOrigem.trim(),
        origem_local: body.origemLocal || null,
        origem_lat: body.origemLat ?? null,
        origem_lng: body.origemLng ?? null,
        cidade_destino: body.cidadeDestino.trim(),
        data_viagem: body.dataViagem,
        horario_saida: body.horarioSaida || null,
        observacoes: body.observacoes || null,
      })
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao registrar solicitação' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });
  const supabase = createClient();
  const { error } = await supabase.from('carona_solicitacoes').update({ status: 'cancelada' }).eq('id', id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
