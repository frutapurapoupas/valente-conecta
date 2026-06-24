import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const FORNECEDORES_PATH = path.join(process.cwd(), 'data', 'agua_gas_fornecedores.json');
const PEDIDOS_PATH     = path.join(process.cwd(), 'data', 'agua_gas_pedidos.json');

function ensureFile(p: string, def: any[] = []) {
  if (!fs.existsSync(p)) fs.writeFileSync(p, JSON.stringify(def, null, 2));
}
function read(p: string): any[] {
  ensureFile(p);
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return []; }
}
function write(p: string, data: any[]) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
}

// ── Fornecedores ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const recurso = searchParams.get('recurso') || 'fornecedores';

  if (recurso === 'pedidos') {
    const fornecedorId = searchParams.get('fornecedorId');
    let items = read(PEDIDOS_PATH);
    if (fornecedorId) items = items.filter((i) => i.fornecedorId === fornecedorId);
    return NextResponse.json({ success: true, data: items });
  }

  // fornecedores
  const status  = searchParams.get('status');
  const tipo    = searchParams.get('tipo');
  const busca   = (searchParams.get('busca') || '').toLowerCase();
  let items = read(FORNECEDORES_PATH);
  if (status) items = items.filter((i) => i.status === status);
  if (tipo)   items = items.filter((i) => Array.isArray(i.produtos) && i.produtos.some((p: any) => p.tipo === tipo));
  if (busca)  items = items.filter((i) =>
    i.nome?.toLowerCase().includes(busca) ||
    i.bairro?.toLowerCase().includes(busca) ||
    i.produtos?.some((p: any) => p.descricao?.toLowerCase().includes(busca))
  );
  return NextResponse.json({ success: true, data: items });
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const recurso = searchParams.get('recurso') || 'fornecedores';
  const body = await request.json();
  const now = new Date().toISOString();

  if (recurso === 'pedidos') {
    if (!body.fornecedorId || !body.clienteNome?.trim() || !body.clienteTelefone?.trim() || !body.produto?.trim()) {
      return NextResponse.json({ success: false, error: 'fornecedorId, clienteNome, clienteTelefone e produto são obrigatórios.' }, { status: 400 });
    }
    const items = read(PEDIDOS_PATH);
    const novo = {
      id: `agpedido_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      fornecedorId: String(body.fornecedorId),
      fornecedorNome: String(body.fornecedorNome || ''),
      clienteNome: String(body.clienteNome).trim(),
      clienteTelefone: String(body.clienteTelefone).trim(),
      produto: String(body.produto).trim(),
      quantidade: Number(body.quantidade || 1),
      endereco: String(body.endereco || '').trim(),
      observacoes: String(body.observacoes || '').trim(),
      status: 'pendente',
      createdAt: now,
      updatedAt: now
    };
    items.unshift(novo);
    write(PEDIDOS_PATH, items);
    return NextResponse.json({ success: true, data: novo });
  }

  // fornecedor
  if (!body.nome?.trim() || !body.telefone?.trim()) {
    return NextResponse.json({ success: false, error: 'Nome e telefone são obrigatórios.' }, { status: 400 });
  }
  const items = read(FORNECEDORES_PATH);
  const novo = {
    id: `agforn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    nome: String(body.nome).trim(),
    responsavel: String(body.responsavel || '').trim(),
    telefone: String(body.telefone).trim(),
    whatsapp: String(body.whatsapp || body.telefone).trim(),
    bairro: String(body.bairro || '').trim(),
    cidade: String(body.cidade || 'Valente').trim(),
    descricao: String(body.descricao || '').trim(),
    foto: String(body.foto || '').trim(),
    horario: String(body.horario || '').trim(),
    temEntrega: Boolean(body.temEntrega ?? true),
    taxaEntrega: Number(body.taxaEntrega || 0),
    freteGratisAcima: Number(body.freteGratisAcima || 0),
    produtos: Array.isArray(body.produtos) ? body.produtos : [],
    status: 'pendente',
    destaque: false,
    createdAt: now,
    updatedAt: now
  };
  items.unshift(novo);
  write(FORNECEDORES_PATH, items);
  return NextResponse.json({ success: true, data: novo });
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const recurso = searchParams.get('recurso') || 'fornecedores';
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'ID não informado.' }, { status: 400 });

  const filePath = recurso === 'pedidos' ? PEDIDOS_PATH : FORNECEDORES_PATH;
  const body = await request.json();
  const items = read(filePath);
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return NextResponse.json({ success: false, error: 'Registro não encontrado.' }, { status: 404 });

  items[idx] = { ...items[idx], ...body, id, updatedAt: new Date().toISOString() };
  write(filePath, items);
  return NextResponse.json({ success: true, data: items[idx] });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const recurso = searchParams.get('recurso') || 'fornecedores';
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'ID não informado.' }, { status: 400 });

  const filePath = recurso === 'pedidos' ? PEDIDOS_PATH : FORNECEDORES_PATH;
  const items = read(filePath);
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) return NextResponse.json({ success: false, error: 'Não encontrado.' }, { status: 404 });
  write(filePath, filtered);
  return NextResponse.json({ success: true });
}
