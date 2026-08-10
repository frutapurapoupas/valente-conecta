import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'referral_config.json');

const defaultConfig = {
  rules: [
    { id: 'usuarios_gerais', nome: 'Usuários Gerais', bonus: 10, meta: 30, ativo: true, descricao: 'R$10 por cada lote de 30 usuários novos validados' },
    { id: 'empresas_lojas', nome: 'Empresas / Lojas', bonus: 5, meta: 3, ativo: true, descricao: 'R$5 por cada lote de 3 empresas ou lojas validadas' },
    { id: 'profissionais_liberais', nome: 'Profissionais Liberais', bonus: 4, meta: 5, ativo: true, descricao: 'R$4 por cada lote de 5 profissionais liberais validados' }
  ],
  content: {
    publicHeadline: 'Ganhe dinheiro indicando!',
    publicSubtitle: 'Receba bônus por lotes de indicações validadas.',
    explanationTitle: 'Como funcionam as bonificações',
    explanationText: 'Cada bônus é liberado por lote validado: usuários gerais, empresas/lojas e profissionais liberais. Quando um lote fecha, o valor fica disponível para solicitação via PIX.',
    shareTemplate: 'Use meu código {codigo}. Bônus por lotes validados no Valente Conecta. Link: {link}'
  },
  pixMinimo: 1,
  updatedAt: new Date().toISOString()
};

function ensureFile() {
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify(defaultConfig, null, 2));
  }
}

function readData() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  } catch {
    return defaultConfig;
  }
}

function writeData(data: any) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

export async function GET() {
  return NextResponse.json({ success: true, data: readData() });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const current = readData();
    const next = {
      ...current,
      ...body,
      updatedAt: new Date().toISOString()
    };
    writeData(next);
    return NextResponse.json({ success: true, data: next });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar configuração' }, { status: 500 });
  }
}

