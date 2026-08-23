// Caminho: C:\valente_conecta\app\api\admin-master\usuarios\[id]\plano\route.ts
//
// Admin master troca o nível do Plano Geral de um usuário específico
// (055_plano_geral.sql). Escreve direto em usuarios.plano_geral/
// plano_geral_valido_ate — mesmos campos que o webhook do Mercado Pago já
// escreve quando um pagamento é confirmado, então a RPC
// plano_geral_verificar_e_consumir já sabe ler isso sem nenhuma mudança.
//
// Usa createAdminClient (service role): a tabela usuarios tem RLS que
// bloqueia UPDATE pela chave anon (confirmado testando -- bom sinal, evita
// que qualquer visitante edite wallet/pix_key de outro usuário direto pela
// API pública). Rota já é admin-master, então o bypass aqui é seguro.

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const TIERS_VALIDOS = ['gratis', 'basico', 'ilimitado'];

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const tier = String(body.tier || '').trim();
    if (!TIERS_VALIDOS.includes(tier)) {
      return NextResponse.json({ success: false, error: `tier deve ser um de: ${TIERS_VALIDOS.join(', ')}` }, { status: 400 });
    }

    const patch: Record<string, any> = { plano_geral: tier };
    if (tier === 'gratis') {
      patch.plano_geral_valido_ate = null;
    } else if (body.validoAte !== undefined) {
      patch.plano_geral_valido_ate = body.validoAte || null;
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('usuarios')
      .update(patch)
      .eq('id', params.id)
      .select('id, plano_geral, plano_geral_valido_ate')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Erro ao trocar plano do usuário:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erro ao trocar plano' }, { status: 500 });
  }
}
