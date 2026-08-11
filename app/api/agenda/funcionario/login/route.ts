// Caminho: C:\valente_conecta\app\api\agenda\funcionario\login\route.ts
//
// "Login ludico" do funcionario no painel compartilhado da recepcao: escolhe
// o proprio nome numa lista e digita o PIN — nao e' um sistema de sessao
// completo (sem cookie de longa duracao), so' identifica quem esta' operando
// o painel na hora de chamar/atender a fila.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.profissionalId || !body.pin) {
      return NextResponse.json({ success: false, error: 'profissionalId e pin são obrigatórios' }, { status: 400 });
    }
    const supabase = createClient();
    const { data, error } = await supabase.rpc('login_funcionario_agenda', {
      p_profissional_id: body.profissionalId,
      p_pin: body.pin,
    });
    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({ success: false, error: 'PIN incorreto' }, { status: 401 });
    }
    return NextResponse.json({ success: true, data: data[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao entrar' }, { status: 500 });
  }
}
