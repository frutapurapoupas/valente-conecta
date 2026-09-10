// Caminho: C:\valente_conecta\app\api\saude-fila\[unidadeId]\prontuario\exportar\route.ts
//
// Backup externo do prontuario (ver proposta "Modo Valente Facil", item
// 5 -- "podendo fazer backup externo"). So' o diretor da unidade pode
// baixar. Formato JSON simples, pensado pra guardar/importar depois, nao
// pra ser bonito de ler.

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { nivelDoUsuarioNaUnidade } from '@/lib/saude/nivelAcesso';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { unidadeId: string } }) {
  const { searchParams } = new URL(request.url);
  const usuarioId = searchParams.get('usuarioId');
  if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });

  const supabase = createAdminClient();
  const nivel = await nivelDoUsuarioNaUnidade(supabase, params.unidadeId, usuarioId);
  if (nivel !== 'administrar') return NextResponse.json({ success: false, error: 'Só o diretor pode exportar o prontuário.' }, { status: 403 });

  const { data: unidade } = await supabase.from('unidades_saude').select('nome').eq('id', params.unidadeId).maybeSingle();
  const { data: registros, error } = await supabase
    .from('prontuarios')
    .select('id, tipo, titulo, conteudo, anexo_url, created_at, usuarios!usuario_id(nome, whatsapp), criado_por')
    .eq('unidade_id', params.unidadeId)
    .order('created_at', { ascending: true });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const backup = {
    unidade: unidade?.nome,
    exportadoEm: new Date().toISOString(),
    totalRegistros: registros?.length || 0,
    registros,
  };

  return new NextResponse(JSON.stringify(backup, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="prontuario-backup-${params.unidadeId}.json"`,
    },
  });
}
