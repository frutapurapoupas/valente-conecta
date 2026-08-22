// Caminho: C:\valente_conecta\app\api\admin-master\importar-google-places-agua-gas\route.ts
//
// Distribuidoras de água mineral e revendas de gás de cozinha não têm um
// "includedType" proprio no Google Places (New) — diferente de
// hospital/farmacia/mercado etc. Por isso usa Text Search (mesmo recurso
// da busca-fallback de Saude) com termos em portugues, em vez de Nearby
// Search por tipo. Grava em agua_gas_fornecedores (014_agua_gas_supabase.sql
// + 057_agua_gas_google_place_id.sql).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const TERMOS_BUSCA = [
  'distribuidora de gás de cozinha',
  'revenda de gás',
  'água mineral distribuidora',
  'depósito de água e gás',
];

const LIMITE_DETALHES = 100;

type PlaceBasico = { id: string; nome: string; endereco: string | null; latitude: number | null; longitude: number | null };

async function buscarPorTermo(termo: string, nomeCidade: string, lat: number, lng: number, raioMetros: number, apiKey: string): Promise<PlaceBasico[]> {
  const resp = await fetch('https://places.googleapis.com/v1/places:searchText?languageCode=pt-BR', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location',
    },
    body: JSON.stringify({
      textQuery: `${termo} ${nomeCidade}`,
      locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: raioMetros } },
      maxResultCount: 10,
    }),
  });
  if (!resp.ok) return [];
  const data = await resp.json();
  const places = Array.isArray(data?.places) ? data.places : [];
  return places.map((p: any) => ({
    id: p.id,
    nome: p.displayName?.text || '',
    endereco: p.formattedAddress || null,
    latitude: p.location?.latitude ?? null,
    longitude: p.location?.longitude ?? null,
  }));
}

async function buscarDetalhes(placeId: string, apiKey: string): Promise<{ telefone: string | null; horario: string | null }> {
  const resp = await fetch(`https://places.googleapis.com/v1/places/${placeId}?languageCode=pt-BR`, {
    headers: { 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': 'nationalPhoneNumber,regularOpeningHours' },
  });
  if (!resp.ok) return { telefone: null, horario: null };
  const data = await resp.json();
  const horario = Array.isArray(data?.regularOpeningHours?.weekdayDescriptions)
    ? data.regularOpeningHours.weekdayDescriptions.join(' · ')
    : null;
  return { telefone: data?.nationalPhoneNumber || null, horario };
}

async function emLotes<T, R>(itens: T[], tamanhoLote: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const resultados: R[] = [];
  for (let i = 0; i < itens.length; i += tamanhoLote) {
    const lote = itens.slice(i, i + tamanhoLote);
    resultados.push(...(await Promise.all(lote.map(fn))));
  }
  return resultados;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'GOOGLE_PLACES_API_KEY não configurada no servidor' }, { status: 500 });
    }

    const body = await request.json();
    const cidadeId = body?.cidade_id;
    if (!cidadeId) {
      return NextResponse.json({ success: false, error: 'cidade_id é obrigatório' }, { status: 400 });
    }

    const supabase = createClient();
    const { data: cidade, error: erroCidade } = await supabase
      .from('cidades')
      .select('id, nome, centro_lat, centro_lng, raio_km')
      .eq('id', cidadeId)
      .single();
    if (erroCidade || !cidade) {
      return NextResponse.json({ success: false, error: 'Cidade não encontrada' }, { status: 404 });
    }

    const raioMetros = Number(cidade.raio_km) * 1000;
    const lat = Number(cidade.centro_lat);
    const lng = Number(cidade.centro_lng);

    const resultadosPorTermo = await emLotes(TERMOS_BUSCA, 4, (termo) => buscarPorTermo(termo, cidade.nome, lat, lng, raioMetros, apiKey));

    const mapaLugares = new Map<string, PlaceBasico>();
    for (const lista of resultadosPorTermo) {
      for (const lugar of lista) {
        if (lugar.id && lugar.nome && !mapaLugares.has(lugar.id)) mapaLugares.set(lugar.id, lugar);
      }
    }
    const lugares = Array.from(mapaLugares.values()).slice(0, LIMITE_DETALHES);

    const detalhes = await emLotes(lugares, 8, (lugar) => buscarDetalhes(lugar.id, apiKey));

    const fornecedores = lugares.map((lugar, i) => {
      const telefoneDigitos = String(detalhes[i].telefone || '').replace(/\D/g, '');
      return {
        nome: lugar.nome.slice(0, 150),
        telefone: telefoneDigitos,
        whatsapp: telefoneDigitos,
        endereco: lugar.endereco || '',
        bairro: '',
        cidade: cidade.nome,
        latitude: lugar.latitude,
        longitude: lugar.longitude,
        horario: detalhes[i].horario || '',
        tem_entrega: true,
        taxa_entrega: 0,
        frete_gratis_acima: 0,
        produtos: [],
        status: 'publicado',
        google_place_id: lugar.id,
      };
    }).filter((f) => f.telefone.length >= 10);

    if (fornecedores.length === 0) {
      return NextResponse.json({ success: true, cidade: cidade.nome, encontrados: lugares.length, comTelefone: 0, novos: 0 });
    }

    const { data: inseridos, error: erroInsert } = await supabase
      .from('agua_gas_fornecedores')
      .upsert(fornecedores, { onConflict: 'google_place_id', ignoreDuplicates: true })
      .select('id');
    if (erroInsert) throw erroInsert;

    return NextResponse.json({
      success: true,
      cidade: cidade.nome,
      encontrados: lugares.length,
      comTelefone: fornecedores.length,
      novos: inseridos?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao importar do Google Places' }, { status: 500 });
  }
}
