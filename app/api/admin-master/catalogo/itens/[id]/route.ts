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
    const supabase = createClient();
    const { data, error } = await supabase
      .from('catalogo_itens')
      .update({ status: body.status, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select('*')
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao moderar item:', error);
    return NextResponse.json({ success: false, error: 'Erro ao moderar item' }, { status: 500 });
  }
}
