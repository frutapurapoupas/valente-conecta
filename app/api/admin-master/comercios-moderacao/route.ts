// Caminho: C:\valente_conecta\app\api\admin-master\comercios-moderacao\route.ts
//
// Liga/desliga aprovação automática das reivindicações de "Sou proprietário"
// (ver 056_comercios_diretorio.sql).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient();
  const { data } = await supabase.from('admin_configuracoes').select('valor').eq('chave', 'comercios_moderacao').maybeSingle();
  const auto = data?.valor ? Boolean(JSON.parse(data.valor).auto) : false;
  return NextResponse.json({ success: true, data: { auto } });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const valor = JSON.stringify({ auto: Boolean(body.auto) });
    const supabase = createClient();

    const { data: atual } = await supabase.from('admin_configuracoes').select('id').eq('chave', 'comercios_moderacao').maybeSingle();
    if (atual) {
      const { error } = await supabase.from('admin_configuracoes').update({ valor }).eq('id', atual.id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('admin_configuracoes').insert({ chave: 'comercios_moderacao', valor });
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar' }, { status: 500 });
  }
}
