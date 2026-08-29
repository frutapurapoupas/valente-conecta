// Caminho: C:\valente_conecta\app\api\pdv\cron\lembrete-estoque\route.ts
//
// Disparado semanalmente pelo Vercel Cron (ver vercel.json). Como o estoque
// do PDV colaborativo ainda nao tem atualizacao instantanea (sem integracao
// de PDV/ERP externo — decisao conhecida do dono do produto), avisa por
// push todo fornecedor com pelo menos um item ativo em pdv_estoque_itens
// pra conferir quantidade/preco. No maximo um lembrete por fornecedor a
// cada 7 dias (perfis_fornecedor.lembrete_estoque_enviado_em, ver
// 085_pdv_lembrete_estoque.sql). O link leva pro mesmo "quiz" usado pra
// responder demanda (app/pdv/responder-demanda) — o fornecedor escaneia
// o produto e so' confirma preco/quantidade, sem re-cadastrar nada.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enviarPushParaUsuario } from '@/lib/push';

const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const supabase = createClient();

    const { data: itensAtivos, error: erroItens } = await supabase
      .from('pdv_estoque_itens')
      .select('usuario_id')
      .eq('ativo', true);
    if (erroItens) throw erroItens;

    const fornecedorIds = Array.from(new Set((itensAtivos || []).map((i: any) => i.usuario_id)));
    if (!fornecedorIds.length) return NextResponse.json({ success: true, fornecedoresVerificados: 0, lembretesEnviados: 0 });

    const { data: perfis, error: erroPerfis } = await supabase
      .from('perfis_fornecedor')
      .select('usuario_id, lembrete_estoque_enviado_em')
      .in('usuario_id', fornecedorIds);
    if (erroPerfis) throw erroPerfis;

    const agora = Date.now();
    let lembretesEnviados = 0;

    for (const perfil of perfis || []) {
      const ultimoEnvio = perfil.lembrete_estoque_enviado_em ? new Date(perfil.lembrete_estoque_enviado_em).getTime() : 0;
      if (agora - ultimoEnvio < SETE_DIAS_MS) continue;

      try {
        await enviarPushParaUsuario(perfil.usuario_id as string, {
          titulo: 'Hora de conferir seu estoque',
          corpo: 'Escaneie seus produtos e confirme se preço e quantidade ainda estão certos no Valente Conecta.',
          url: '/pdv/responder-demanda',
        });
        lembretesEnviados += 1;
      } catch {
        // segue sem quebrar o loop
      }

      await supabase
        .from('perfis_fornecedor')
        .update({ lembrete_estoque_enviado_em: new Date().toISOString() })
        .eq('usuario_id', perfil.usuario_id);
    }

    return NextResponse.json({ success: true, fornecedoresVerificados: (perfis || []).length, lembretesEnviados });
  } catch (error: any) {
    console.error('Erro no cron de lembrete de estoque do PDV:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Erro interno.' }, { status: 500 });
  }
}
