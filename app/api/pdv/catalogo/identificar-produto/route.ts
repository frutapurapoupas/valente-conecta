// Caminho: C:\valente_conecta\app\api\pdv\catalogo\identificar-produto\route.ts
//
// Primeira foto do cadastro de produto no PDV colaborativo (app/pdv/estoque
// e app/admin-master/pdv-catalogo/carregar): tenta identificar o PRODUTO em
// si (nome comercial + segmento) por IA, ANTES de pedir o código de barras
// (isso fica no passo seguinte, reaproveitando o BarcodeScanner que já
// existe). Mesmo padrão de app/api/codigo-barras/ler-com-ia/route.ts
// (Gemini vision, JSON, nunca trava o fluxo se falhar) -- sem cota de
// Plano Geral, mesma decisão já tomada pra leitura de código de barras.
//
// Nunca inventa nome com baixa confiança: se a IA não reconhecer o
// produto (foto ruim, marca não visível, produto genérico), devolve
// nome:null e quem chamou cai no fluxo manual de sempre.

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SEGMENTOS_VALIDOS = ['mercado', 'farmacia', 'auto_pecas', 'acougue', 'moda', 'papelaria', 'geral'];

const PROMPT_SISTEMA = `Essa foto mostra um produto físico que pode ser vendido num comércio de Valente, Bahia (cidade pequena do interior nordestino do Brasil).

Tente identificar:
- "nome": o nome comercial específico do produto, com marca quando visível (ex: "Sabão em pó OMO 1kg", "Refrigerante Coca-Cola 2L", "Parafuso sextavado 1/4"). Só preencha se conseguir ler/reconhecer com confiança real -- nunca invente marca ou descrição que não dá pra confirmar pela imagem.
- "segmento": UM destes valores, o que mais combina com o produto: "mercado", "farmacia", "auto_pecas", "acougue", "moda", "papelaria", "geral".
- "confianca": "alta" (leu embalagem/rótulo claramente), "media" (reconheceu o tipo de produto mas não a marca/variação exata), ou "baixa" (só deu pra chutar a categoria).

Responda só com JSON, sem texto antes ou depois: {"nome": "...", "segmento": "...", "confianca": "alta"}

Se não der pra identificar nada com confiança mínima (foto ruim, produto genérico sem marca, ilegível), responda: {"nome": null, "segmento": null, "confianca": "baixa"}`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ success: true, nome: null, segmento: null, confianca: 'baixa' });

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
        console.error('identificar-produto: provedor recusou a chamada', resposta.status, await resposta.text().catch(() => ''));
        return NextResponse.json({ success: true, nome: null, segmento: null, confianca: 'baixa' });
      }

      const dados = await resposta.json();
      const conteudo = dados?.choices?.[0]?.message?.content;
      if (!conteudo) return NextResponse.json({ success: true, nome: null, segmento: null, confianca: 'baixa' });

      let parsed: any;
      try {
        parsed = JSON.parse(conteudo);
      } catch {
        return NextResponse.json({ success: true, nome: null, segmento: null, confianca: 'baixa' });
      }

      const nome = typeof parsed?.nome === 'string' && parsed.nome.trim() ? parsed.nome.trim().slice(0, 120) : null;
      const segmento = SEGMENTOS_VALIDOS.includes(parsed?.segmento) ? parsed.segmento : null;
      const confianca = ['alta', 'media', 'baixa'].includes(parsed?.confianca) ? parsed.confianca : 'baixa';

      return NextResponse.json({ success: true, nome, segmento, confianca });
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error('identificar-produto: erro inesperado', error);
    return NextResponse.json({ success: true, nome: null, segmento: null, confianca: 'baixa' });
  }
}
