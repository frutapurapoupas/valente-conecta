import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'profissionais_agendamentos.json');

function ensureFile() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify([], null, 2));
  }
}

function read(): any[] {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

function write(data: any[]) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profissionalId = searchParams.get('profissionalId');

    let items = read();
    if (profissionalId) items = items.filter((i) => i.profissionalId === profissionalId);

    return NextResponse.json({ success: true, data: items });
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao carregar agendamentos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.profissionalId || !body.clienteNome?.trim() || !body.clienteTelefone?.trim() || !body.servico?.trim() || !body.data) {
      return NextResponse.json(
        { success: false, error: 'profissionalId, clienteNome, clienteTelefone, servico e data sÃ£o obrigatÃ³rios.' },
        { status: 400 }
      );
    }

    const items = read();
    const now = new Date().toISOString();

    const agendamento = {
      id: `ag_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      profissionalId: String(body.profissionalId),
      profissionalNome: String(body.profissionalNome || ''),
      clienteNome: String(body.clienteNome).trim(),
      clienteTelefone: String(body.clienteTelefone).trim(),
      servico: String(body.servico).trim(),
      data: String(body.data),
      horario: String(body.horario || ''),
      observacoes: String(body.observacoes || '').trim(),
      valorEstimado: Number(body.valorEstimado || 0),
      status: 'pendente',
      createdAt: now,
      updatedAt: now
    };

    items.unshift(agendamento);
    write(items);

    return NextResponse.json({ success: true, data: agendamento });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID nÃ£o informado' }, { status: 400 });

    const body = await request.json();
    const items = read();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return NextResponse.json({ success: false, error: 'Agendamento nÃ£o encontrado' }, { status: 404 });

    items[idx] = { ...items[idx], ...body, id, updatedAt: new Date().toISOString() };
    write(items);

    return NextResponse.json({ success: true, data: items[idx] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

