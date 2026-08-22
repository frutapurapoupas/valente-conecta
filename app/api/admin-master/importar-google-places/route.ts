// Caminho: C:\valente_conecta\app\api\admin-master\importar-google-places\route.ts
//
// Puxa uma lista rica de comercios/servicos de uma cidade usando a Places
// API (New) do Google, restrita ao raio configurado em `cidades`, e salva
// como contatos_divulgacao (origem='google_places') pra alimentar o convite
// via WhatsApp que ja existe (ver app/admin-master/configuracoes/divulgacao).
//
// Custo: Nearby Search (New) e Place Details (New) tem 5.000 chamadas
// gratis/mes cada (verificado em developers.google.com/maps/billing-and-pricing/pricing
// em 15/08/2026). Uma varredura de cidade pequena fica bem dentro do gratis.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const TIPOS_COMERCIO = [
  'restaurant', 'cafe', 'bakery', 'bar', 'meal_takeaway',
  'supermarket', 'grocery_store', 'convenience_store',
  'pharmacy', 'hardware_store', 'home_goods_store', 'clothing_store',
  'shoe_store', 'electronics_store', 'furniture_store',
  'hair_care', 'beauty_salon', 'spa', 'gym',
  'car_repair', 'car_dealer', 'gas_station',
  'bank', 'atm', 'lawyer', 'dentist', 'doctor', 'veterinary_care',
  'real_estate_agency', 'insurance_agency', 'laundry', 'florist',
  'jewelry_store', 'book_store', 'pet_store', 'liquor_store',
  'physiotherapist', 'school',
];

const LIMITE_DETALHES = 400; // teto de seguranca por rodada

type PlaceBasico = {
  id: string;
  nome: string;
  endereco: string | null;
  categoria: string | null;
};

async function buscarPorTipo(tipo: string, lat: number, lng: number, raioMetros: number, apiKey: string): Promise<PlaceBasico[]> {
  const resp = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress',
    },
    body: JSON.stringify({
      includedTypes: [tipo],
      maxResultCount: 20,
      locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius: raioMetros } },
    }),
  });
  if (!resp.ok) return [];
  const data = await resp.json();
  const places = Array.isArray(data?.places) ? data.places : [];
  return places.map((p: any) => ({
    id: p.id,
    nome: p.displayName?.text || '',
    endereco: p.formattedAddress || null,
    categoria: tipo,
  }));
}

async function buscarTelefone(placeId: string, apiKey: string): Promise<string | null> {
  const resp = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: { 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': 'nationalPhoneNumber' },
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  return data?.nationalPhoneNumber || null;
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

    // 1. Varre cada tipo de comercio, em lotes, dentro do raio da cidade
    const resultadosPorTipo = await emLotes(TIPOS_COMERCIO, 6, (tipo) => buscarPorTipo(tipo, lat, lng, raioMetros, apiKey));

    // 2. Dedup por place id
    const mapaLugares = new Map<string, PlaceBasico>();
    for (const lista of resultadosPorTipo) {
      for (const lugar of lista) {
        if (lugar.id && lugar.nome && !mapaLugares.has(lugar.id)) mapaLugares.set(lugar.id, lugar);
      }
    }
    const lugares = Array.from(mapaLugares.values()).slice(0, LIMITE_DETALHES);

    // 3. Busca telefone de cada um (chamada paga acima do free tier, mas dentro dele pra esse volume)
    const telefones = await emLotes(lugares, 8, (lugar) => buscarTelefone(lugar.id, apiKey));

    const contatos = lugares
      .map((lugar, i) => {
        const telefoneDigitos = String(telefones[i] || '').replace(/\D/g, '');
        return {
          nome: lugar.nome.slice(0, 120),
          telefone: telefoneDigitos,
          origem: 'google_places' as const,
          google_place_id: lugar.id,
          categoria: lugar.categoria,
          endereco: lugar.endereco,
        };
      })
      .filter((c) => c.telefone.length >= 10 && c.telefone.length <= 13);

    if (contatos.length === 0) {
      return NextResponse.json({
        success: true,
        encontrados: lugares.length,
        comTelefone: 0,
        novos: 0,
      });
    }

    const { data: inseridos, error: erroInsert } = await supabase
      .from('contatos_divulgacao')
      .upsert(contatos, { onConflict: 'google_place_id', ignoreDuplicates: true })
      .select('id');
    if (erroInsert) throw erroInsert;

    return NextResponse.json({
      success: true,
      cidade: cidade.nome,
      encontrados: lugares.length,
      comTelefone: contatos.length,
      novos: inseridos?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao importar do Google Places' }, { status: 500 });
  }
}
