// Caminho: C:\valente_conecta\app\api\referrals\config\route.ts
//
// Reescrita sobre Supabase (admin_configuracoes, chave='referral_config') —
// antes gravava em data/referral_config.json, que nao sobrevive a runtime
// serverless. Mantem o mesmo formato { rules, content, pixMinimo, updatedAt }
// consumido por app/admin-master/configuracoes/bonus/page.tsx e app/qr-code.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Sem isso, GET() sem argumentos e' tratado como estatico pelo Next.js e
// fica cacheado pra sempre a partir da primeira resposta.
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const CHAVE = 'referral_config';

const defaultConfig = {
  rules: [
    { id: 'usuarios_gerais', nome: 'Usuários Gerais', bonus: 10, meta: 30, ativo: true, descricao: 'R$10 por cada lote de 30 usuários novos validados' },
    { id: 'empresas_lojas', nome: 'Empresas / Lojas', bonus: 5, meta: 3, ativo: true, descricao: 'R$5 por cada lote de 3 empresas ou lojas validadas' },
    { id: 'profissionais_liberais', nome: 'Profissionais Liberais', bonus: 4, meta: 5, ativo: true, descricao: 'R$4 por cada lote de 5 profissionais liberais validados' },
  ],
  content: {
    publicHeadline: 'Ganhe dinheiro indicando!',
    publicSubtitle: 'Receba bônus por lotes de indicações validadas.',
    explanationTitle: 'Como funcionam as bonificações',
    explanationText: 'Cada bônus é liberado por lote validado: usuários gerais, empresas/lojas e profissionais liberais. Quando um lote fecha, o valor fica disponível para solicitação via PIX.',
    shareTemplate: 'Use meu código {codigo}. Bônus por lotes validados no Valente Conecta. Link: {link}',
  },
  pixMinimo: 1,
  updatedAt: new Date().toISOString(),
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
    const supabase = createClient();

    const { data: atual } = await supabase.from('admin_configuracoes').select('id, valor').eq('chave', CHAVE).maybeSingle();
    const current = atual?.valor ? JSON.parse(atual.valor) : defaultConfig;
    const next = { ...current, ...body, updatedAt: new Date().toISOString() };

    // Sem certeza de que ha' constraint UNIQUE em `chave` nesta tabela (foi
    // criada fora do versionamento) — atualiza/insere explicitamente em vez
    // de depender de upsert com onConflict.
    if (atual) {
      const { error } = await supabase.from('admin_configuracoes').update({ valor: JSON.stringify(next) }).eq('id', atual.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('admin_configuracoes')
        .insert({ chave: CHAVE, valor: JSON.stringify(next), descricao: 'Regras de bônus por indicação (lotes) e conteúdo da página de convite' });
      if (error) throw error;
    }

    return NextResponse.json({ success: true, data: next });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar configuração' }, { status: 500 });
  }
}
