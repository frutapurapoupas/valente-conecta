// Caminho: C:\valente_conecta\app\api\admin-master\usuarios\[id]\plano-excecoes\route.ts
//
// Bloquear, liberar (ilimitado) ou dar limite customizado num serviço
// específico do Plano Geral pra um usuário específico, sem mudar o nível
// dele inteiro (066_plano_geral_excecoes_usuario.sql). GET lista as
// exceções ativas; PUT cria/atualiza/remove uma por serviço.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const SERVICOS_VALIDOS = ['carona_desbloqueio', 'fila_hospital', 'mototaxi', 'agua_gas', 'academia', 'busca_google'];
const MODOS_VALIDOS = ['bloqueado', 'ilimitado', 'limite_customizado', 'padrao'];

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('plano_geral_excecoes_usuario')
    .select('servico, modo, limite_customizado, motivo, updated_at')
    .eq('usuario_id', params.id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || [] });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const servico = String(body.servico || '').trim();
    const modo = String(body.modo || '').trim();

    if (!SERVICOS_VALIDOS.includes(servico)) {
      return NextResponse.json({ success: false, error: `servico deve ser um de: ${SERVICOS_VALIDOS.join(', ')}` }, { status: 400 });
    }
    if (!MODOS_VALIDOS.includes(modo)) {
      return NextResponse.json({ success: false, error: `modo deve ser um de: ${MODOS_VALIDOS.join(', ')}` }, { status: 400 });
    }

    const supabase = createClient();

    // "padrao" = sem excecao, volta a usar so' o limite do tier.
    if (modo === 'padrao') {
      const { error } = await supabase
        .from('plano_geral_excecoes_usuario')
        .delete()
        .eq('usuario_id', params.id)
        .eq('servico', servico);
      if (error) throw error;
      return NextResponse.json({ success: true, removida: true });
    }

    const limiteCustomizado = modo === 'limite_customizado' ? Number(body.limiteCustomizado) : null;
    if (modo === 'limite_customizado' && (!Number.isFinite(limiteCustomizado) || limiteCustomizado! < 0)) {
      return NextResponse.json({ success: false, error: 'limiteCustomizado deve ser um número >= 0' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('plano_geral_excecoes_usuario')
      .upsert(
        {
          usuario_id: params.id,
          servico,
          modo,
          limite_customizado: limiteCustomizado,
          motivo: body.motivo?.trim() || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'usuario_id,servico' }
      )
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Erro ao salvar exceção de plano:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar exceção' }, { status: 500 });
  }
}
