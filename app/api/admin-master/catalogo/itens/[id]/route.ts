// Caminho: C:\valente_conecta\app\api\admin-master\catalogo\itens\[id]\route.ts
//
// Moderacao do admin master sobre qualquer item do catalogo, independente
// do dono (diferente de /api/catalogo/itens/[id], que exige dono_id).
//
// NOTA DE SEGURANCA: assim como o restante do admin-master hoje (login nao
// implementado, middleware.ts com MODO_DEV=true), esta rota nao tem checagem
// de papel proprio — fica protegida apenas pelo mesmo guard de cookie que
// protege as paginas /admin-master/* quando o modo dev for desligado. Apertar
// quando o login existir (MASTER_SPEC secao 9).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    if (body.status !== undefined) patch.status = body.status;
    if (body.destaque_posicao !== undefined) patch.destaque_posicao = body.destaque_posicao;

    const supabase = createClient();
    const { data, error } = await supabase
      .from('catalogo_itens')
      .update(patch)
      .eq('id', params.id)
      .select('*')
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Erro ao moderar item:', error);
    const mensagem = error?.code === '23505' ? 'Já existe um item nessa posição de destaque' : 'Erro ao moderar item';
    return NextResponse.json({ success: false, error: mensagem }, { status: 500 });
  }
}
