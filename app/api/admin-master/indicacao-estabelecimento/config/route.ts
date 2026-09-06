// Caminho: C:\valente_conecta\app\api\admin-master\indicacao-estabelecimento\config\route.ts
//
// Config do ciclo de bônus (meta + valor) pra indicação de estabelecimento
// (ver 100_indicacao_estabelecimento_fornecedor.sql). Linha única na tabela
// (sem quebra por categoria/cidade) -- admin master decide quantas
// indicações aprovadas fecham um ciclo e quanto paga em Moeda Conecta.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('indicacao_estabelecimento_ciclo_config')
    .select('*')
    .limit(1)
    .maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const meta = Number(body.meta);
    const bonus = Number(body.bonus);
    const ativo = Boolean(body.ativo);
    if (!(meta > 0)) return NextResponse.json({ success: false, error: 'Meta precisa ser maior que zero' }, { status: 400 });
    if (!(bonus >= 0)) return NextResponse.json({ success: false, error: 'Bônus não pode ser negativo' }, { status: 400 });

    const supabase = createClient();
    const { data: atual } = await supabase.from('indicacao_estabelecimento_ciclo_config').select('id').limit(1).maybeSingle();
    if (!atual) return NextResponse.json({ success: false, error: 'Config não encontrada' }, { status: 404 });

    const { data, error } = await supabase
      .from('indicacao_estabelecimento_ciclo_config')
      .update({ meta, bonus, ativo, updated_at: new Date().toISOString() })
      .eq('id', atual.id)
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar config' }, { status: 500 });
  }
}
