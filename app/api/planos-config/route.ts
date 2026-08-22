// Caminho: C:\valente_conecta\app\api\planos-config\route.ts
//
// Reescrita sobre Supabase (admin_configuracoes, chave='planos_config') —
// antes gravava em data/planos_config.json, que nao sobrevive a runtime
// serverless. Mesmo formato de dados consumido por app/planos/page.tsx e
// app/admin-master/usuarios/planos/page.tsx.
//
// Adiciona por plano: descontoPixRecorrenteAtivo / descontoPixRecorrentePercent
// — desconto opcional para quem assina pagando via PIX parcelado por 12
// meses (pedido do usuario do projeto). Sugestao de percentual baixo (5%)
// como ponto de partida configuravel pelo admin master.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const CHAVE = 'planos_config';

type PlanId = 'gratis' | 'basico' | 'premium' | 'fisco';

const SERVICE_NAMES = [
  'ACADEMIA - ALUNO',
  'ACADEMIA - EMPRESA',
  'AMBULANTES',
  'SERVICOS COM AGENDAMENTO',
  'MERCEARIA PEQUENA',
  'MERCADO GRANDE',
  'LOJAS',
  'PROFISSIONAIS LIBERAIS',
  'UTILIDADES',
  'MOTO TAXI',
  'TRANSPORTE',
  'ALIMENTACAO',
  'IMOVEIS',
  'SAUDE',
  'HOTEL / POUSADA',
  'PUBLICO GERAL'
];

// Servicos de comercio: habilitam plano Fisco/Contabilidade e pedem
// faturamento bruto (opcional) no formulario pos-pagamento.
const SERVICOS_COMERCIO = ['MERCEARIA PEQUENA', 'MERCADO GRANDE', 'LOJAS', 'ALIMENTACAO', 'HOTEL / POUSADA'];

function buildService(nome: string) {
  const isComercio = SERVICOS_COMERCIO.includes(nome);
  const enabledPlans: PlanId[] = isComercio ? ['gratis', 'basico', 'premium', 'fisco'] : ['gratis', 'basico', 'premium'];

  return {
    id: nome.toLowerCase().replace(/\s*\/\s*/g, '_').replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
    nome,
    tipo: isComercio ? 'comercio' : 'servico',
    enabledPlans,
    planFeatures: {
      gratis: [
        'Publicacao com 1 foto por item',
        'Descricao e preco visiveis',
        'Contato borrado (desbloqueio R$ 0,50 por cliente)'
      ],
      basico: [
        'R$ 15,00 / mes',
        '1 foto por item',
        'Nome da loja e endereco liberados',
        'Anuncio aberto para todos os clientes'
      ],
      premium: [
        '5 fotos por item',
        'Anuncio com destaque na listagem',
        'Anuncio aberto para todos os clientes',
        'Prioridade maior de exibicao'
      ],
      fisco: isComercio
        ? [
            'Integracao fiscal/contabil',
            'Relatorios gerenciais',
            'Suporte de implantacao',
            'Valor a negociar'
          ]
        : []
    },
    // Modulo de fiado (PDV, ver app/pdv/fiado) como acrescimo opcional ao
    // preco do plano escolhido — so' faz sentido pra quem vende de fato.
    addonFiado: nome === 'MERCADO GRANDE' || nome === 'MERCEARIA PEQUENA'
      ? { disponivel: true, precoAdicional: nome === 'MERCADO GRANDE' ? 15 : 10, descricao: 'Modulo de fiado (controle de clientes fiado direto no PDV)' }
      : { disponivel: false, precoAdicional: 0, descricao: '' }
  };
}

const defaultConfig = {
  version: 1,
  updatedAt: new Date().toISOString(),
  settings: {
    unlockContactPrice: 0.5,
    blurContactOnFree: true,
    paidAdsOpen: true,
    freePhotosPerItem: 1,
    basicoPhotosPerItem: 1,
    premiumPhotosPerItem: 5
  },
  plans: [
    {
      id: 'gratis',
      nome: 'Gratis',
      preco: 0,
      periodo: 'mes',
      negociavel: false,
      ativo: true,
      descricao: 'Entrada para começar no app',
      fotosPorItem: 1,
      featuresPadrao: [
        'Anuncio com foto, descricao e preco',
        '1 foto por produto/servico',
        'Contato da loja borrado para o cliente',
        'Cliente pode desbloquear contato por R$ 0,50'
      ],
      descontoPixRecorrenteAtivo: false,
      descontoPixRecorrentePercent: 5
    },
    {
      id: 'basico',
      nome: 'Basico',
      preco: 15,
      periodo: 'mes',
      negociavel: false,
      ativo: true,
      descricao: 'Plano pago com anuncio aberto',
      fotosPorItem: 1,
      featuresPadrao: [
        'Anuncio aberto (nome, endereco e localizador visiveis)',
        '1 foto por produto/servico',
        'Recebimento de contatos sem desbloqueio',
        'Prioridade normal de exibicao'
      ],
      descontoPixRecorrenteAtivo: false,
      descontoPixRecorrentePercent: 5
    },
    {
      id: 'premium',
      nome: 'Premium',
      preco: 29.9,
      periodo: 'mes',
      negociavel: false,
      ativo: true,
      descricao: 'Maior destaque e mais fotos',
      fotosPorItem: 5,
      featuresPadrao: [
        'Anuncio aberto (nome, endereco e localizador visiveis)',
        '5 fotos por produto/servico',
        'Destaque no topo das buscas',
        'Maior prioridade nas recomendacoes'
      ],
      descontoPixRecorrenteAtivo: false,
      descontoPixRecorrentePercent: 5
    },
    {
      id: 'fisco',
      nome: 'Fisco / Contabilidade',
      preco: null,
      periodo: 'mes',
      negociavel: true,
      ativo: true,
      descricao: 'Integracao fiscal e contabil (valor a negociar)',
      fotosPorItem: 5,
      featuresPadrao: [
        'Integracao com rotinas fiscais',
        'Integracao contabil e relatorios avancados',
        'Suporte de implantacao',
        'Valor sob consulta'
      ],
      descontoPixRecorrenteAtivo: false,
      descontoPixRecorrentePercent: 5
    }
  ],
  services: SERVICE_NAMES.map(buildService)
};

async function readConfig() {
  const supabase = createClient();
  const { data } = await supabase.from('admin_configuracoes').select('id, valor').eq('chave', CHAVE).maybeSingle();
  if (!data?.valor) return defaultConfig;

  try {
    const parsed = JSON.parse(data.valor);
    const services = Array.isArray(parsed?.services) ? parsed.services : [];
    // 'MERCEARIA / MERCADOS' virou dois servicos (MERCEARIA PEQUENA / MERCADO
    // GRANDE) — remove a entrada antiga de configs salvas antes dessa mudanca.
    const normalized = services.filter((service: any) => service?.nome !== 'MERCEARIA / MERCADOS');
    for (const serviceName of SERVICE_NAMES) {
      const exists = normalized.some((service: any) => service?.nome === serviceName);
      if (!exists) normalized.push(buildService(serviceName));
    }
    // Garante addonFiado/tipo mesmo em servicos salvos antes desses campos existirem.
    for (const service of normalized) {
      const fresh = SERVICE_NAMES.includes(service.nome) ? buildService(service.nome) : null;
      if (!service.addonFiado) service.addonFiado = fresh?.addonFiado || { disponivel: false, precoAdicional: 0, descricao: '' };
      if (!service.tipo) service.tipo = fresh?.tipo || 'servico';
    }
    // Garante os campos novos de desconto PIX mesmo em config salva antes deles existirem.
    const plans = (Array.isArray(parsed?.plans) ? parsed.plans : defaultConfig.plans).map((p: any) => ({
      descontoPixRecorrenteAtivo: false,
      descontoPixRecorrentePercent: 5,
      ...p,
    }));
    return { ...parsed, plans, services: normalized };
  } catch {
    return defaultConfig;
  }
}

// Sem isso, GET() sem argumentos e' tratado como estatico pelo Next.js e
// fica cacheado pra sempre a partir da primeira resposta.
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  try {
    const data = await readConfig();
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao carregar configuracao de planos.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body || !Array.isArray(body.plans) || !Array.isArray(body.services)) {
      return NextResponse.json({ success: false, error: 'Payload invalido.' }, { status: 400 });
    }

    const next = {
      version: Number(body.version || 1),
      settings: body.settings || defaultConfig.settings,
      plans: body.plans,
      services: body.services,
      updatedAt: new Date().toISOString(),
    };

    const supabase = createClient();
    const { data: atual } = await supabase.from('admin_configuracoes').select('id').eq('chave', CHAVE).maybeSingle();
    if (atual) {
      const { error } = await supabase.from('admin_configuracoes').update({ valor: JSON.stringify(next) }).eq('id', atual.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('admin_configuracoes')
        .insert({ chave: CHAVE, valor: JSON.stringify(next), descricao: 'Planos, preços e regras por serviço' });
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Erro ao salvar.' }, { status: 500 });
  }
}
