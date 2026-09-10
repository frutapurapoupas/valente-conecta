// Caminho: C:\valente_conecta\app\api\saude-fila\[unidadeId]\concluir\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { nivelDoUsuarioNaUnidade, podeAtender } from '@/lib/saude/nivelAcesso';
import { avisarDeslocamentoSeNecessario } from '@/lib/saude/avisos';

export async function POST(request: NextRequest, { params }: { params: { unidadeId: string } }) {
  try {
    const body = await request.json();
    const senhaId = String(body.senhaId || '').trim();
    const usuarioId = String(body.usuarioId || '').trim();
    if (!senhaId || !usuarioId) return NextResponse.json({ success: false, error: 'senhaId e usuarioId são obrigatórios' }, { status: 400 });

    const supabase = createAdminClient();
    const nivel = await nivelDoUsuarioNaUnidade(supabase, params.unidadeId, usuarioId);
    if (!podeAtender(nivel)) return NextResponse.json({ success: false, error: 'Sem permissão pra concluir atendimento nessa unidade.' }, { status: 403 });

    const { data, error } = await supabase
      .from('fila_saude_senhas')
      .update({ status: 'concluido', concluido_em: new Date().toISOString() })
      .eq('id', senhaId)
      .eq('unidade_id', params.unidadeId)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ success: false, error: 'Senha não encontrada' }, { status: 404 });

    await avisarDeslocamentoSeNecessario(supabase, params.unidadeId);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Erro interno' }, { status: 500 });
  }
}
