// Caminho: C:\valente_conecta\app\api\admin-master\pdv\importacao-fotos-config\route.ts
//
// Toggle de aprovação automática vs manual pra foto enviada pelo lojista
// substituindo o placeholder de item importado por planilha. Guardado em
// admin_configuracoes (chave='pdv_importacao_moderacao_fotos'), mesmo
// padrão de config-carrossel/route.ts. Nasce com auto=false (manual) —
// mais conservador enquanto a feature é nova.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const CHAVE = 'pdv_importacao_moderacao_fotos';

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from('admin_configuracoes').select('valor').eq('chave', CHAVE).maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  const config = data?.valor ? JSON.parse(data.valor) : { auto: false };
  return NextResponse.json({ success: true, data: config });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const auto = Boolean(body.auto);

    const supabase = createClient();
    const { error } = await supabase
      .from('admin_configuracoes')
      .upsert(
        { chave: CHAVE, valor: JSON.stringify({ auto }), descricao: 'Aprovação automática de foto enviada em item importado por planilha' },
        { onConflict: 'chave' }
      );
    if (error) throw error;

    return NextResponse.json({ success: true, data: { auto } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar configuração' }, { status: 500 });
  }
}
