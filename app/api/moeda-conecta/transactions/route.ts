import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'moeda_conecta_transacoes.json');

interface TransactionItem {
  id: string;
  tipo: 'pagar' | 'receber';
  valor: number;
  remetenteId: string;
  remetenteNome: string;
  destinatarioQr: string;
  destinatarioId: string;
  cidadeBase: string;
  descricao: string;
  status: 'concluida' | 'pendente' | 'cancelada';
  createdAt: string;
}

const seedData = {
  version: 1,
  updatedAt: new Date().toISOString(),
  transactions: [] as TransactionItem[]
};

function ensureDataFile() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify(seedData, null, 2));
  }
}

function readData() {
  ensureDataFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    if (!Array.isArray(parsed.transactions)) parsed.transactions = [];
    return parsed;
  } catch {
    return seedData;
  }
}

function writeData(data: any) {
  fs.writeFileSync(
    DATA_PATH,
    JSON.stringify({ ...data, updatedAt: new Date().toISOString() }, null, 2)
  );
}

function parseQr(qrCode: string) {
  const raw = String(qrCode || '').trim();
  if (!raw) return { userId: '', cidadeBase: '' };
  const normalized = raw.replace('MC-', '');
  const parts = normalized.split('|');
  return {
    userId: String(parts[0] || '').trim(),
    cidadeBase: String(parts[1] || '').trim().toUpperCase()
  };
}

export async function GET(request: NextRequest) {
  try {
    const data = readData();
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get('userId');
    const cidadeBase = String(searchParams.get('cidadeBase') || '').trim().toUpperCase();
    const limit = Number(searchParams.get('limit') || 200);

    let transactions = data.transactions as TransactionItem[];

    if (cidadeBase) {
      transactions = transactions.filter((item) => String(item.cidadeBase || '').toUpperCase() === cidadeBase);
    }

    if (userId) {
      transactions = transactions.filter(
        (item) => item.remetenteId === userId || item.destinatarioId === userId
      );
    }

    transactions = [...transactions]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, Math.max(1, Math.min(limit, 1000)));

    return NextResponse.json({ success: true, data: transactions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Erro ao carregar transacoes.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tipo = String(body?.tipo || 'pagar').toLowerCase();
    const valor = Number(body?.valor || 0);

    if (!['pagar', 'receber'].includes(tipo)) {
      return NextResponse.json({ success: false, error: 'Tipo invalido.' }, { status: 400 });
    }

    if (!Number.isFinite(valor) || valor <= 0) {
      return NextResponse.json({ success: false, error: 'Valor invalido.' }, { status: 400 });
    }

    const remetenteId = String(body?.remetenteId || '').trim();
    const remetenteNome = String(body?.remetenteNome || '').trim();
    const cidadeBase = String(body?.cidadeBase || '').trim().toUpperCase();
    const destinatarioQr = String(body?.destinatarioQr || '').trim();
    const descricao = String(body?.descricao || '').trim() || 'Transferencia Moeda Conecta';

    if (!remetenteId || !remetenteNome || !cidadeBase || !destinatarioQr) {
      return NextResponse.json({ success: false, error: 'Dados obrigatorios ausentes.' }, { status: 400 });
    }

    const qrInfo = parseQr(destinatarioQr);
    if (!qrInfo.userId) {
      return NextResponse.json({ success: false, error: 'QR Code invalido.' }, { status: 400 });
    }

    if (qrInfo.cidadeBase && qrInfo.cidadeBase !== cidadeBase) {
      return NextResponse.json({ success: false, error: 'Transacao permitida apenas dentro da cidade base ativa.' }, { status: 400 });
    }

    const data = readData();
    const transaction: TransactionItem = {
      id: `mc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      tipo: tipo as 'pagar' | 'receber',
      valor,
      remetenteId,
      remetenteNome,
      destinatarioQr,
      destinatarioId: qrInfo.userId,
      cidadeBase,
      descricao,
      status: 'concluida',
      createdAt: new Date().toISOString()
    };

    data.transactions.unshift(transaction);
    writeData(data);

    return NextResponse.json({ success: true, data: transaction });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Erro ao registrar transacao.' }, { status: 500 });
  }
}

