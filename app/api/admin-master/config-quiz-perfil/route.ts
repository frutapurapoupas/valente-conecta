// Caminho: C:\valente_conecta\app\api\admin-master\config-quiz-perfil\route.ts
//
// Liga/desliga o quiz de perfil pos-cadastro (admin_configuracoes,
// chave='quiz_perfil_config'), mesmo padrao de config-boas-vindas. GET
// publico (o pop-up precisa ler sem ser admin); comeca ATIVO por padrao
// (diferente do video de boas-vindas, que comeca desligado porque o
// arquivo ainda nao existia — aqui o conteudo já está pronto).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const CHAVE = 'quiz_perfil_config';

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from('admin_configuracoes').select('valor').eq('chave', CHAVE).maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  const config = data?.valor ? JSON.parse(data.valor) : { ativo: true };
  return NextResponse.json({ success: true, data: config });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const valor = JSON.stringify({ ativo: !!body.ativo });

    const supabase = createClient();
    const { data: existente } = await supabase.from('admin_configuracoes').select('id').eq('chave', CHAVE).maybeSingle();
    if (existente) {
      const { error } = await supabase.from('admin_configuracoes').update({ valor }).eq('id', existente.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('admin_configuracoes')
        .insert({ chave: CHAVE, valor, descricao: 'Liga/desliga o quiz de perfil pós-cadastro' });
      if (error) throw error;
    }

    return NextResponse.json({ success: true, data: { ativo: !!body.ativo } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar configuração' }, { status: 500 });
  }
}
