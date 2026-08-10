import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'profissionais.json');

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
    const categoria = searchParams.get('categoria');
    const status = searchParams.get('status');
    const busca = (searchParams.get('busca') || '').toLowerCase();

    let items = read();

    if (categoria) items = items.filter((i) => i.categoria === categoria);
    if (status) items = items.filter((i) => i.status === status);
    if (busca) {
      items = items.filter(
        (i) =>
          i.nome?.toLowerCase().includes(busca) ||
          i.descricao?.toLowerCase().includes(busca) ||
          i.especialidades?.some((e: string) => e.toLowerCase().includes(busca)) ||
          i.categoria?.toLowerCase().includes(busca)
      );
    }

    return NextResponse.json({ success: true, data: items });
  } catch {
    return NextResponse.json({ success: false, error: 'Erro ao carregar profissionais' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.nome?.trim() || !body.categoria?.trim() || !body.telefone?.trim()) {
      return NextResponse.json({ success: false, error: 'Nome, categoria e telefone são obrigatórios.' }, { status: 400 });
    }

    const items = read();
    const now = new Date().toISOString();

    const novoProfissional = {
      id: `prof_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      nome: String(body.nome).trim(),
      foto: String(body.foto || '').trim(),
      categoria: String(body.categoria).trim(),
      especialidades: Array.isArray(body.especialidades)
        ? body.especialidades
        : String(body.especialidades || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      descricao: String(body.descricao || '').trim(),
      experiencia: Number(body.experiencia || 0),
      bairro: String(body.bairro || '').trim(),
      cidade: String(body.cidade || 'Valente').trim(),
      telefone: String(body.telefone).trim(),
      whatsapp: String(body.whatsapp || body.telefone || '').trim(),
      precoHora: Number(body.precoHora || 0),
      precoServico: Number(body.precoServico || 0),
      disponibilidade: String(body.disponibilidade || '').trim(),
      plano: String(body.plano || 'basico'),
      status: 'pendente',
      avaliacao: 0,
      totalAvaliacoes: 0,
      destaque: false,
      createdAt: now,
      updatedAt: now
    };

    items.unshift(novoProfissional);
    write(items);

    return NextResponse.json({ success: true, data: novoProfissional });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Erro ao cadastrar' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID não informado' }, { status: 400 });

    const body = await request.json();
    const items = read();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return NextResponse.json({ success: false, error: 'Profissional não encontrado' }, { status: 404 });

    items[idx] = { ...items[idx], ...body, id, updatedAt: new Date().toISOString() };
    write(items);

    return NextResponse.json({ success: true, data: items[idx] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID não informado' }, { status: 400 });

    const items = read();
    const filtered = items.filter((i) => i.id !== id);
    if (filtered.length === items.length) {
      return NextResponse.json({ success: false, error: 'Profissional não encontrado' }, { status: 404 });
    }

    write(filtered);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

