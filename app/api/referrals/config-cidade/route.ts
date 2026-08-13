// Caminho: C:\valente_conecta\app\api\referrals\config-cidade\route.ts
//
// Leitura publica das regras de bonus por indicacao de uma cidade (usada
// por /qr-code pra saber meta/valor de cada categoria). Cidade sem
// configuracao ainda recebe uma sugestao (ativo=false) em vez de nada —
// o admin master decide se liga em app/admin-master/configuracoes/bonus.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const CATEGORIAS_PADRAO = [
  { categoria: 'usuarios_gerais', nome: 'Usuários Gerais', bonus: 10, meta: 30, ativo: false, descricao: 'Moeda Conecta por lote de usuários novos validados' },
  { categoria: 'empresas_lojas', nome: 'Empresas / Lojas', bonus: 5, meta: 3, ativo: false, descricao: 'Moeda Conecta por lote de empresas ou lojas validadas' },
  { categoria: 'profissionais_liberais', nome: 'Profissionais Liberais', bonus: 4, meta: 5, ativo: false, descricao: 'Moeda Conecta por lote de profissionais liberais validados' },
];

export async function GET(request: NextRequest) {
  const cidade = String(request.nextUrl.searchParams.get('cidade') || '').trim().toUpperCase();
  if (!cidade) return NextResponse.json({ success: false, error: 'cidade é obrigatória' }, { status: 400 });

  const supabase = createClient();
  const { data, error } = await supabase.from('referral_config_cidades').select('*').eq('cidade', cidade);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const existentes = new Map((data || []).map((r: any) => [r.categoria, r]));
  const rules = CATEGORIAS_PADRAO.map((padrao) => existentes.get(padrao.categoria) || { ...padrao, cidade });

  return NextResponse.json({ success: true, data: { cidade, rules } });
}
