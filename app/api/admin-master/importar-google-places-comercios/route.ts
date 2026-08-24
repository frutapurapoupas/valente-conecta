// Caminho: C:\valente_conecta\app\api\admin-master\importar-google-places-comercios\route.ts
//
// Mesmo padrao ja usado em importar-google-places-saude, generalizado pra
// varios modulos de uma vez (alimentacao, mercados, moda, pet, construcao,
// servicos, imoveis) — grava em comercios_diretorio (056_comercios_diretorio.sql,
// modulo 'imoveis' liberado em 065_comercios_diretorio_imoveis.sql),
// diretorio PUBLICO E GRATUITO. Confirmado com o dono do projeto: nao ha'
// fornecedor real cadastrado nesses modulos ainda (excecao: Cozinha Chef
// Neide, que e' um sistema totalmente separado e nao e' afetado por isso).
//
// Categoria de cada tipo do Google mapeada pra bater com
// lib/catalogo/modulosConfig.ts — e' so' um ponto de partida, o dono
// corrige na hora de reivindicar o cadastro se precisar.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const TIPOS_POR_MODULO: Record<string, Record<string, string>> = {
  alimentacao: {
    restaurant: 'Restaurante',
    cafe: 'Cafeteria',
    bar: 'Bar',
    meal_takeaway: 'Lanchonete',
  },
  mercados: {
    supermarket: 'Mercearia',
    grocery_store: 'Mercearia',
    convenience_store: 'Mercearia',
    bakery: 'Padaria',
    butcher_shop: 'Açougue',
  },
  moda: {
    clothing_store: 'Moda Feminina',
    shoe_store: 'Calçados',
    jewelry_store: 'Acessórios',
  },
  pet: {
    pet_store: 'Ração e produtos',
    veterinary_care: 'Veterinário',
  },
  construcao: {
    // home_goods_store foi removido: e' um tipo do Google muito amplo (pegou
    // loja de moveis, eletro, floricultura, confeccao...), nada a ver com
    // material de construcao — bug real encontrado com dados de producao.
    hardware_store: 'Materiais de construção',
  },
  servicos: {
    hair_care: 'Beleza e estética',
    beauty_salon: 'Beleza e estética',
    spa: 'Beleza e estética',
    laundry: 'Outros serviços',
  },
  // So' a imobiliaria em si (a empresa) -- os anuncios de imovel por venda/
  // aluguel continuam em app/imoveis/page.tsx, marketplace separado.
  imoveis: {
    real_estate_agency: 'Imobiliária',
  },
};

const LIMITE_DETALHES = 200;

type PlaceBasico = {
  id: string;
  nome: string;
  endereco: string | null;
  latitude: number | null;
  longitude: number | null;
  categoria: string;
};

async function buscarPorTipo(tipoGoogle: string, categoria: string, lat: number, lng: number, raioMetros: number, apiKey: string): Promise<PlaceBasico[]> {
  const resp = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location',
    },
    body: JSON.stringify({
      includedTypes: [tipoGoogle],
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
    latitude: p.location?.latitude ?? null,
    longitude: p.location?.longitude ?? null,
    categoria,
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
    const modulo = body?.modulo;
    if (!cidadeId || !modulo || !TIPOS_POR_MODULO[modulo]) {
      return NextResponse.json({ success: false, error: 'cidade_id e modulo válido são obrigatórios' }, { status: 400 });
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

    const mapaTipos = TIPOS_POR_MODULO[modulo];
    const resultadosPorTipo = await emLotes(
      Object.entries(mapaTipos),
      6,
      ([tipoGoogle, categoria]) => buscarPorTipo(tipoGoogle, categoria, lat, lng, raioMetros, apiKey)
    );

    const mapaLugares = new Map<string, PlaceBasico>();
    for (const lista of resultadosPorTipo) {
      for (const lugar of lista) {
        if (lugar.id && lugar.nome && !mapaLugares.has(lugar.id)) mapaLugares.set(lugar.id, lugar);
      }
    }
    const lugares = Array.from(mapaLugares.values()).slice(0, LIMITE_DETALHES);

    const detalhes = await emLotes(lugares, 8, (lugar) => buscarDetalhes(lugar.id, apiKey));

    const comercios = lugares.map((lugar, i) => {
      const telefoneDigitos = String(detalhes[i].telefone || '').replace(/\D/g, '');
      return {
        modulo,
        categoria: lugar.categoria,
        nome: lugar.nome.slice(0, 150),
        telefone: telefoneDigitos,
        whatsapp: telefoneDigitos,
        endereco: lugar.endereco || '',
        cidade: cidade.nome,
        latitude: lugar.latitude,
        longitude: lugar.longitude,
        horario: detalhes[i].horario || '',
        google_place_id: lugar.id,
      };
    });

    if (comercios.length === 0) {
      return NextResponse.json({ success: true, cidade: cidade.nome, modulo, encontrados: 0, novos: 0 });
    }

    const { data: inseridos, error: erroInsert } = await supabase
      .from('comercios_diretorio')
      .upsert(comercios, { onConflict: 'google_place_id', ignoreDuplicates: true })
      .select('id');
    if (erroInsert) throw erroInsert;

    return NextResponse.json({
      success: true,
      cidade: cidade.nome,
      modulo,
      encontrados: comercios.length,
      novos: inseridos?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao importar do Google Places' }, { status: 500 });
  }
}
