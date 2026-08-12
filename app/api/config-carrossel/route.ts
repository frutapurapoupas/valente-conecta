// Caminho: C:\valente_conecta\app\api\config-carrossel\route.ts
//
// Intervalo (em segundos) do avanco automatico do carrossel da home —
// guardado em admin_configuracoes (chave='carrossel_home'), mesmo padrao
// de referral_config/cozinha_descontos. Editavel pelo admin master em
// /admin-master/configuracoes/carrossel.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const CHAVE = 'carrossel_home';
const DEFAULT_INTERVALO = 5;

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from('admin_configuracoes').select('valor').eq('chave', CHAVE).maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  const config = data?.valor ? JSON.parse(data.valor) : { intervaloSegundos: DEFAULT_INTERVALO };
  return NextResponse.json({ success: true, data: config });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const intervaloSegundos = Math.max(2, Number(body.intervaloSegundos ?? DEFAULT_INTERVALO));

    const supabase = createClient();
    const { error } = await supabase
      .from('admin_configuracoes')
      .upsert(
        { chave: CHAVE, valor: JSON.stringify({ intervaloSegundos }), descricao: 'Intervalo (segundos) do avanço automático do carrossel da home' },
        { onConflict: 'chave' }
      );
    if (error) throw error;

    return NextResponse.json({ success: true, data: { intervaloSegundos } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar configuração' }, { status: 500 });
  }
}
