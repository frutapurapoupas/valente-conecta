// Caminho: C:\valente_conecta\app\api\admin-master\demandas-busca\notificar\route.ts
//
// Avisa fornecedores sobre uma demanda em aberto: push automatico pra quem
// ja publica no mesmo modulo (ou, se ninguem publica ainda nesse modulo,
// pra todos os fornecedores cadastrados — a plataforma esta comecando e
// precisa de oferta). Tambem devolve nome+whatsapp de cada um pro admin
// master mandar mensagem manualmente (mesmo padrao de wa.me usado no resto
// do projeto — nao existe API paga de disparo em massa de WhatsApp aqui).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enviarPushParaUsuario } from '@/lib/push';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.demandaId) return NextResponse.json({ success: false, error: 'demandaId é obrigatório' }, { status: 400 });

    const supabase = createClient();
    const { data: demanda, error: erroDemanda } = await supabase
      .from('demandas_busca')
      .select('*')
      .eq('id', body.demandaId)
      .maybeSingle();
    if (erroDemanda) throw erroDemanda;
    if (!demanda) return NextResponse.json({ success: false, error: 'Demanda não encontrada' }, { status: 404 });

    let fornecedorIds: string[] = [];
    if (demanda.modulo) {
      const { data: itensDoModulo } = await supabase
        .from('catalogo_itens')
        .select('dono_id')
        .eq('modulo', demanda.modulo)
        .neq('status', 'removido');
      fornecedorIds = Array.from(new Set((itensDoModulo || []).map((i: any) => i.dono_id)));
    }

    const { data: perfis } = fornecedorIds.length > 0
      ? await supabase.from('perfis_fornecedor').select('*').in('usuario_id', fornecedorIds)
      : await supabase.from('perfis_fornecedor').select('*');

    const fornecedores = perfis || [];

    // Rota do painel de cadastro certo pra esse modulo. Demanda de produto
    // fisico com codigo de barras (segmento do catalogo colaborativo do PDV,
    // ver 038_pdv_catalogo_colaborativo.sql) vai pro "quiz" do PDV, que pede
    // foto do codigo de barras + preco/estoque e fecha a demanda sozinho
    // (app/api/pdv/responder-demanda/route.ts). Os demais modulos (servicos,
    // saude etc) continuam no painel generico com fechamento automatico ao
    // publicar — ver components/catalogo/LojaAdminShell.tsx.
    const SEGMENTOS_PDV = ['mercado', 'farmacia', 'auto_pecas', 'acougue', 'moda', 'papelaria'];
    const linkCadastro = SEGMENTOS_PDV.includes(demanda.modulo || '')
      ? `/pdv/responder-demanda?demanda=${demanda.id}&termo=${encodeURIComponent(demanda.termo)}`
      : `/${demanda.modulo || 'servicos'}/admin?demanda=${demanda.id}&termo=${encodeURIComponent(demanda.termo)}`;

    await Promise.all(
      fornecedores.map((f: any) =>
        enviarPushParaUsuario(f.usuario_id, {
          titulo: 'Alguém está procurando isso no Valente Conecta',
          corpo: `Termo buscado: "${demanda.termo}". Publique seu produto/serviço pra atender essa demanda.`,
          url: linkCadastro,
        }).catch(() => {})
      )
    );

    return NextResponse.json({
      success: true,
      data: {
        totalNotificados: fornecedores.length,
        linkCadastro,
        fornecedores: fornecedores.map((f: any) => ({ nome: f.nome_exibicao, whatsapp: f.whatsapp })),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao notificar fornecedores' }, { status: 500 });
  }
}
