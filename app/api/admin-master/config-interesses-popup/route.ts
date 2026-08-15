// Caminho: C:\valente_conecta\app\api\admin-master\config-interesses-popup\route.ts
//
// Liga/desliga o pop-up periódico de itens de interesse + define o
// intervalo mínimo entre exibições (admin_configuracoes,
// chave='interesses_popup_config'), mesmo padrão de config-boas-vindas.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const CHAVE = 'interesses_popup_config';

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from('admin_configuracoes').select('valor').eq('chave', CHAVE).maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  const config = data?.valor ? JSON.parse(data.valor) : { ativo: true, intervaloHoras: 24 };
  return NextResponse.json({ success: true, data: config });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const valor = JSON.stringify({ ativo: !!body.ativo, intervaloHoras: Number(body.intervaloHoras) || 24 });

    const supabase = createClient();
    const { data: existente } = await supabase.from('admin_configuracoes').select('id').eq('chave', CHAVE).maybeSingle();
    if (existente) {
      const { error } = await supabase.from('admin_configuracoes').update({ valor }).eq('id', existente.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('admin_configuracoes')
        .insert({ chave: CHAVE, valor, descricao: 'Pop-up periódico de itens de interesse pro usuário' });
      if (error) throw error;
    }

    return NextResponse.json({ success: true, data: JSON.parse(valor) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar configuração' }, { status: 500 });
  }
}
