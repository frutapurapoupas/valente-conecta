import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@/lib/supabase/server';

type CardapioSchema = 'cardapio' | 'cozinha_cardapio' | 'file_fallback';
type CardapioPayload = {
  id: string;
  receita_id: string;
  dia_semana: number;
  periodo: string;
  preco_customizado: number | null;
  usar_preco_da_receita: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
};

const CARDAPIO_FILE = path.join(process.cwd(), 'data', 'cardapio.json');

function asNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return fallback;
}

function ensureCardapioFile() {
  const dir = path.dirname(CARDAPIO_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(CARDAPIO_FILE)) {
    fs.writeFileSync(CARDAPIO_FILE, '[]', 'utf-8');
  }
}

function readFileCardapio(): CardapioPayload[] {
  try {
    ensureCardapioFile();
    const raw = fs.readFileSync(CARDAPIO_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeFileCardapio(items: CardapioPayload[]) {
  ensureCardapioFile();
  fs.writeFileSync(CARDAPIO_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

function normalizeRow(row: any, source: CardapioSchema) {
  if (source === 'cozinha_cardapio') {
    return {
      ...row,
      receita_id: row?.recipe_id ?? null,
      dia_semana: row?.day_of_week ?? null,
      preco_customizado: row?.custom_price ?? null,
      is_available: row?.is_available ?? true,
      receitaId: row?.recipe_id ?? null,
      diaSemana: row?.day_of_week ?? null,
      precoCustomizado: row?.custom_price ?? null,
      isAvailable: row?.is_available ?? true,
      usar_preco_da_receita: true,
      usarPrecoDaReceita: true,
    };
  }

  return {
    ...row,
    receitaId: row?.receita_id ?? null,
    diaSemana: row?.dia_semana ?? null,
    precoCustomizado: row?.preco_customizado ?? null,
    isAvailable: row?.is_available ?? true,
    usarPrecoDaReceita: row?.usar_preco_da_receita ?? true,
  };
}

async function resolveCardapioSchema(supabase: any): Promise<CardapioSchema> {
  const legacyTry = await supabase
    .from('cardapio')
    .select('*')
    .limit(1);

  if (!legacyTry.error) {
    return 'cardapio';
  }

  const cozinhaTry = await supabase
    .from('cozinha_cardapio')
    .select('*')
    .limit(1);

  if (!cozinhaTry.error) {
    return 'cozinha_cardapio';
  }

  const legacyNotFound = legacyTry.error?.code === 'PGRST205';
  const cozinhaNotFound = cozinhaTry.error?.code === 'PGRST205';

  if (legacyNotFound && cozinhaNotFound) {
    return 'file_fallback';
  }

  throw legacyTry.error || cozinhaTry.error || new Error('Tabela de cardapio nao encontrada');
}

export async function GET() {
  try {
    const supabase = createClient();
    const source = await resolveCardapioSchema(supabase);

    if (source === 'file_fallback') {
      const data = readFileCardapio();
      const ordered = data.sort((a, b) => Number(a.dia_semana ?? 0) - Number(b.dia_semana ?? 0));
      return NextResponse.json({ success: true, data: ordered.map((row) => normalizeRow(row, 'cardapio')) });
    }

    const { data, error } = await supabase
      .from(source)
      .select('*')
      .order(source === 'cozinha_cardapio' ? 'day_of_week' : 'dia_semana', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, data: (data || []).map((row: any) => normalizeRow(row, source)) });
  } catch (error) {
    console.error('Erro ao buscar cardápio:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar cardápio' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const source = await resolveCardapioSchema(supabase);
    const body = await request.json();

    const receitaId = String(body?.receitaId ?? body?.receita_id ?? body?.recipe_id ?? body?.prato_id ?? '');
    const diaSemana = Number(body?.diaSemana ?? body?.dia_semana ?? body?.day_of_week ?? 0);
    const periodo = String(body?.periodo ?? 'almoco');
    const precoCustomizado = asNullableNumber(body?.precoCustomizado ?? body?.preco_customizado ?? body?.custom_price);
    const usarPrecoDaReceita = asBoolean(body?.usarPrecoDaReceita ?? body?.usar_preco_da_receita, true);
    const isAvailable = asBoolean(body?.isAvailable ?? body?.is_available ?? body?.disponivel, true);

    if (!receitaId) {
      return NextResponse.json(
        { success: false, error: 'receitaId nao informado' },
        { status: 400 }
      );
    }

    if (source === 'file_fallback') {
      const now = new Date().toISOString();
      const item: CardapioPayload = {
        id: String(body?.id ?? crypto.randomUUID()),
        receita_id: receitaId,
        dia_semana: diaSemana,
        periodo,
        preco_customizado: precoCustomizado,
        usar_preco_da_receita: usarPrecoDaReceita,
        is_available: isAvailable,
        created_at: now,
        updated_at: now,
      };
      const list = readFileCardapio();
      list.push(item);
      writeFileCardapio(list);
      return NextResponse.json({ success: true, data: normalizeRow(item, 'cardapio') });
    }

    const payload = source === 'cozinha_cardapio'
      ? {
        id: String(body?.id ?? crypto.randomUUID()),
        recipe_id: receitaId,
        day_of_week: diaSemana,
        period: periodo,
        custom_price: precoCustomizado,
        is_available: isAvailable,
        updated_at: new Date().toISOString(),
      }
      : {
        receita_id: receitaId,
        dia_semana: diaSemana,
        periodo,
        preco_customizado: precoCustomizado,
        usar_preco_da_receita: usarPrecoDaReceita,
        is_available: isAvailable,
        updated_at: new Date().toISOString(),
      };

    const { data, error } = await supabase
      .from(source)
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data: normalizeRow(data, source) });
  } catch (error) {
    console.error('Erro ao criar item de cardapio:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar item de cardapio' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createClient();
    const source = await resolveCardapioSchema(supabase);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const targetId = String(id ?? body?.id ?? '');

    if (!targetId) {
      return NextResponse.json(
        { success: false, error: 'ID nao informado' },
        { status: 400 }
      );
    }

    if (source === 'file_fallback') {
      const list = readFileCardapio();
      const index = list.findIndex((item) => String(item.id) === targetId);
      if (index < 0) {
        return NextResponse.json(
          { success: false, error: 'Item nao encontrado' },
          { status: 404 }
        );
      }

      const current = list[index];
      const updated: CardapioPayload = {
        ...current,
        receita_id: ('receitaId' in body || 'receita_id' in body || 'recipe_id' in body || 'prato_id' in body)
          ? String(body?.receitaId ?? body?.receita_id ?? body?.recipe_id ?? body?.prato_id ?? current.receita_id)
          : current.receita_id,
        dia_semana: ('diaSemana' in body || 'dia_semana' in body || 'day_of_week' in body)
          ? Number(body?.diaSemana ?? body?.dia_semana ?? body?.day_of_week ?? current.dia_semana)
          : current.dia_semana,
        periodo: ('periodo' in body || 'period' in body)
          ? String(body?.periodo ?? body?.period ?? current.periodo)
          : current.periodo,
        preco_customizado: ('precoCustomizado' in body || 'preco_customizado' in body || 'custom_price' in body)
          ? asNullableNumber(body?.precoCustomizado ?? body?.preco_customizado ?? body?.custom_price)
          : current.preco_customizado,
        usar_preco_da_receita: ('usarPrecoDaReceita' in body || 'usar_preco_da_receita' in body)
          ? asBoolean(body?.usarPrecoDaReceita ?? body?.usar_preco_da_receita, current.usar_preco_da_receita)
          : current.usar_preco_da_receita,
        is_available: ('isAvailable' in body || 'is_available' in body || 'disponivel' in body)
          ? asBoolean(body?.isAvailable ?? body?.is_available ?? body?.disponivel, current.is_available)
          : current.is_available,
        updated_at: new Date().toISOString(),
      };

      list[index] = updated;
      writeFileCardapio(list);
      return NextResponse.json({ success: true, data: normalizeRow(updated, 'cardapio') });
    }

    const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (source === 'cozinha_cardapio') {
      if ('receitaId' in body || 'receita_id' in body || 'recipe_id' in body || 'prato_id' in body) {
        updatePayload.recipe_id = String(body?.receitaId ?? body?.receita_id ?? body?.recipe_id ?? body?.prato_id ?? '');
      }
      if ('diaSemana' in body || 'dia_semana' in body || 'day_of_week' in body) {
        updatePayload.day_of_week = Number(body?.diaSemana ?? body?.dia_semana ?? body?.day_of_week ?? 0);
      }
      if ('periodo' in body || 'period' in body) {
        updatePayload.period = String(body?.periodo ?? body?.period ?? 'almoco');
      }
      if ('precoCustomizado' in body || 'preco_customizado' in body || 'custom_price' in body) {
        updatePayload.custom_price = asNullableNumber(body?.precoCustomizado ?? body?.preco_customizado ?? body?.custom_price);
      }
      if ('isAvailable' in body || 'is_available' in body || 'disponivel' in body) {
        updatePayload.is_available = asBoolean(body?.isAvailable ?? body?.is_available ?? body?.disponivel, true);
      }
    } else {
      if ('receitaId' in body || 'receita_id' in body || 'recipe_id' in body || 'prato_id' in body) {
        updatePayload.receita_id = String(body?.receitaId ?? body?.receita_id ?? body?.recipe_id ?? body?.prato_id ?? '');
      }
      if ('diaSemana' in body || 'dia_semana' in body) {
        updatePayload.dia_semana = Number(body?.diaSemana ?? body?.dia_semana ?? 0);
      }
      if ('periodo' in body) {
        updatePayload.periodo = String(body?.periodo ?? 'almoco');
      }
      if ('precoCustomizado' in body || 'preco_customizado' in body) {
        updatePayload.preco_customizado = asNullableNumber(body?.precoCustomizado ?? body?.preco_customizado);
      }
      if ('usarPrecoDaReceita' in body || 'usar_preco_da_receita' in body) {
        updatePayload.usar_preco_da_receita = asBoolean(body?.usarPrecoDaReceita ?? body?.usar_preco_da_receita, true);
      }
      if ('isAvailable' in body || 'is_available' in body || 'disponivel' in body) {
        updatePayload.is_available = asBoolean(body?.isAvailable ?? body?.is_available ?? body?.disponivel, true);
      }
    }

    const { data, error } = await supabase
      .from(source)
      .update(updatePayload)
      .eq('id', targetId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data: normalizeRow(data, source) });
  } catch (error) {
    console.error('Erro ao atualizar item de cardapio:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar item de cardapio' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createClient();
    const source = await resolveCardapioSchema(supabase);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID nao informado' },
        { status: 400 }
      );
    }

    if (source === 'file_fallback') {
      const list = readFileCardapio();
      const next = list.filter((item) => String(item.id) !== String(id));
      writeFileCardapio(next);
      return NextResponse.json({ success: true });
    }

    const { error } = await supabase
      .from(source)
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover item de cardapio:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao remover item de cardapio' },
      { status: 500 }
    );
  }
}



