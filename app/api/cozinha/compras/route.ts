import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'compras.json');

function ensureFile() {
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify([], null, 2));
  }
}

function readData() {
  ensureFile();
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}

function writeData(data: any) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

export async function GET() {
  try {
    const items = readData();
    return NextResponse.json({ success: true, data: items });
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao carregar compras' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items = readData();
    const now = new Date().toISOString();

    const newItem = {
      id: Date.now().toString(),
      nome: body.nome,
      unidade: body.unidade || 'un',
      quantidade: Number(body.quantidade || 0),
      preco_estimado: Number(body.preco_estimado || 0),
      preco_real: body.preco_real != null ? Number(body.preco_real) : undefined,
      fornecedor: body.fornecedor || '',
      comprado: Boolean(body.comprado),
      prioridade: body.prioridade || 'media',
      receita_origem: body.receita_origem || '',
      observacao: body.observacao || '',
      created_at: now,
      updated_at: now
    };

    items.push(newItem);
    writeData(items);
    return NextResponse.json({ success: true, data: newItem });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao criar item' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID não informado' }, { status: 400 });
    }

    const body = await request.json();
    const items = readData();
    const index = items.findIndex((item: any) => item.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Item não encontrado' }, { status: 404 });
    }

    items[index] = {
      ...items[index],
      ...body,
      updated_at: new Date().toISOString()
    };

    writeData(items);
    return NextResponse.json({ success: true, data: items[index] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao atualizar item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID não informado' }, { status: 400 });
    }

    const items = readData();
    const filtered = items.filter((item: any) => item.id !== id);
    writeData(filtered);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao excluir item' }, { status: 500 });
  }
}
