// Caminho: C:\valente_conecta\app\api\carona\motoristas\route.ts
//
// Cadastro de motorista da Carona Solidaria. Exige as 3 fotos de verdade
// (rosto, veiculo, CNH) — mesmo padrao aplicado ao Moto Taxi em
// 040_mototaxi_fotos_e_encomenda.sql — porque essas fotos sao mostradas
// pro caronista antes dele pagar pra desbloquear o contato. Usa a
// identidade real (usuarios.id via getCurrentUser no client) em vez do id
// anonimo por navegador usado no Moto Taxi, porque aqui tem dinheiro
// entrando (taxa de exibicao) e saindo (desbloqueio) de verdade — precisa
// de alguem rastreavel, nao so' um uuid de dispositivo.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const usuarioId = request.nextUrl.searchParams.get('usuarioId');
  const id = request.nextUrl.searchParams.get('id');
  if (!usuarioId && !id) return NextResponse.json({ success: false, error: 'usuarioId ou id é obrigatório' }, { status: 400 });

  const supabase = createClient();
  let query = supabase.from('carona_motoristas').select('*');
  query = usuarioId ? query.eq('usuario_id', usuarioId) : query.eq('id', id);
  const { data, error } = await query.maybeSingle();
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, data: data || null });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const obrigatorios = ['usuarioId', 'nome', 'telefone', 'fotoUrl', 'veiculoFotoUrl', 'cnhFotoUrl', 'veiculo', 'placa', 'cnhNumero'];
    for (const campo of obrigatorios) {
      if (!body?.[campo]) return NextResponse.json({ success: false, error: `Campo obrigatório: ${campo}` }, { status: 400 });
    }
    if (!body.cnhValida) return NextResponse.json({ success: false, error: 'CNH inválida. Não é possível concluir o cadastro.' }, { status: 400 });

    const supabase = createClient();
    const { data, error } = await supabase
      .from('carona_motoristas')
      .upsert(
        {
          usuario_id: body.usuarioId,
          nome: body.nome,
          telefone: body.telefone,
          foto_url: body.fotoUrl,
          veiculo_foto_url: body.veiculoFotoUrl,
          cnh_foto_url: body.cnhFotoUrl,
          veiculo: body.veiculo,
          placa: String(body.placa).toUpperCase(),
          cnh_numero: body.cnhNumero,
          cnh_valida: !!body.cnhValida,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'usuario_id' }
      )
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao cadastrar motorista' }, { status: 400 });
  }
}
