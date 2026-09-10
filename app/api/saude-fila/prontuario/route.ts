// Caminho: C:\valente_conecta\app\api\saude-fila\prontuario\route.ts
//
// Prontuario (ver proposta "Modo Valente Facil", item 5, e
// 108_fila_saude_prontuario.sql). So' le/escreve quem e' o proprio
// paciente ou tem nivel 'administrar'/'atender' na unidade -- dado
// sensivel de saude (LGPD), acesso restrito de verdade, checado aqui.

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { nivelDoUsuarioNaUnidade, podeAtender } from '@/lib/saude/nivelAcesso';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

async function podeVer(supabase: any, unidadeId: string, usuarioAlvoId: string, solicitanteId: string) {
  if (solicitanteId === usuarioAlvoId) return true;
  const nivel = await nivelDoUsuarioNaUnidade(supabase, unidadeId, solicitanteId);
  return podeAtender(nivel);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const usuarioId = searchParams.get('usuarioId');
  const unidadeId = searchParams.get('unidadeId');
  const solicitanteId = searchParams.get('solicitanteId');
  if (!usuarioId || !solicitanteId) {
    return NextResponse.json({ success: false, error: 'usuarioId e solicitanteId são obrigatórios' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Sem unidadeId so' e' permitido o proprio paciente ver o historico
  // completo dele (todas as unidades) -- pra equipe, unidadeId e'
  // obrigatorio (so' pode ver o que aconteceu NA unidade dela).
  if (!unidadeId) {
    if (solicitanteId !== usuarioId) {
      return NextResponse.json({ success: false, error: 'Sem permissão pra ver esse prontuário.' }, { status: 403 });
    }
    const { data, error } = await supabase
      .from('prontuarios')
      .select('*, unidades_saude(nome)')
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data: data || [] });
  }

  if (!(await podeVer(supabase, unidadeId, usuarioId, solicitanteId))) {
    return NextResponse.json({ success: false, error: 'Sem permissão pra ver esse prontuário.' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('prontuarios')
    .select('*, usuarios!criado_por(nome)')
    .eq('usuario_id', usuarioId)
    .eq('unidade_id', unidadeId)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const usuarioId = String(body.usuarioId || '').trim();
    const unidadeId = String(body.unidadeId || '').trim();
    const criadoPor = String(body.criadoPor || '').trim();
    const titulo = String(body.titulo || '').trim();
    const tipo = String(body.tipo || '').trim();

    if (!usuarioId || !unidadeId || !criadoPor || !titulo || !['historico', 'fixo', 'exame'].includes(tipo)) {
      return NextResponse.json({ success: false, error: 'Dados obrigatórios ausentes ou inválidos' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const nivel = await nivelDoUsuarioNaUnidade(supabase, unidadeId, criadoPor);
    if (!podeAtender(nivel)) return NextResponse.json({ success: false, error: 'Sem permissão pra registrar prontuário nessa unidade.' }, { status: 403 });

    const { data, error } = await supabase
      .from('prontuarios')
      .insert({
        usuario_id: usuarioId,
        unidade_id: unidadeId,
        senha_id: body.senhaId || null,
        tipo,
        titulo,
        conteudo: body.conteudo || null,
        anexo_url: body.anexoUrl || null,
        criado_por: criadoPor,
      })
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Erro ao registrar prontuário:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Erro interno' }, { status: 500 });
  }
}
