// Caminho: C:\valente_conecta\app\api\demandas-busca\route.ts
//
// Registra o interesse de quem buscou algo que ainda nao existe em nenhum
// lugar da plataforma (ver 021_demandas_busca.sql). GET com usuarioId lista
// as demandas da propria pessoa (pra nao deixar pedir de novo a mesma coisa).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const usuarioId = searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase
    .from('demandas_busca')
    .select('*')
    .eq('usuario_id', usuarioId)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.termo?.trim() || !body.usuarioId) {
      return NextResponse.json({ success: false, error: 'termo e usuarioId são obrigatórios' }, { status: 400 });
    }

    const supabase = createClient();

    // Evita duplicar a mesma demanda em aberto pro mesmo termo/pessoa.
    const { data: existente } = await supabase
      .from('demandas_busca')
      .select('id')
      .eq('usuario_id', body.usuarioId)
      .eq('termo', body.termo.trim())
      .eq('status', 'aguardando')
      .maybeSingle();
    if (existente) return NextResponse.json({ success: true, data: existente, jaExistia: true });

    const { data, error } = await supabase
      .from('demandas_busca')
      .insert({
        termo: body.termo.trim(),
        modulo: body.modulo || null,
        usuario_id: body.usuarioId,
        usuario_nome: body.usuarioNome || null,
        usuario_telefone: body.usuarioTelefone || null,
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
      })
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao registrar demanda' }, { status: 500 });
  }
}
