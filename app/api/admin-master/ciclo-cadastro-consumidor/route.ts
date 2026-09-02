// Caminho: C:\valente_conecta\app\api\admin-master\ciclo-cadastro-consumidor\route.ts
//
// Admin master configura, por categoria de produto, quantos cadastros de
// consumidor aprovados fecham um ciclo e o valor do bonus em Moeda Conecta
// (ver consumidor_cadastro_ciclo_config em 093_cadastro_consumidor_produto.sql).
// GET sempre devolve as 7 categorias fixas (mesmo sem linha salva ainda,
// preenchendo default inativo) pra tela não precisar tratar "categoria sem
// config" como caso especial.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const CATEGORIAS = ['mercado', 'farmacia', 'auto_pecas', 'acougue', 'moda', 'papelaria', 'geral'] as const;

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from('consumidor_cadastro_ciclo_config').select('*');
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  const mapa = new Map((data || []).map((c: any) => [c.categoria, c]));
  const resultado = CATEGORIAS.map((categoria) => mapa.get(categoria) || { categoria, meta: 1, bonus: 0, ativo: false });

  return NextResponse.json({ success: true, data: resultado });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const categoria = String(body.categoria || '').trim();
    const meta = Number(body.meta);
    const bonus = Number(body.bonus);
    const ativo = !!body.ativo;

    if (!CATEGORIAS.includes(categoria as any)) return NextResponse.json({ success: false, error: 'categoria inválida' }, { status: 400 });
    if (!Number.isFinite(meta) || meta <= 0) return NextResponse.json({ success: false, error: 'meta deve ser maior que zero' }, { status: 400 });
    if (!Number.isFinite(bonus) || bonus < 0) return NextResponse.json({ success: false, error: 'bônus inválido' }, { status: 400 });

    const supabase = createClient();
    const { data, error } = await supabase
      .from('consumidor_cadastro_ciclo_config')
      .upsert({ categoria, meta, bonus, ativo, updated_at: new Date().toISOString() }, { onConflict: 'categoria' })
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar configuração' }, { status: 500 });
  }
}
