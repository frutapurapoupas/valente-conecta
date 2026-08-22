// Caminho: C:\valente_conecta\app\api\saude\estabelecimentos\route.ts
//
// Diretorio publico e gratuito de hospitais/clinicas/consultorios (ver
// 053_saude_estabelecimentos.sql) — nao passa pelo fluxo pago de
// "interesse" do catalogo generico, telefone/endereco sempre visiveis.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function paraApi(e: any) {
  return {
    id: e.id,
    donoId: e.dono_id,
    nome: e.nome,
    tipo: e.tipo,
    especialidades: e.especialidades || [],
    telefone: e.telefone || '',
    whatsapp: e.whatsapp || '',
    endereco: e.endereco || '',
    bairro: e.bairro || '',
    cidade: e.cidade || 'Valente',
    latitude: e.latitude,
    longitude: e.longitude,
    horario: e.horario || '',
    foto: e.foto || '',
    status: e.status,
    createdAt: e.created_at,
    updatedAt: e.updated_at,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tipo = searchParams.get('tipo');
  const busca = (searchParams.get('busca') || '').toLowerCase().trim();
  const id = searchParams.get('id');
  const donoId = searchParams.get('donoId');

  const supabase = createClient();
  let query = supabase.from('saude_estabelecimentos').select('*').eq('status', 'publicado').order('nome');
  if (id) query = supabase.from('saude_estabelecimentos').select('*').eq('id', id);
  if (donoId) query = supabase.from('saude_estabelecimentos').select('*').eq('dono_id', donoId);
  if (tipo) query = query.eq('tipo', tipo);

  const { data, error } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  let items = data || [];
  if (busca) {
    items = items.filter((e: any) =>
      e.nome?.toLowerCase().includes(busca) ||
      e.bairro?.toLowerCase().includes(busca) ||
      (e.especialidades || []).some((esp: string) => esp.toLowerCase().includes(busca))
    );
  }

  return NextResponse.json({ success: true, data: items.map(paraApi) });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.nome?.trim()) {
      return NextResponse.json({ success: false, error: 'Nome é obrigatório.' }, { status: 400 });
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from('saude_estabelecimentos')
      .insert({
        dono_id: body.donoId || null,
        nome: String(body.nome).trim(),
        tipo: body.tipo || 'clinica',
        especialidades: Array.isArray(body.especialidades) ? body.especialidades : [],
        telefone: String(body.telefone || '').trim(),
        whatsapp: String(body.whatsapp || body.telefone || '').trim(),
        endereco: String(body.endereco || '').trim(),
        bairro: String(body.bairro || '').trim(),
        cidade: String(body.cidade || 'Valente').trim(),
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
        horario: String(body.horario || '').trim(),
        foto: String(body.foto || '').trim(),
      })
      .select('*')
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data: paraApi(data) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao cadastrar estabelecimento' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'ID não informado.' }, { status: 400 });
  const body = await request.json();
  const supabase = createClient();

  const patch: Record<string, any> = { updated_at: new Date().toISOString() };
  if (body.nome !== undefined) patch.nome = body.nome;
  if (body.tipo !== undefined) patch.tipo = body.tipo;
  if (body.especialidades !== undefined) patch.especialidades = body.especialidades;
  if (body.telefone !== undefined) patch.telefone = body.telefone;
  if (body.whatsapp !== undefined) patch.whatsapp = body.whatsapp;
  if (body.endereco !== undefined) patch.endereco = body.endereco;
  if (body.bairro !== undefined) patch.bairro = body.bairro;
  if (body.horario !== undefined) patch.horario = body.horario;
  if (body.foto !== undefined) patch.foto = body.foto;
  if (body.latitude !== undefined) patch.latitude = body.latitude;
  if (body.longitude !== undefined) patch.longitude = body.longitude;
  if (body.status !== undefined) patch.status = body.status;
  if (body.donoId !== undefined) patch.dono_id = body.donoId;

  const { data, error } = await supabase.from('saude_estabelecimentos').update(patch).eq('id', id).select('*').single();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: paraApi(data) });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'ID não informado.' }, { status: 400 });
  const supabase = createClient();
  const { error } = await supabase.from('saude_estabelecimentos').delete().eq('id', id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
