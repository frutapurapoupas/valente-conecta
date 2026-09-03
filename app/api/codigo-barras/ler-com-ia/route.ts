// Caminho: C:\valente_conecta\app\api\codigo-barras\ler-com-ia\route.ts
//
// Segunda tentativa de leitura de codigo de barras via IA de visao (Gemini,
// GEMINI_API_KEY -- mesma chave/camada gratuita ja usada em
// lib/busca/interpretarIntencao.ts, "sem cartao"), usada pelo botao "Tirar
// foto agora" (BarcodeScanner.tsx) quando o zxing (leitura por padrao de
// barras) nao consegue decodificar -- a IA le os NUMEROS impressos embaixo
// das barras, o que costuma funcionar mesmo com reflexo/angulo ruim que
// atrapalha a leitura tradicional por padrao visual.
//
// Sem limite de uso por decisao do dono do produto (Gemini free tier nao
// tem custo real aqui) -- por isso NENHUMA checagem de cota do Plano Geral
// (lib/planoGeral.ts). Nunca trava o fluxo: sem GEMINI_API_KEY, erro de
// rede/timeout ou resposta sem numero legivel, sempre devolve
// {success:true, codigo:null} pra quem chamou cair no proprio fallback
// (digitar manualmente / seguir sem codigo).

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const PROMPT_SISTEMA = `Essa foto mostra um código de barras impresso numa embalagem de produto, nota fiscal ou cupom fiscal. Leia os NÚMEROS impressos por baixo (ou ao lado) das barras — normalmente um código EAN-13, EAN-8 ou UPC, com 8 a 14 dígitos.

Responda só com JSON, sem nenhum texto antes ou depois: {"codigo": "1234567890123"}. Se não conseguir ler os números com confiança (foto ilegível, reflexo cobrindo os dígitos, nenhum código visível), responda {"codigo": null}. Nunca invente ou complete dígitos que você não consiga realmente ler na imagem.`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: true, codigo: null });
  }

  try {
    const formData = await request.formData();
    const arquivo = formData.get('arquivo') as File | null;
    if (!arquivo) return NextResponse.json({ success: false, error: 'Arquivo ausente' }, { status: 400 });

    const buffer = Buffer.from(await arquivo.arrayBuffer());
    const base64 = buffer.toString('base64');
    const mime = arquivo.type || 'image/jpeg';

    const controlador = new AbortController();
    const timeoutId = setTimeout(() => controlador.abort(), 15000);
    try {
      const resposta = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-3.5-flash-lite',
          messages: [
            { role: 'system', content: PROMPT_SISTEMA },
            { role: 'user', content: [{ type: 'image_url', image_url: { url: `data:${mime};base64,${base64}` } }] },
          ],
          response_format: { type: 'json_object' },
          temperature: 0,
          max_tokens: 200,
          reasoning_effort: 'low',
        }),
        signal: controlador.signal,
      });

      if (!resposta.ok) {
        console.error('ler-com-ia: Gemini recusou a chamada', resposta.status, await resposta.text().catch(() => ''));
        return NextResponse.json({ success: true, codigo: null });
      }

      const dados = await resposta.json();
      const conteudo = dados?.choices?.[0]?.message?.content;
      if (!conteudo) return NextResponse.json({ success: true, codigo: null });

      let parsed: any;
      try {
        parsed = JSON.parse(conteudo);
      } catch {
        console.error('ler-com-ia: conteudo nao e JSON valido', conteudo);
        return NextResponse.json({ success: true, codigo: null });
      }

      const digitos = typeof parsed?.codigo === 'string' ? parsed.codigo.replace(/\D/g, '') : '';
      return NextResponse.json({ success: true, codigo: digitos.length >= 6 ? digitos : null });
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error('ler-com-ia: erro inesperado', error);
    return NextResponse.json({ success: true, codigo: null });
  }
}
