// Caminho: C:\valente_conecta\app\api\admin-master\comunicados\[id]\route.ts
// Aprova+publica (ou arquiva/rejeita) uma sugestao da IA, ou arquiva
// qualquer comunicado ja publicado.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const acao = body.acao;
    if (!['publicar', 'arquivar'].includes(acao)) return NextResponse.json({ success: false, error: 'ação inválida' }, { status: 400 });

    const supabase = createClient();
    const patch: Record<string, any> = { status: acao === 'publicar' ? 'publicado' : 'arquivado' };
    if (acao === 'publicar') {
      patch.publicado_em = new Date().toISOString();
      patch.aprovado_por = body.adminId || null;
      if (body.titulo) patch.titulo = String(body.titulo).trim();
      if (body.mensagem) patch.mensagem = String(body.mensagem).trim();
    }

    const { data, error } = await supabase.from('comunicados').update(patch).eq('id', params.id).select('*').single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao atualizar' }, { status: 400 });
  }
}
