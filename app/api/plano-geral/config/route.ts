// Caminho: C:\valente_conecta\app\api\plano-geral\config\route.ts
//
// Leitura publica (tela de escolha de plano + qualquer modulo que precise
// mostrar "faltam N usos") e edicao pelo admin master (preco de cada nivel
// pago + limite de cada servico por nivel). Ver 055_plano_geral.sql.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const SERVICOS = ['carona_desbloqueio', 'fila_hospital', 'mototaxi', 'agua_gas', 'academia', 'busca_google', 'desbloqueio_contato', 'busca_inteligente_ia'] as const;
const TIERS = ['gratis', 'basico', 'ilimitado'] as const;

export async function GET() {
  const supabase = createClient();
  const [{ data: config, error: erroConfig }, { data: limites, error: erroLimites }] = await Promise.all([
    supabase.from('plano_geral_config').select('*'),
    supabase.from('plano_geral_limites').select('*'),
  ]);
  if (erroConfig) return NextResponse.json({ success: false, error: erroConfig.message }, { status: 500 });
  if (erroLimites) return NextResponse.json({ success: false, error: erroLimites.message }, { status: 500 });

  const configPorTier = new Map((config || []).map((c: any) => [c.tier, c]));
  const limitesPorTier = new Map<string, Record<string, number | null>>();
  for (const l of limites || []) {
    if (!limitesPorTier.has(l.tier)) limitesPorTier.set(l.tier, {});
    limitesPorTier.get(l.tier)![l.servico] = l.limite;
  }

  const tiers = TIERS.map((tier) => ({
    tier,
    nome: configPorTier.get(tier)?.nome || tier,
    preco: Number(configPorTier.get(tier)?.preco || 0),
    limites: limitesPorTier.get(tier) || {},
  }));

  return NextResponse.json({ success: true, data: { tiers, servicos: SERVICOS } });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const tiers = body?.tiers;
    if (!Array.isArray(tiers)) {
      return NextResponse.json({ success: false, error: 'tiers é obrigatório' }, { status: 400 });
    }

    const supabase = createClient();

    for (const t of tiers) {
      if (!TIERS.includes(t.tier)) continue;

      await supabase.from('plano_geral_config').upsert({
        tier: t.tier,
        preco: Number(t.preco || 0),
        nome: String(t.nome || t.tier),
        updated_at: new Date().toISOString(),
      });

      const limitesRows = SERVICOS.filter((s) => s in (t.limites || {})).map((servico) => ({
        tier: t.tier,
        servico,
        limite: t.limites[servico] === null || t.limites[servico] === '' ? null : Number(t.limites[servico]),
        periodo: servico === 'busca_google' || servico === 'desbloqueio_contato' || servico === 'busca_inteligente_ia' ? 'diario' : 'mensal',
        updated_at: new Date().toISOString(),
      }));
      if (limitesRows.length > 0) {
        const { error } = await supabase.from('plano_geral_limites').upsert(limitesRows, { onConflict: 'tier,servico' });
        if (error) throw error;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar configuração' }, { status: 500 });
  }
}
