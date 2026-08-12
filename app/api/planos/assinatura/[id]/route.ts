// Caminho: C:\valente_conecta\app\api\planos\assinatura\[id]\route.ts
// Consulta uma assinatura especifica (poll de status apos ir pro Mercado
// Pago) e grava os dados complementares do negocio depois que o pagamento
// foi confirmado.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase.from('assinaturas_planos').select('*').eq('id', params.id).maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ success: false, error: 'Assinatura não encontrada' }, { status: 404 });
  return NextResponse.json({ success: true, data });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    if (!body.dadosComplementares) {
      return NextResponse.json({ success: false, error: 'dadosComplementares é obrigatório' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: atual, error: erroAtual } = await supabase
      .from('assinaturas_planos')
      .select('status')
      .eq('id', params.id)
      .maybeSingle();
    if (erroAtual) throw erroAtual;
    if (!atual || !['pago', 'ativo'].includes(atual.status)) {
      return NextResponse.json({ success: false, error: 'Essa assinatura ainda não está paga' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('assinaturas_planos')
      .update({ dados_complementares: body.dadosComplementares, status: 'ativo', atualizado_em: new Date().toISOString() })
      .eq('id', params.id)
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar dados' }, { status: 500 });
  }
}
