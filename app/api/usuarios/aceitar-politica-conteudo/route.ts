// Caminho: C:\valente_conecta\app\api\usuarios\aceitar-politica-conteudo\route.ts
//
// Registra o aceite da politica de protecao de conteudo (lib/politicaConteudo.ts)
// pro usuario -- exigido antes de qualquer publicacao (vaga, classificado,
// curriculo etc). Usa createAdminClient porque a tabela usuarios tem RLS
// restrita em UPDATE (ver nota em lib/supabase/server.ts); a rota so' deixa
// o usuario mexer no proprio registro.

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { POLITICA_CONTEUDO_VERSAO } from '@/lib/politicaConteudo';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { usuarioId } = await request.json();
    if (!usuarioId) {
      return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const agora = new Date().toISOString();
    const { data, error } = await supabase
      .from('usuarios')
      .update({ aceitou_politica_conteudo_versao: POLITICA_CONTEUDO_VERSAO, aceitou_politica_conteudo_em: agora })
      .eq('id', usuarioId)
      .select('id, aceitou_politica_conteudo_versao, aceitou_politica_conteudo_em')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao registrar aceite' }, { status: 500 });
  }
}
