// Caminho: C:\valente_conecta\app\api\upload\remover-fundo\route.ts
//
// Remove o fundo de uma foto de produto ja hospedada (bucket publico
// "catalogo") usando a Deep Infra (integracao Vercel Marketplace,
// DEEPINFRA_API_KEY em .env.local). Modelo FLUX.1-Kontext-dev via endpoint
// compativel com a API de edicao de imagem da OpenAI, contrato confirmado:
//
//   POST https://api.deepinfra.com/v1/openai/images/edits
//   multipart/form-data: image (arquivo), prompt, model, n, size
//   resposta: { data: [{ b64_json }] }
//
// process.env.DEEPINFRA_API_KEY lido so' aqui (server), nunca em componente
// client. Fail-soft em qualquer erro (sem key, timeout, HTTP erro, resposta
// sem imagem) — mesmo padrao de lib/pdv/kodebarService.ts: nunca lanca
// excecao que derrube a tela, o chamador mantem a imagem original.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const TIMEOUT_MS = 45000; // edicao de imagem por modelo e' mais lenta que uma API de lookup simples

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ success: false, error: 'url é obrigatória' }, { status: 400 });

    const apiKey = process.env.DEEPINFRA_API_KEY;
    if (!apiKey) return NextResponse.json({ success: false, error: 'servico_indisponivel' }, { status: 503 });

    const respostaImagem = await fetch(url);
    if (!respostaImagem.ok) throw new Error('Não foi possível baixar a imagem original');
    const blobOriginal = await respostaImagem.blob();

    const form = new FormData();
    form.append('image', blobOriginal, 'imagem.png');
    form.append('prompt', 'remove the background, make it transparent, keep the product unchanged');
    form.append('model', 'black-forest-labs/FLUX.1-Kontext-dev');
    form.append('n', '1');
    form.append('size', '1024x1024');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let json: any;
    try {
      const resposta = await fetch('https://api.deepinfra.com/v1/openai/images/edits', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
        signal: controller.signal,
      });
      if (!resposta.ok) throw new Error(`DeepInfra respondeu ${resposta.status}`);
      json = await resposta.json();
    } finally {
      clearTimeout(timeoutId);
    }

    const base64 = json?.data?.[0]?.b64_json;
    if (!base64) throw new Error('Resposta da DeepInfra sem imagem utilizável');
    const buffer = Buffer.from(base64, 'base64');

    const supabase = createClient();
    const caminho = `fundo-removido/${crypto.randomUUID()}.png`;
    const { error } = await supabase.storage.from('catalogo').upload(caminho, buffer, { contentType: 'image/png', upsert: false });
    if (error) throw error;

    const novaUrl = supabase.storage.from('catalogo').getPublicUrl(caminho).data.publicUrl;
    return NextResponse.json({ success: true, url: novaUrl });
  } catch (error: any) {
    console.error('Erro ao remover fundo da imagem:', error);
    return NextResponse.json({ success: false, error: 'Não foi possível remover o fundo agora.' }, { status: 502 });
  }
}
