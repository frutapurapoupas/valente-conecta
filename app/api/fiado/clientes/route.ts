// Caminho: C:\valente_conecta\app\api\fiado\clientes\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function apenasDigitos(v: string) {
  return (v || '').replace(/\D/g, '');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const donoId = searchParams.get('donoId');
  if (!donoId) return NextResponse.json({ success: false, error: 'donoId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase.from('fiado_clientes').select('*').eq('dono_id', donoId).order('nome');
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.donoId || !body.nome?.trim() || !body.telefone?.trim()) {
      return NextResponse.json({ success: false, error: 'donoId, nome e telefone são obrigatórios' }, { status: 400 });
    }
    const supabase = createClient();

    // Tenta achar um usuario ja cadastrado com esse telefone, pra push
    // funcionar (ver 017_fiado.sql). Melhor esforco: se nao achar, fica null
    // e o lojista precisa avisar o cliente por fora ate' ele se cadastrar.
    const telefoneLimpo = apenasDigitos(body.telefone);
    const { data: usuarioExistente } = await supabase
      .from('usuarios')
      .select('id')
      .eq('whatsapp', telefoneLimpo)
      .maybeSingle();

    const { data, error } = await supabase
      .from('fiado_clientes')
      .insert({
        dono_id: body.donoId,
        nome: body.nome.trim(),
        telefone: body.telefone.trim(),
        cliente_usuario_id: usuarioExistente?.id || null,
        limite_credito: Number(body.limiteCredito || 0),
        cpf: body.cpf?.trim() || null,
        endereco: body.endereco?.trim() || null,
        foto_url: body.fotoUrl || null,
      })
      .select('*')
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao cadastrar cliente' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });
    const body = await request.json();

    const patch: Record<string, any> = {};
    if (body.nome !== undefined) patch.nome = body.nome.trim();
    if (body.telefone !== undefined) patch.telefone = body.telefone.trim();
    if (body.limiteCredito !== undefined) patch.limite_credito = Number(body.limiteCredito || 0);
    if (body.cpf !== undefined) patch.cpf = body.cpf?.trim() || null;
    if (body.endereco !== undefined) patch.endereco = body.endereco?.trim() || null;
    if (body.fotoUrl !== undefined) patch.foto_url = body.fotoUrl || null;

    const supabase = createClient();
    const { data, error } = await supabase
      .from('fiado_clientes')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao atualizar cliente' }, { status: 500 });
  }
}
