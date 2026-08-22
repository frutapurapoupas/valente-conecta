// Caminho: C:\valente_conecta\lib\pdv\kodebarService.ts
//
// Resolve a foto de um produto por EAN durante a importação de planilha
// (ver plano em C:\Users\Usuario\.claude\plans\parallel-jumping-dragon.md).
// Ordem de tentativa, do mais barato pro mais caro:
//   1. Catálogo colaborativo interno (pdv_produtos_catalogo) — grátis, já
//      alimentado por outros lojistas que cadastraram esse EAN antes.
//   2. API Kodebar (https://kodebar.korvensistemas.com.br) — paga acima de
//      50 consultas/dia, só é chamada se KODEBAR_API_KEY estiver setada e a
//      cota diária (pdv_kodebar_incrementar_contador_v1) permitir. Sem a
//      env var, esta função nunca chama a API — cai direto pro placeholder
//      no chamador (não criamos a conta Kodebar por aqui, é ação do usuário).
// Sem match em nenhum dos dois, quem chama esta função decide usar o
// placeholder — aqui só devolvemos null.

import sharp from 'sharp';
import { createClient } from '@/lib/supabase/server';
import { reservarConsultaKodebar } from './kodebarQuota';
import type { OrigemFoto } from './importacaoEstoqueTypes';

interface FotoEncontrada {
  url: string;
  origem: OrigemFoto;
}

const KODEBAR_BASE_URL = 'https://kodebar.korvensistemas.com.br';

export async function buscarFotoPorEan(ean: string): Promise<FotoEncontrada | null> {
  const supabase = createClient();

  const { data: existente } = await supabase
    .from('pdv_produtos_catalogo')
    .select('id, foto_url')
    .eq('ean', ean)
    .maybeSingle();
  if (existente?.foto_url) {
    return { url: existente.foto_url, origem: 'catalogo_interno' };
  }

  const apiKey = process.env.KODEBAR_API_KEY;
  if (!apiKey) return null;

  const podeConsultar = await reservarConsultaKodebar();
  if (!podeConsultar) return null;

  try {
    const respostaLookup = await fetch(`${KODEBAR_BASE_URL}/gtin/lookup?gtin=${encodeURIComponent(ean)}`, {
      headers: { 'X-API-Key': apiKey },
    });
    if (!respostaLookup.ok) return null;
    const produto = await respostaLookup.json();
    if (!produto?.thumbnail) return null;

    const url = await baixarConverterESubir(produto.thumbnail, ean);
    if (!url) return null;

    await gravarNoCatalogoInterno(existente?.id ?? null, ean, produto.nome, url);

    return { url, origem: 'kodebar' };
  } catch (error) {
    console.error('Erro ao consultar Kodebar:', error);
    return null;
  }
}

// pdv_produtos_catalogo.ean tem indice unico PARCIAL (so' quando nao-nulo,
// ver 038_pdv_catalogo_colaborativo.sql) — Postgres nao aceita ON CONFLICT
// contra indice parcial pela API do PostgREST, entao aqui e' select-depois-
// decide em vez de upsert (mesmo padrao ja usado em app/api/pdv/catalogo/route.ts).
async function gravarNoCatalogoInterno(idExistente: string | null, ean: string, nome: string | undefined, fotoUrl: string): Promise<void> {
  const supabase = createClient();

  if (idExistente) {
    const { error } = await supabase.from('pdv_produtos_catalogo').update({ foto_url: fotoUrl }).eq('id', idExistente);
    if (error) console.error('Erro ao atualizar foto no catálogo interno:', error);
    return;
  }

  const { error } = await supabase.from('pdv_produtos_catalogo').insert({
    ean,
    sku: `KDB-${ean}`,
    nome: nome || `Produto ${ean}`,
    segmento: 'geral',
    foto_url: fotoUrl,
    criado_por: null,
  });
  // 23505 = unique_violation (corrida com outra importacao cadastrando o
  // mesmo EAN entre o select e este insert) — a foto ja foi aplicada no
  // item que estamos publicando de qualquer jeito, nao vale travar por isso.
  if (error && (error as any).code !== '23505') console.error('Erro ao gravar produto novo no catálogo interno:', error);
}

async function baixarConverterESubir(urlOrigem: string, ean: string): Promise<string | null> {
  const respostaImagem = await fetch(urlOrigem);
  if (!respostaImagem.ok) return null;

  const bufferOriginal = Buffer.from(await respostaImagem.arrayBuffer());
  const bufferWebp = await sharp(bufferOriginal).resize(800, 800, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();

  const supabase = createClient();
  const caminho = `kodebar/${ean}-${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage.from('catalogo').upload(caminho, bufferWebp, { contentType: 'image/webp', upsert: true });
  if (error) {
    console.error('Erro ao subir foto da Kodebar:', error);
    return null;
  }

  return supabase.storage.from('catalogo').getPublicUrl(caminho).data.publicUrl;
}
