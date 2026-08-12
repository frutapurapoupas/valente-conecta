// Caminho: C:\valente_conecta\app\api\admin-master\config-lancamento\route.ts
//
// URL do video de apresentacao mostrado em /lancamento — guardado em
// admin_configuracoes (chave='lancamento_video'), mesmo padrao de
// app/api/referrals/config/route.ts. GET e publico (a home/lancamento
// precisa ler sem ser admin); so o admin master deveria chamar PUT
// (a tela fica em /admin-master, mas nao ha guarda de sessao real ainda —
// mesma ressalva de seguranca do resto do projeto).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const CHAVE = 'lancamento_video';

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from('admin_configuracoes').select('valor').eq('chave', CHAVE).maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  const config = data?.valor ? JSON.parse(data.valor) : { url: null, atualizadoEm: null };
  return NextResponse.json({ success: true, data: config });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.url) return NextResponse.json({ success: false, error: 'url é obrigatória' }, { status: 400 });

    const supabase = createClient();
    const valor = JSON.stringify({ url: body.url, atualizadoEm: new Date().toISOString() });

    const { data: atual } = await supabase.from('admin_configuracoes').select('id').eq('chave', CHAVE).maybeSingle();
    if (atual) {
      const { error } = await supabase.from('admin_configuracoes').update({ valor }).eq('id', atual.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('admin_configuracoes')
        .insert({ chave: CHAVE, valor, descricao: 'URL do vídeo de apresentação mostrado em /lancamento' });
      if (error) throw error;
    }

    return NextResponse.json({ success: true, data: { url: body.url } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar configuração' }, { status: 500 });
  }
}
