// Caminho: C:\valente_conecta\app\api\empregos\vagas\[id]\route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const STATUS_VAGA_PARA_ITEM: Record<string, string> = {
  aberta: 'ativo',
  em_andamento: 'ativo',
  fechada: 'pausado',
};

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dados = await request.json();
    const supabase = createClient();

    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    if (dados.titulo !== undefined) patch.titulo = dados.titulo;
    if (dados.descricao !== undefined) patch.descricao_publica = dados.descricao;
    if (dados.salarioMin !== undefined) patch.preco = dados.salarioMin;
    if (dados.tipo !== undefined) patch.categoria = dados.tipo;
    if (dados.status !== undefined) patch.status = STATUS_VAGA_PARA_ITEM[dados.status] || 'ativo';

    const metadataPatch: Record<string, any> = {};
    for (const campo of ['empresa', 'requisitos', 'beneficios', 'tipo', 'modalidade', 'nivel', 'salarioMax', 'localizacao', 'link']) {
      if (dados[campo] !== undefined) metadataPatch[campo] = dados[campo];
    }
    if (Object.keys(metadataPatch).length > 0) {
      const { data: atual } = await supabase.from('catalogo_itens').select('metadata').eq('id', params.id).maybeSingle();
      patch.metadata = { ...(atual?.metadata || {}), ...metadataPatch };
    }

    const { error } = await supabase.from('catalogo_itens').update(patch).eq('id', params.id);
    if (error) throw error;
    return NextResponse.json({ success: true, data: { id: params.id, ...dados } });
  } catch (error) {
    console.error('Erro ao atualizar vaga:', error);
    return NextResponse.json({ success: false, error: 'Erro ao atualizar vaga' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { error } = await supabase.from('catalogo_itens').update({ status: 'removido' }).eq('id', params.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover vaga:', error);
    return NextResponse.json({ success: false, error: 'Erro ao remover vaga' }, { status: 500 });
  }
}
