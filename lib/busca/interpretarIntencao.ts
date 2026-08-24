// Caminho: C:\valente_conecta\lib\busca\interpretarIntencao.ts
//
// Interpreta a intenção de uma busca (palavra solta ou pergunta em
// linguagem natural) via IA — DeepSeek Chat Completions (compatível com o
// padrão OpenAI), usando a MESMA chave DEEPSEEK_API_KEY que já existe em
// .env.local (até aqui só usada pela ferramenta de dev, nunca pelo app em
// produção). Devolve termos de busca diretos e relacionados, que
// lib/busca/buscarTudo.ts usa pra consultar o catálogo de verdade — a IA
// nunca inventa comércio nem garante que o termo vai achar algo, só sugere
// o que buscar.
//
// Nunca trava a busca: erro de rede, timeout, JSON inválido ou cota do dia
// estourada (lib/planoGeral.ts, servico 'busca_inteligente_ia',
// 077_busca_inteligente_ia.sql) caem todos no mesmo fallback — busca
// literal pelo termo digitado, exatamente como funcionava antes de existir
// essa camada.

import { verificarECConsumirPlanoGeral } from '@/lib/planoGeral';

export interface IntencaoBusca {
  termosDiretos: string[];
  termosRelacionados: string[];
}

const PROMPT_SISTEMA = `Você ajuda a interpretar buscas dentro do Valente Conecta, um app de comércios e serviços locais da cidade de Valente, Bahia (cidade pequena do interior nordestino do Brasil).

Dado o texto de busca de um usuário (pode ser uma palavra solta ou uma pergunta em linguagem natural), devolva um JSON com dois campos:
- "termos_diretos": até 6 termos de busca curtos (palavras ou expressões de 1 a 3 palavras, em português) que representam o que a pessoa está procurando DE FORMA DIRETA. Se a busca já for uma palavra simples de comércio/serviço, esse campo pode conter só essa palavra.
- "termos_relacionados": até 4 termos de busca que fazem sentido como interesse ADICIONAL ligado ao mesmo contexto, mas que não respondem diretamente à pergunta.

Responda só com o JSON, sem nenhum texto explicativo antes ou depois.

Exemplo — busca "onde regularizar a documentação do carro":
{"termos_diretos": ["despachante", "DETRAN", "cartório", "confecção de placas", "emplacamento"], "termos_relacionados": ["oficina mecânica", "chapeação e pintura", "auto peças"]}`;

export async function interpretarIntencaoBusca(query: string, usuarioId?: string): Promise<IntencaoBusca> {
  const fallback: IntencaoBusca = { termosDiretos: [query], termosRelacionados: [] };

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return fallback;

  if (usuarioId) {
    try {
      const cota = await verificarECConsumirPlanoGeral(usuarioId, 'busca_inteligente_ia');
      if (!cota.permitido) return fallback;
    } catch {
      // cota indisponivel (erro de banco, etc) nao deve travar a busca
    }
  }

  try {
    const controlador = new AbortController();
    const timeoutId = setTimeout(() => controlador.abort(), 6000);

    const resposta = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: PROMPT_SISTEMA },
          { role: 'user', content: query },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 300,
      }),
      signal: controlador.signal,
    });
    clearTimeout(timeoutId);
    if (!resposta.ok) return fallback;

    const dados = await resposta.json();
    const conteudo = dados?.choices?.[0]?.message?.content;
    if (!conteudo) return fallback;

    const parsed = JSON.parse(conteudo);
    const limpar = (lista: any, max: number): string[] =>
      Array.isArray(lista) ? lista.filter((t) => typeof t === 'string' && t.trim()).map((t) => t.trim()).slice(0, max) : [];

    const termosDiretos = limpar(parsed?.termos_diretos, 6);
    const termosRelacionados = limpar(parsed?.termos_relacionados, 4);

    if (termosDiretos.length === 0) return fallback;
    return { termosDiretos, termosRelacionados };
  } catch {
    return fallback;
  }
}
