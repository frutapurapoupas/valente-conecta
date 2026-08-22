// Caminho: C:\valente_conecta\app\api\busca-externa\route.ts
//
// Fallback externo pra busca inteligente da home: so' dispara quando a
// busca interna (catalogo_itens + comercios/saude/agua-gas, ver
// /api/catalogo/busca) nao acha nada — mostra o que existe de verdade
// perto do usuario, mesmo fora da plataforma, pra nunca devolver "nada
// encontrado" sem alternativa (decisao confirmada com o dono do projeto).
//
// Reaproveita o Google Places (Text Search New) — MESMA API ja configurada
// pra saude/busca-google e pros imports do admin master, evita depender de
// uma segunda API do Google (Custom Search) que nunca chegou a ser
// configurada. Com locationBias por lat/lng do usuario, usa
// rankPreference=DISTANCE pra aproximar "mais proximo geograficamente".
//
// NAO devolve preco: a Places API nao expoe preco de produto/servico pra
// buscas genericas (so' priceLevel de restaurante, nem sempre presente) —
// teria que inventar um numero, o que a CLAUDE.md deste projeto proibe
// explicitamente. "Mais barato" nao e' um criterio que da pra cumprir aqui.
//
// Mesma cota do Plano Geral usada em saude/busca-google (servico
// 'busca_google') — e' a mesma decisao de negocio (redundancia via Google
// so' quando a plataforma nao tem o item, com limite diario por plano), nao
// faz sentido ter uma cota separada so' pra essa tela.

import { NextRequest, NextResponse } from 'next/server';
import { verificarECConsumirPlanoGeral } from '@/lib/planoGeral';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ success: true, data: [], configurado: false });
  }

  const { searchParams } = new URL(request.url);
  const termo = searchParams.get('q')?.trim();
  const cidade = searchParams.get('cidade')?.trim() || 'Valente, Bahia';
  const lat = searchParams.get('lat') ? Number(searchParams.get('lat')) : null;
  const lng = searchParams.get('lng') ? Number(searchParams.get('lng')) : null;
  const usuarioId = searchParams.get('usuarioId') || '';
  if (!termo) return NextResponse.json({ success: false, error: 'q é obrigatório' }, { status: 400 });

  if (usuarioId) {
    const cota = await verificarECConsumirPlanoGeral(usuarioId, 'busca_google');
    if (!cota.permitido) {
      return NextResponse.json({ success: true, data: [], configurado: true, limiteAtingido: true, tier: cota.tier });
    }
  }

  try {
    const body: any = {
      textQuery: `${termo} em ${cidade}`,
      languageCode: 'pt-BR',
      maxResultCount: 3,
    };
    if (lat != null && lng != null) {
      body.locationBias = { circle: { center: { latitude: lat, longitude: lng }, radius: 15000 } };
      body.rankPreference = 'DISTANCE';
    }

    const resposta = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.googleMapsUri',
      },
      body: JSON.stringify(body),
    });
    const resultado = await resposta.json();

    if (!resposta.ok) {
      console.error('Erro na Places API (busca-externa):', resultado?.error);
      return NextResponse.json({ success: true, data: [], configurado: true });
    }

    const itens = (resultado.places || []).slice(0, 3).map((p: any) => ({
      titulo: p.displayName?.text || '',
      trecho: [p.formattedAddress, p.nationalPhoneNumber].filter(Boolean).join(' · '),
      link: p.googleMapsUri || '',
      fonte: 'Google Maps',
    })).filter((item: any) => item.titulo && item.link);

    return NextResponse.json({ success: true, data: itens, configurado: true });
  } catch (error) {
    console.error('Erro ao buscar resultado externo:', error);
    return NextResponse.json({ success: true, data: [], configurado: true });
  }
}
