// Caminho: C:\valente_conecta\app\api\admin-master\config-boas-vindas\route.ts
//
// URL do video de boas-vindas mostrado em pop-up nas primeiras 2 aberturas
// do app apos o cadastro — guardado em admin_configuracoes
// (chave='video_boas_vindas'), mesmo padrao de config-lancamento. GET e
// publico (o pop-up precisa ler sem ser admin); so o admin master deveria
// chamar PUT. "ativo" comeca false: o admin liga manualmente quando o
// video estiver pronto, mesmo que ja tenha feito upload de um rascunho.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const CHAVE = 'video_boas_vindas';

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from('admin_configuracoes').select('valor').eq('chave', CHAVE).maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  const config = data?.valor ? JSON.parse(data.valor) : { url: null, ativo: false, atualizadoEm: null };
  return NextResponse.json({ success: true, data: config });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const supabase = createClient();
    const { data: atual } = await supabase.from('admin_configuracoes').select('valor').eq('chave', CHAVE).maybeSingle();
    const configAtual = atual?.valor ? JSON.parse(atual.valor) : { url: null, ativo: false, atualizadoEm: null };

    const novoValor = {
      url: body.url !== undefined ? body.url : configAtual.url,
      ativo: body.ativo !== undefined ? !!body.ativo : configAtual.ativo,
      atualizadoEm: new Date().toISOString(),
    };
    const valor = JSON.stringify(novoValor);

    const { data: existente } = await supabase.from('admin_configuracoes').select('id').eq('chave', CHAVE).maybeSingle();
    if (existente) {
      const { error } = await supabase.from('admin_configuracoes').update({ valor }).eq('id', existente.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('admin_configuracoes')
        .insert({ chave: CHAVE, valor, descricao: 'Vídeo de boas-vindas exibido em pop-up nas primeiras 2 aberturas do app' });
      if (error) throw error;
    }

    return NextResponse.json({ success: true, data: novoValor });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar configuração' }, { status: 500 });
  }
}
