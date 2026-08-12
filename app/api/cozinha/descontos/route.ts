// Caminho: C:\valente_conecta\app\api\cozinha\descontos\route.ts
//
// Percentuais de desconto por perfil de cliente (publico/assinante/
// revendedor) da Cozinha Chef Neide — antes eram fixos no codigo
// (constants/cozinhaConstants.ts: DESCONTO_ASSINANTE=15, DESCONTO_REVENDEDOR=19).
// Agora o admin da cozinha configura pela tela
// /admin-master/cozinha-chef/descontos, guardado em admin_configuracoes
// (chave='cozinha_descontos'), mesmo padrao de referral_config.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DESCONTO_ASSINANTE, DESCONTO_REVENDEDOR, MINIMO_PORCOES_ASSINANTE } from '@/constants/cozinhaConstants';

export const dynamic = 'force-dynamic';

const CHAVE = 'cozinha_descontos';

const defaultConfig = {
  descontoAssinante: DESCONTO_ASSINANTE,
  descontoRevendedor: DESCONTO_REVENDEDOR,
  minimoPorcoesAssinante: MINIMO_PORCOES_ASSINANTE,
};

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from('admin_configuracoes').select('valor').eq('chave', CHAVE).maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  const config = data?.valor ? JSON.parse(data.valor) : defaultConfig;
  return NextResponse.json({ success: true, data: config });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const config = {
      descontoAssinante: Number(body.descontoAssinante ?? defaultConfig.descontoAssinante),
      descontoRevendedor: Number(body.descontoRevendedor ?? defaultConfig.descontoRevendedor),
      minimoPorcoesAssinante: Number(body.minimoPorcoesAssinante ?? defaultConfig.minimoPorcoesAssinante),
    };

    // Upsert direto por chave (existe constraint UNIQUE em admin_configuracoes.chave
    // — confirmado pelo erro "admin_configuracoes_chave_key" ao tentar inserir
    // duplicado). Evita a corrida do padrao antigo "select, depois insere-ou-atualiza".
    const supabase = createClient();
    const { error } = await supabase
      .from('admin_configuracoes')
      .upsert(
        { chave: CHAVE, valor: JSON.stringify(config), descricao: 'Percentuais de desconto por perfil de cliente da Cozinha Chef Neide' },
        { onConflict: 'chave' }
      );
    if (error) throw error;

    return NextResponse.json({ success: true, data: config });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar configuração' }, { status: 500 });
  }
}
