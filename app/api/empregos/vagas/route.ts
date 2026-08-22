// Caminho: C:\valente_conecta\app\api\empregos\vagas\route.ts
//
// Backend real para app/empregos (ate aqui a UI existia mas chamava rotas
// inexistentes e sempre caia no mock — ver app/empregos/hooks/useEmpregos.ts).
// Usa a fundacao unica do catalogo (catalogo_itens, modulo='emprego') para
// que vagas tambem apareçam na busca inteligente — campos especificos de
// vaga (requisitos, beneficios, tipo, modalidade, nivel) ficam em `metadata`.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Sem isso, GET() sem argumentos e' tratado como estatico pelo Next.js e
// fica cacheado pra sempre a partir da primeira resposta — vagas novas
// nunca apareceriam na listagem sem reiniciar o servidor.
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
import type { CatalogoItem } from '@/lib/catalogo/marketplaceTypes';

function itemParaVaga(item: CatalogoItem) {
  const meta = item.metadata || {};
  return {
    id: item.id,
    titulo: item.titulo,
    empresa: meta.empresa || '',
    descricao: item.descricao_publica || '',
    requisitos: meta.requisitos || [],
    beneficios: meta.beneficios || [],
    tipo: meta.tipo || 'CLT',
    modalidade: meta.modalidade || 'Presencial',
    nivel: meta.nivel || 'Júnior',
    salarioMin: item.preco ?? undefined,
    salarioMax: meta.salarioMax ?? undefined,
    localizacao: meta.localizacao || '',
    status: item.status === 'ativo' ? 'aberta' : item.status === 'pausado' ? 'em_andamento' : 'fechada',
    dataPublicacao: item.created_at,
    dataEncerramento: meta.dataEncerramento,
    link: meta.link,
    candidatos: meta.candidatos || 0,
    criadoPor: item.dono_id,
    criadoEm: item.created_at,
    atualizadoEm: item.updated_at,
  };
}

export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('catalogo_itens')
      .select('*')
      .eq('modulo', 'emprego')
      .neq('status', 'removido')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ success: true, data: (data || []).map(itemParaVaga) });
  } catch (error) {
    console.error('Erro ao listar vagas:', error);
    return NextResponse.json({ success: false, error: 'Erro ao listar vagas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const vaga = await request.json();
    if (!vaga.criadoPor) {
      return NextResponse.json({ success: false, error: 'criadoPor é obrigatório' }, { status: 400 });
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from('catalogo_itens')
      .insert({
        dono_id: vaga.criadoPor,
        modulo: 'emprego',
        categoria: vaga.tipo || 'CLT',
        titulo: vaga.titulo,
        descricao_publica: vaga.descricao,
        preco: vaga.salarioMin ?? null,
        midia: [],
        metadata: {
          empresa: vaga.empresa,
          requisitos: vaga.requisitos || [],
          beneficios: vaga.beneficios || [],
          tipo: vaga.tipo,
          modalidade: vaga.modalidade,
          nivel: vaga.nivel,
          salarioMax: vaga.salarioMax,
          localizacao: vaga.localizacao,
          link: vaga.link,
        },
      })
      .select('*')
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data: itemParaVaga(data) });
  } catch (error) {
    console.error('Erro ao criar vaga:', error);
    return NextResponse.json({ success: false, error: 'Erro ao criar vaga' }, { status: 500 });
  }
}
