import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'planos_config.json');

type PlanId = 'gratis' | 'basico' | 'premium' | 'fisco';

const SERVICE_NAMES = [
  'ACADEMIA - ALUNO',
  'ACADEMIA - EMPRESA',
  'AMBULANTES',
  'SERVICOS COM AGENDAMENTO',
  'MERCEARIA / MERCADOS',
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

function buildService(nome: string) {
  const isComercio = nome === 'MERCEARIA / MERCADOS' || nome === 'LOJAS';
  const enabledPlans: PlanId[] = isComercio ? ['gratis', 'basico', 'premium', 'fisco'] : ['gratis', 'basico', 'premium'];

  return {
    id: nome.toLowerCase().replace(/\s*\/\s*/g, '_').replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
    nome,
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
    }
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
      descricao: 'Entrada para comeÃ§ar no app',
      fotosPorItem: 1,
      featuresPadrao: [
        'Anuncio com foto, descricao e preco',
        '1 foto por produto/servico',
        'Contato da loja borrado para o cliente',
        'Cliente pode desbloquear contato por R$ 0,50'
      ]
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
      ]
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
      ]
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
      ]
    }
  ],
  services: SERVICE_NAMES.map(buildService)
};

function ensureFile() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(defaultConfig, null, 2));
  }
}

function readConfig() {
  ensureFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    const services = Array.isArray(parsed?.services) ? parsed.services : [];
    const normalized = [...services];

    for (const serviceName of SERVICE_NAMES) {
      const exists = normalized.some((service: any) => service?.nome === serviceName);
      if (!exists) {
        normalized.push(buildService(serviceName));
      }
    }

    return {
      ...parsed,
      services: normalized
    };
  } catch {
    return defaultConfig;
  }
}

function writeConfig(data: any) {
  fs.writeFileSync(
    DATA_PATH,
    JSON.stringify({ ...data, updatedAt: new Date().toISOString() }, null, 2)
  );
}

export async function GET() {
  try {
    const data = readConfig();
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

    writeConfig({
      version: Number(body.version || 1),
      settings: body.settings || defaultConfig.settings,
      plans: body.plans,
      services: body.services
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Erro ao salvar.' }, { status: 500 });
  }
}

