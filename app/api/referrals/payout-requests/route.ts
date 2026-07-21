import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'referral_payout_requests.json');

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const items = readData();
    const filtered = userId ? items.filter((item: any) => item.userId === userId) : items;
    return NextResponse.json({ success: true, data: filtered });
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao carregar solicitaÃ§Ãµes PIX' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items = readData();
    const newItem = {
      id: `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      userId: body.userId,
      userName: body.userName || 'UsuÃ¡rio',
      userWhatsapp: body.userWhatsapp || '',
      pixKey: body.pixKey,
      amount: Number(body.amount || 0),
      status: 'pendente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.unshift(newItem);
    writeData(items);
    return NextResponse.json({ success: true, data: newItem });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao registrar solicitaÃ§Ã£o PIX' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID nÃ£o informado' }, { status: 400 });
    }
    const body = await request.json();
    const items = readData();
    const index = items.findIndex((item: any) => item.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'SolicitaÃ§Ã£o nÃ£o encontrada' }, { status: 404 });
    }
    items[index] = {
      ...items[index],
      ...body,
      updatedAt: new Date().toISOString()
    };
    writeData(items);
    return NextResponse.json({ success: true, data: items[index] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao atualizar solicitaÃ§Ã£o PIX' }, { status: 500 });
  }
}

