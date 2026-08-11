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
      })
      .select('*')
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao cadastrar cliente' }, { status: 500 });
  }
}
