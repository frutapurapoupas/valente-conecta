// Caminho: C:\valente_conecta\app\api\busca-externa\route.ts
//
// Fallback externo pra busca inteligente: quando ninguem publica o item
// procurado na plataforma, busca 1-2 resultados reais na web via Google
// Custom Search JSON API, enviesados pra regiao do usuario (nome de cidade
// no texto da busca — a API nao tem raio geografico nativo por lat/lng).
// Retorna titulo + trecho + link, NUNCA um preco inventado (a API nao
// devolve preco estruturado; se o texto da pagina mencionar um valor, ele
// pode aparecer no trecho, mas isso nao e' garantido nem confiavel).
//
// Requer GOOGLE_CUSTOM_SEARCH_API_KEY e GOOGLE_CUSTOM_SEARCH_CX (ver painel
// do Vercel > Environment Variables). Sem essas variaveis, responde
// data: [] silenciosamente — a tela de busca so mostra a secao se vier
// algum resultado, entao o app funciona normal enquanto a chave nao existe.

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_CUSTOM_SEARCH_CX;
  if (!apiKey || !cx) {
    return NextResponse.json({ success: true, data: [], configurado: false });
  }

  const { searchParams } = new URL(request.url);
  const termo = searchParams.get('q')?.trim();
  const cidade = searchParams.get('cidade')?.trim() || 'Valente, Bahia';
  if (!termo) return NextResponse.json({ success: false, error: 'q é obrigatório' }, { status: 400 });

  try {
    const query = `${termo} comprar perto de ${cidade}`;
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=2&gl=br&hl=pt-BR`;
    const resposta = await fetch(url);
    const resultado = await resposta.json();

    if (!resposta.ok) {
      console.error('Erro na Custom Search API:', resultado?.error);
      return NextResponse.json({ success: true, data: [], configurado: true });
    }

    const itens = (resultado.items || []).slice(0, 2).map((item: any) => ({
      titulo: item.title,
      trecho: item.snippet,
      link: item.link,
      fonte: item.displayLink,
    }));

    return NextResponse.json({ success: true, data: itens, configurado: true });
  } catch (error) {
    console.error('Erro ao buscar resultado externo:', error);
    return NextResponse.json({ success: true, data: [], configurado: true });
  }
}
