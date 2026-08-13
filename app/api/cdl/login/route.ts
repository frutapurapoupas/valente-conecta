// Caminho: C:\valente_conecta\app\api\cdl\login\route.ts
// Login do representante do CDL via PIN — mesmo padrao do funcionario da Agenda.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const representanteId = String(body.representanteId || '').trim();
    const pin = String(body.pin || '').trim();
    if (!representanteId || !pin) return NextResponse.json({ success: false, error: 'Informe o representante e o PIN' }, { status: 400 });

    const supabase = createClient();
    const { data, error } = await supabase.rpc('login_representante_cdl', { p_representante_id: representanteId, p_pin: pin });
    if (error) throw error;

    const representante = data?.[0];
    if (!representante) return NextResponse.json({ success: false, error: 'PIN incorreto' }, { status: 401 });

    return NextResponse.json({ success: true, data: representante });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao entrar' }, { status: 400 });
  }
}
