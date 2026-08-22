// Caminho: C:\valente_conecta\app\api\comercios-diretorio\route.ts
//
// Diretorio publico e gratuito, generico pra varios modulos (ver
// 056_comercios_diretorio.sql) — telefone/endereco sempre visiveis, sem
// taxa de desbloqueio, mesmo racional ja aplicado em Saude e Água e Gás.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function paraApi(c: any) {
  return {
    id: c.id,
    donoId: c.dono_id,
    modulo: c.modulo,
    categoria: c.categoria,
    nome: c.nome,
    telefone: c.telefone || '',
    whatsapp: c.whatsapp || '',
    endereco: c.endereco || '',
    bairro: c.bairro || '',
    cidade: c.cidade || 'Valente',
    latitude: c.latitude,
    longitude: c.longitude,
    horario: c.horario || '',
    foto: c.foto || '',
    catalogo: Array.isArray(c.catalogo) ? c.catalogo : [],
    status: c.status,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const modulo = searchParams.get('modulo');
  const categoria = searchParams.get('categoria');
  const busca = (searchParams.get('busca') || '').toLowerCase().trim();
  const id = searchParams.get('id');
  const donoId = searchParams.get('donoId');

  const supabase = createClient();
  let query = supabase.from('comercios_diretorio').select('*').order('nome');
  if (!id && !donoId) query = query.eq('status', 'publicado');
  if (id) query = query.eq('id', id);
  if (donoId) query = query.eq('dono_id', donoId);
  if (modulo) query = query.eq('modulo', modulo);
  if (categoria) query = query.eq('categoria', categoria);

  const { data, error } = await query;
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  let items = data || [];
  if (busca) {
    items = items.filter((c: any) =>
      c.nome?.toLowerCase().includes(busca) ||
      c.bairro?.toLowerCase().includes(busca) ||
      c.categoria?.toLowerCase().includes(busca)
    );
  }

  return NextResponse.json({ success: true, data: items.map(paraApi) });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.nome?.trim() || !body.modulo || !body.categoria) {
      return NextResponse.json({ success: false, error: 'nome, modulo e categoria são obrigatórios.' }, { status: 400 });
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from('comercios_diretorio')
      .insert({
        dono_id: body.donoId || null,
        modulo: body.modulo,
        categoria: body.categoria,
        nome: String(body.nome).trim(),
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
    return NextResponse.json({ success: false, error: error.message || 'Erro ao cadastrar' }, { status: 500 });
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
  if (body.categoria !== undefined) patch.categoria = body.categoria;
  if (body.telefone !== undefined) patch.telefone = body.telefone;
  if (body.whatsapp !== undefined) patch.whatsapp = body.whatsapp;
  if (body.endereco !== undefined) patch.endereco = body.endereco;
  if (body.bairro !== undefined) patch.bairro = body.bairro;
  if (body.horario !== undefined) patch.horario = body.horario;
  if (body.foto !== undefined) patch.foto = body.foto;
  if (body.catalogo !== undefined) patch.catalogo = Array.isArray(body.catalogo) ? body.catalogo : [];
  if (body.latitude !== undefined) patch.latitude = body.latitude;
  if (body.longitude !== undefined) patch.longitude = body.longitude;
  if (body.status !== undefined) patch.status = body.status;
  if (body.donoId !== undefined) patch.dono_id = body.donoId;

  const { data, error } = await supabase.from('comercios_diretorio').update(patch).eq('id', id).select('*').single();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: paraApi(data) });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'ID não informado.' }, { status: 400 });
  const supabase = createClient();
  const { error } = await supabase.from('comercios_diretorio').delete().eq('id', id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
