// Caminho: C:\valente_conecta\app\api\interesses-popup\route.ts
//
// Itens ja publicados no sistema que batem com o que o usuario disse ter
// interesse no quiz de perfil (perfil_quiz_respostas.respostas.interesses,
// so preenchido pra quem respondeu "publico geral" — ver
// QuizPerfilPopup.tsx). So considera "servicos_produtos" (catalogo_itens)
// e "carona" (carona_viagens publicada) porque sao os dois interesses que
// realmente correspondem a um catalogo de itens publicados; os demais
// (moeda_conecta, mototaxi, outro) sao funcionalidades, nao vitrines.
//
// ?desde= filtra por created_at/data_viagem mais recente que esse
// timestamp, pra so' mostrar coisa nova desde a ultima vez que o
// pop-up apareceu (ver components/InteressesPopup.tsx).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { LABEL_MODULO, type ModuloId } from '@/lib/catalogo/marketplaceTypes';

export const dynamic = 'force-dynamic';

interface ItemInteresse {
  tipo: 'catalogo' | 'carona';
  id: string;
  titulo: string;
  subtitulo: string;
  href: string;
  criadoEm: string;
}

export async function GET(request: NextRequest) {
  try {
    const usuarioId = request.nextUrl.searchParams.get('usuarioId');
    if (!usuarioId) return NextResponse.json({ success: false, error: 'usuarioId é obrigatório' }, { status: 400 });
    const desde = request.nextUrl.searchParams.get('desde') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const supabase = createClient();

    const { data: quiz } = await supabase
      .from('perfil_quiz_respostas')
      .select('respostas')
      .eq('usuario_id', usuarioId)
      .maybeSingle();

    const interesses: string[] = quiz?.respostas?.interesses || [];
    if (interesses.length === 0) return NextResponse.json({ success: true, data: [] });

    const itens: ItemInteresse[] = [];

    if (interesses.includes('servicos_produtos')) {
      const { data: catalogo } = await supabase
        .from('catalogo_itens')
        .select('id, modulo, titulo, categoria, created_at')
        .eq('status', 'ativo')
        .gt('created_at', desde)
        .order('created_at', { ascending: false })
        .limit(5);
      for (const item of catalogo || []) {
        itens.push({
          tipo: 'catalogo',
          id: item.id,
          titulo: item.titulo,
          subtitulo: `${LABEL_MODULO[item.modulo as ModuloId] || item.modulo} · ${item.categoria}`,
          href: `/item/${item.id}`,
          criadoEm: item.created_at,
        });
      }
    }

    if (interesses.includes('carona')) {
      const hoje = new Date().toISOString().slice(0, 10);
      const { data: viagens } = await supabase
        .from('carona_viagens')
        .select('id, cidade_origem, cidade_destino, data_viagem, created_at')
        .eq('status', 'publicada')
        .gte('data_viagem', hoje)
        .gt('created_at', desde)
        .order('created_at', { ascending: false })
        .limit(5);
      for (const v of viagens || []) {
        itens.push({
          tipo: 'carona',
          id: v.id,
          titulo: `Carona: ${v.cidade_origem} → ${v.cidade_destino}`,
          subtitulo: new Date(v.data_viagem + 'T00:00:00').toLocaleDateString('pt-BR'),
          href: '/carona',
          criadoEm: v.created_at,
        });
      }
    }

    itens.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

    return NextResponse.json({ success: true, data: itens.slice(0, 5) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao buscar novidades' }, { status: 500 });
  }
}
