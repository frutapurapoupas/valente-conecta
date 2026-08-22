// Caminho: C:\valente_conecta\app\api\saude\busca-google\route.ts
//
// Fallback: só é chamado pelo cliente quando a busca no nosso diretorio
// (saude_estabelecimentos) nao encontra nada pro termo digitado. Busca no
// Google Places (Text Search New) dentro da cidade, mostra pro usuario como
// resultado "ainda nao cadastrado" e registra a demanda em demandas_busca
// (021_demandas_busca.sql) pra o admin master avaliar incluir de verdade.
//
// Custo: Text Search (New) tem 5.000 chamadas gratis/mes, so' dispara em
// buscas que realmente nao acharam nada no nosso banco — nao e' busca ao
// vivo em toda pesquisa.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verificarECConsumirPlanoGeral } from '@/lib/planoGeral';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'GOOGLE_PLACES_API_KEY não configurada no servidor' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const termo = (searchParams.get('termo') || '').trim();
    const cidadeId = searchParams.get('cidade_id');
    const usuarioId = searchParams.get('usuarioId') || '';
    const usuarioNome = searchParams.get('usuarioNome') || '';
    const usuarioTelefone = searchParams.get('usuarioTelefone') || '';
    if (!termo || !cidadeId) {
      return NextResponse.json({ success: false, error: 'termo e cidade_id são obrigatórios' }, { status: 400 });
    }
    if (!usuarioId) {
      return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });
    }

    const cota = await verificarECConsumirPlanoGeral(usuarioId, 'busca_google');
    if (!cota.permitido) {
      return NextResponse.json({
        success: false,
        limiteAtingido: true,
        tier: cota.tier,
        error: 'Você atingiu o limite de buscas no Google de hoje pro seu plano.',
      }, { status: 402 });
    }

    const supabase = createClient();
    const { data: cidade } = await supabase
      .from('cidades')
      .select('nome, centro_lat, centro_lng, raio_km')
      .eq('id', cidadeId)
      .single();
    if (!cidade) {
      return NextResponse.json({ success: false, error: 'Cidade não encontrada' }, { status: 404 });
    }

    const resp = await fetch('https://places.googleapis.com/v1/places:searchText?languageCode=pt-BR', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.nationalPhoneNumber',
      },
      body: JSON.stringify({
        textQuery: `${termo} saúde ${cidade.nome}`,
        locationBias: {
          circle: {
            center: { latitude: Number(cidade.centro_lat), longitude: Number(cidade.centro_lng) },
            radius: Number(cidade.raio_km) * 1000,
          },
        },
        maxResultCount: 5,
      }),
    });

    const resultados = resp.ok
      ? ((await resp.json())?.places || []).map((p: any) => ({
          nome: p.displayName?.text || '',
          endereco: p.formattedAddress || '',
          telefone: p.nationalPhoneNumber || '',
          latitude: p.location?.latitude ?? null,
          longitude: p.location?.longitude ?? null,
        }))
      : [];

    // Registra a demanda pro admin master avaliar incluir de verdade —
    // mesma tabela generica ja usada pelo resto da plataforma pra "buscou e
    // nao achou". Nao bloqueia a resposta se usuarioId nao vier.
    if (usuarioId) {
      const { data: existente } = await supabase
        .from('demandas_busca')
        .select('id')
        .eq('usuario_id', usuarioId)
        .eq('termo', termo)
        .eq('status', 'aguardando')
        .maybeSingle();
      if (!existente) {
        await supabase.from('demandas_busca').insert({
          termo,
          modulo: 'saude',
          usuario_id: usuarioId,
          usuario_nome: usuarioNome || null,
          usuario_telefone: usuarioTelefone || null,
          latitude: Number(cidade.centro_lat),
          longitude: Number(cidade.centro_lng),
        });
      }
    }

    return NextResponse.json({ success: true, data: resultados });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao buscar no Google' }, { status: 500 });
  }
}
