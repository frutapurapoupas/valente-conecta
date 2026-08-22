// Caminho: C:\valente_conecta\app\api\admin-master\importar-google-places-saude\route.ts
//
// Mesmo padrao ja usado em importar-google-places (divulgacao), adaptado
// pra hospitais/clinicas/consultorios/laboratorios/farmacias — grava direto
// em saude_estabelecimentos (053_saude_estabelecimentos.sql), diretorio
// PUBLICO E GRATUITO (sem paywall de interesse, decisao confirmada com o
// dono do projeto pra informacao de saude).
//
// Custo: Nearby Search (New) e Place Details (New) tem 5.000 chamadas
// gratis/mes cada — uma cidade pequena fica bem dentro do gratis.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const TIPOS_SAUDE: Record<string, { tipo: string; especialidade: string }> = {
  hospital: { tipo: 'hospital', especialidade: 'Consulta médica' },
  doctor: { tipo: 'clinica', especialidade: 'Consulta médica' },
  dentist: { tipo: 'consultorio', especialidade: 'Odontologia' },
  physiotherapist: { tipo: 'consultorio', especialidade: 'Fisioterapia' },
  medical_lab: { tipo: 'laboratorio', especialidade: 'Exames' },
  pharmacy: { tipo: 'farmacia', especialidade: 'Farmácia' },
};

const LIMITE_DETALHES = 200;

type PlaceBasico = {
  id: string;
  nome: string;
  endereco: string | null;
  latitude: number | null;
  longitude: number | null;
  tipoGoogle: string;
};

async function buscarPorTipo(tipoGoogle: string, lat: number, lng: number, raioMetros: number, apiKey: string): Promise<PlaceBasico[]> {
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
    tipoGoogle,
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

    const tiposGoogle = Object.keys(TIPOS_SAUDE);
    const resultadosPorTipo = await emLotes(tiposGoogle, 6, (tipo) => buscarPorTipo(tipo, lat, lng, raioMetros, apiKey));

    const mapaLugares = new Map<string, PlaceBasico>();
    for (const lista of resultadosPorTipo) {
      for (const lugar of lista) {
        if (lugar.id && lugar.nome && !mapaLugares.has(lugar.id)) mapaLugares.set(lugar.id, lugar);
      }
    }
    const lugares = Array.from(mapaLugares.values()).slice(0, LIMITE_DETALHES);

    const detalhes = await emLotes(lugares, 8, (lugar) => buscarDetalhes(lugar.id, apiKey));

    const estabelecimentos = lugares.map((lugar, i) => {
      const config = TIPOS_SAUDE[lugar.tipoGoogle];
      const telefoneDigitos = String(detalhes[i].telefone || '').replace(/\D/g, '');
      return {
        nome: lugar.nome.slice(0, 150),
        tipo: config.tipo,
        especialidades: [config.especialidade],
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

    if (estabelecimentos.length === 0) {
      return NextResponse.json({ success: true, cidade: cidade.nome, encontrados: 0, novos: 0 });
    }

    const { data: inseridos, error: erroInsert } = await supabase
      .from('saude_estabelecimentos')
      .upsert(estabelecimentos, { onConflict: 'google_place_id', ignoreDuplicates: true })
      .select('id');
    if (erroInsert) throw erroInsert;

    return NextResponse.json({
      success: true,
      cidade: cidade.nome,
      encontrados: estabelecimentos.length,
      novos: inseridos?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao importar do Google Places' }, { status: 500 });
  }
}
