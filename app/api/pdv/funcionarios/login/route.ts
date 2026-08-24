// Caminho: C:\valente_conecta\app\api\pdv\funcionarios\login\route.ts
//
// Login do operador num terminal do PDV: escolhe o nome numa lista (já
// filtrada pela loja) e digita o PIN. RPC devolve vazio se não bater —
// não vaza se o funcionário existe, mesmo padrão de
// app/api/agenda/funcionario/login/route.ts.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const funcionarioId = String(body.funcionarioId || '').trim();
    const pin = String(body.pin || '').trim();
    if (!funcionarioId || !pin) return NextResponse.json({ success: false, error: 'funcionarioId e pin são obrigatórios' }, { status: 400 });

    const supabase = createClient();
    const { data, error } = await supabase
      .rpc('login_funcionario_pdv', { p_funcionario_id: funcionarioId, p_pin: pin })
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ success: false, error: 'PIN incorreto' }, { status: 401 });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao entrar' }, { status: 500 });
  }
}
