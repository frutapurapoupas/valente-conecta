// Caminho: C:\valente_conecta\lib\busca\buscarTudo.ts
//
// Busca unificada nas 4 fontes que hoje viviam separadas (catalogo_itens
// via RPC, comercios_diretorio/saude_estabelecimentos/agua_gas_fornecedores
// via buscarDiretoriosLivres) — reaproveita as funções que já existem em
// vez de duplicar acesso a banco. Sem termo de busca (navegação por
// categoria, sem digitar nada), pula a IA e devolve a listagem normal do
// módulo, tudo em "diretos" — só busca de verdade (com texto) passa pela
// interpretação de intenção.

import { buscarVitrine, buscarDiretoriosLivres, buscarCozinhaChefNeide } from '@/lib/catalogo/catalogoService';
import type { ResultadoVitrine, FiltrosBusca } from '@/lib/catalogo/marketplaceTypes';
import { interpretarIntencaoBusca } from './interpretarIntencao';

export interface ResultadoAgrupado extends ResultadoVitrine {
  grupo: 'direto' | 'relacionado';
}

export interface BuscaInteligenteResultado {
  diretos: ResultadoAgrupado[];
  relacionados: ResultadoAgrupado[];
  termosUsados: { diretos: string[]; relacionados: string[] };
  mensagemHumanizada?: string;
}

interface FiltrosBuscaInteligente {
  modulo?: string;
  categoria?: string;
  latUsuario?: number;
  lngUsuario?: number;
  usuarioId?: string;
}

async function buscarPorTermo(termo: string | undefined, filtros: FiltrosBuscaInteligente): Promise<ResultadoVitrine[]> {
  const filtrosBusca: FiltrosBusca = {
    termo,
    modulo: filtros.modulo,
    categoria: filtros.categoria,
    latUsuario: filtros.latUsuario,
    lngUsuario: filtros.lngUsuario,
  };
  const [vitrine, diretorios, cozinha] = await Promise.all([
    buscarVitrine(filtrosBusca).catch(() => []),
    buscarDiretoriosLivres(filtrosBusca).catch(() => []),
    buscarCozinhaChefNeide(filtrosBusca).catch(() => []),
  ]);
  return [...vitrine, ...diretorios, ...cozinha];
}

export async function buscarInteligente(query: string, filtros: FiltrosBuscaInteligente = {}): Promise<BuscaInteligenteResultado> {
  const termoLimpo = query.trim();

  // Sem termo digitado -- e' navegacao/listagem do modulo, nao busca. Nunca
  // chama IA nem faz sentido separar "direto"/"relacionado" aqui.
  if (!termoLimpo) {
    const itens = await buscarPorTermo(undefined, filtros);
    return { diretos: itens.map((i) => ({ ...i, grupo: 'direto' as const })), relacionados: [], termosUsados: { diretos: [], relacionados: [] } };
  }

  const intencao = await interpretarIntencaoBusca(termoLimpo, filtros.usuarioId);

  const [porTermoDireto, porTermoRelacionado] = await Promise.all([
    Promise.all(intencao.termosDiretos.map((t) => buscarPorTermo(t, filtros))),
    Promise.all(intencao.termosRelacionados.map((t) => buscarPorTermo(t, filtros))),
  ]);

  const vistos = new Set<string>();
  const diretos: ResultadoAgrupado[] = [];
  for (const lista of porTermoDireto) {
    for (const item of lista) {
      if (vistos.has(item.id)) continue;
      vistos.add(item.id);
      diretos.push({ ...item, grupo: 'direto' });
    }
  }
  const relacionados: ResultadoAgrupado[] = [];
  for (const lista of porTermoRelacionado) {
    for (const item of lista) {
      if (vistos.has(item.id)) continue;
      vistos.add(item.id);
      relacionados.push({ ...item, grupo: 'relacionado' });
    }
  }

  return {
    diretos,
    relacionados,
    termosUsados: { diretos: intencao.termosDiretos, relacionados: intencao.termosRelacionados },
    mensagemHumanizada: intencao.mensagemHumanizada,
  };
}
