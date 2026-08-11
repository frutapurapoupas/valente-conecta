// Caminho: C:\valente_conecta\app\api\imoveis\route.ts
//
// Backend real para app/imoveis/page.tsx (ate aqui a pagina so tinha dados
// mockados via setTimeout e os fetches de publicar/contato apontavam para
// rotas inexistentes). Usa a fundacao unica do catalogo (catalogo_itens,
// modulo='imoveis') para participar da busca inteligente; campos especificos
// de imovel (quartos, banheiros, area, operacao...) ficam em `metadata`.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Sem isso, GET() sem argumentos e' tratado como estatico pelo Next.js e
// fica cacheado pra sempre a partir da primeira resposta — imoveis novos
// nunca apareceriam na listagem sem reiniciar o servidor.
export const dynamic = 'force-dynamic';

function itemParaImovel(item: any) {
  const meta = item.metadata || {};
  return {
    id: item.id,
    titulo: item.titulo,
    descricao: item.descricao_publica || '',
    tipo: meta.tipo || 'casa',
    operacao: meta.operacao || 'venda',
    preco: item.preco ?? 0,
    precoCondominio: meta.precoCondominio,
    area: meta.area || 0,
    quartos: meta.quartos || 0,
    banheiros: meta.banheiros || 0,
    vagas: meta.vagas || 0,
    endereco: meta.endereco || '',
    cidade: meta.cidade || 'Valente',
    bairro: meta.bairro || '',
    imagens: (item.midia || []).map((m: any) => m.url),
    caracteristicas: meta.caracteristicas || [],
    contatoNome: meta.contatoNome || '',
    contatoTelefone: meta.contatoTelefone || '',
    contatoEmail: meta.contatoEmail || '',
    dataPublicacao: item.created_at,
    destaque: !!meta.destaque,
    status: item.status === 'ativo' ? 'disponivel' : meta.operacao === 'aluguel' ? 'alugado' : 'vendido',
  };
}

export async function GET() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('catalogo_itens')
      .select('*')
      .eq('modulo', 'imoveis')
      .neq('status', 'removido')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ success: true, data: (data || []).map(itemParaImovel) });
  } catch (error) {
    console.error('Erro ao listar imóveis:', error);
    return NextResponse.json({ success: false, error: 'Erro ao listar imóveis', data: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.donoId) {
      return NextResponse.json({ success: false, error: 'donoId é obrigatório' }, { status: 400 });
    }
    const donoId = body.donoId;
    const supabase = createClient();
    const { data, error } = await supabase
      .from('catalogo_itens')
      .insert({
        dono_id: donoId,
        modulo: 'imoveis',
        categoria: body.tipo === 'casa' ? 'Casa' : body.tipo === 'apartamento' ? 'Apartamento' : body.tipo === 'terreno' ? 'Terreno' : 'Comercial',
        titulo: body.titulo,
        descricao_publica: body.descricao,
        preco: Number(body.preco) || 0,
        midia: [],
        metadata: {
          tipo: body.tipo,
          operacao: body.operacao,
          precoCondominio: body.precoCondominio,
          area: body.area,
          quartos: body.quartos,
          banheiros: body.banheiros,
          vagas: body.vagas,
          endereco: body.endereco,
          cidade: body.cidade,
          bairro: body.bairro,
          caracteristicas: body.caracteristicas || [],
          contatoNome: body.contatoNome,
          contatoTelefone: body.contatoTelefone,
          contatoEmail: body.contatoEmail,
          destaque: body.destaque,
        },
      })
      .select('*')
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data: itemParaImovel(data) });
  } catch (error) {
    console.error('Erro ao publicar imóvel:', error);
    return NextResponse.json({ success: false, error: 'Erro ao publicar imóvel' }, { status: 500 });
  }
}
