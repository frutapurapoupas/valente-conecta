// Caminho: C:\valente_conecta\app\api\pdv\catalogo\cron\consultar-cosmos\route.ts
//
// Disparado diariamente pelo Vercel Cron (ver vercel.json). Pega os EANs
// mais antigos da fila (103_pdv_ean_pendentes_cosmos.sql) -- alimentada
// automaticamente quando um lojista escaneia um código no /pdv/estoque e
// não bate em lugar nenhum -- e consulta a Bluesoft Cosmos, respeitando o
// limite de 25 consultas/dia do plano Basic gratuito. Cada EAN
// encontrado já entra direto no catálogo colaborativo, pronto pro
// próximo lojista que escanear o mesmo produto.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const LIMITE_DIARIO = 25;
// Exigido pela Cosmos alem do token -- valor fixo deles, nao e' segredo
// de conta (ver painel "API" do usuario).
const COSMOS_USER_AGENT = 'Cosmos-API-Request';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Não autorizado.' }, { status: 401 });
  }

  const apiKey = process.env.COSMOS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: false, error: 'Cosmos não configurado (COSMOS_API_KEY ausente).' });
  }

  try {
    const supabase = createClient();

    const { data: pendentes, error: erroBusca } = await supabase
      .from('pdv_ean_pendentes_externos')
      .select('*')
      .eq('status', 'pendente')
      .order('created_at', { ascending: true })
      .limit(LIMITE_DIARIO);
    if (erroBusca) throw erroBusca;

    let encontrados = 0;
    let naoEncontrados = 0;
    let erros = 0;

    for (const item of pendentes || []) {
      try {
        // Pode ter sido cadastrado por outro caminho (import em massa,
        // "carregar catálogo" do admin) enquanto esperava na fila --
        // nesse caso so' marca como resolvido, sem gastar a consulta.
        const { data: jaExiste } = await supabase.from('pdv_produtos_catalogo').select('id').eq('ean', item.ean).maybeSingle();
        if (jaExiste) {
          await supabase.from('pdv_ean_pendentes_externos')
            .update({ status: 'encontrado', consultado_em: new Date().toISOString(), tentativas: item.tentativas + 1, catalogo_id: jaExiste.id })
            .eq('id', item.id);
          encontrados++;
          continue;
        }

        const resposta = await fetch(`https://cosmos.bluesoft.com.br/api/gtins/${item.ean}.json`, {
          headers: { 'X-Cosmos-Token': apiKey, 'User-Agent': COSMOS_USER_AGENT, 'Content-Type': 'application/json' },
        });

        if (resposta.status === 404) {
          await supabase.from('pdv_ean_pendentes_externos')
            .update({ status: 'nao_encontrado', consultado_em: new Date().toISOString(), tentativas: item.tentativas + 1 })
            .eq('id', item.id);
          naoEncontrados++;
          continue;
        }
        if (!resposta.ok) {
          console.error('consultar-cosmos: resposta não-ok', item.ean, resposta.status, await resposta.text().catch(() => ''));
          await supabase.from('pdv_ean_pendentes_externos')
            .update({ status: 'erro', consultado_em: new Date().toISOString(), tentativas: item.tentativas + 1 })
            .eq('id', item.id);
          erros++;
          continue;
        }

        const dados = await resposta.json();
        const nomeBase = typeof dados?.description === 'string' ? dados.description.trim() : '';
        if (!nomeBase) {
          await supabase.from('pdv_ean_pendentes_externos')
            .update({ status: 'nao_encontrado', consultado_em: new Date().toISOString(), tentativas: item.tentativas + 1 })
            .eq('id', item.id);
          naoEncontrados++;
          continue;
        }

        const marca = typeof dados?.brand?.name === 'string' ? dados.brand.name.trim() : '';
        const nomeFinal = marca && !nomeBase.toLowerCase().includes(marca.toLowerCase()) ? `${marca} ${nomeBase}` : nomeBase;
        const foto = dados?.thumbnail || dados?.gpc?.thumbnail || null;

        const { data: novoProduto, error: erroInsert } = await supabase
          .from('pdv_produtos_catalogo')
          .insert({ ean: item.ean, sku: `MER-COSMOS-${item.ean}`, nome: nomeFinal.slice(0, 200), segmento: 'mercado', foto_url: foto })
          .select('id')
          .single();
        if (erroInsert) throw erroInsert;

        await supabase.from('pdv_ean_pendentes_externos')
          .update({ status: 'encontrado', consultado_em: new Date().toISOString(), tentativas: item.tentativas + 1, catalogo_id: novoProduto.id })
          .eq('id', item.id);
        encontrados++;
      } catch (erroItem: any) {
        console.error('consultar-cosmos: erro processando EAN', item.ean, erroItem?.message);
        await supabase.from('pdv_ean_pendentes_externos')
          .update({ status: 'erro', consultado_em: new Date().toISOString(), tentativas: item.tentativas + 1 })
          .eq('id', item.id)
          .then(null, () => {});
        erros++;
      }
    }

    return NextResponse.json({ success: true, processados: pendentes?.length || 0, encontrados, naoEncontrados, erros });
  } catch (error: any) {
    console.error('Erro no cron de consulta Cosmos:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Erro interno.' }, { status: 500 });
  }
}
