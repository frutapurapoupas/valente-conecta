// Caminho: C:\valente_conecta\app\api\admin-master\agenda\route.ts
// Admin master libera/revoga o modulo Agenda+Fila por loja — gratis ou
// pago, a criterio dele (campo `gratuito`).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET() sem argumentos e' tratado como estatico pelo Next.js e fica
// cacheado pra sempre a partir da primeira resposta — ja' caiu nessa com
// /api/admin-master/fiado, corrigindo de saida aqui.
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from('agenda_habilitacoes').select('*').order('solicitado_em', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || [] });
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });
    const body = await request.json();

    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    if (body.ativo !== undefined) {
      patch.ativo = body.ativo;
      patch.liberado_em = body.ativo ? new Date().toISOString() : null;
    }
    if (body.gratuito !== undefined) patch.gratuito = body.gratuito;
    if (body.observacao !== undefined) patch.observacao = body.observacao;
    if (body.exige_cadastro_previo !== undefined) patch.exige_cadastro_previo = body.exige_cadastro_previo;

    const supabase = createClient();
    const { data, error } = await supabase.from('agenda_habilitacoes').update(patch).eq('id', id).select('*').single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao atualizar' }, { status: 500 });
  }
}
