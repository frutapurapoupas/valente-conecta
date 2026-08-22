// Caminho: C:\valente_conecta\app\api\admin-master\pdv\captura-externa\route.ts
// Visibilidade do admin master sobre quem está no "modo espião" e quantas
// capturas estão pendentes de cada um.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { obterNomesFornecedoresPublico } from '@/lib/catalogo/catalogoService';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = createClient();
    const [{ data: modos, error: erroModos }, { data: capturas, error: erroCapturas }] = await Promise.all([
      supabase.from('pdv_modo_externo').select('usuario_id, ativo, ativado_em').eq('ativo', true),
      supabase.from('pdv_capturas_externas').select('usuario_id, status'),
    ]);
    if (erroModos) throw erroModos;
    if (erroCapturas) throw erroCapturas;

    const nomes = await obterNomesFornecedoresPublico((modos || []).map((m) => m.usuario_id));

    const pendentesPorUsuario = new Map<string, number>();
    for (const c of capturas || []) {
      if (c.status === 'pendente') pendentesPorUsuario.set(c.usuario_id, (pendentesPorUsuario.get(c.usuario_id) || 0) + 1);
    }

    const comerciantes = (modos || []).map((m) => ({
      usuarioId: m.usuario_id,
      nome: nomes[m.usuario_id] || 'Comerciante',
      ativadoEm: m.ativado_em,
      capturasPendentes: pendentesPorUsuario.get(m.usuario_id) || 0,
    }));

    return NextResponse.json({
      success: true,
      data: { totalAtivos: comerciantes.length, totalCapturas: (capturas || []).length, comerciantes },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao gerar relatório' }, { status: 500 });
  }
}
