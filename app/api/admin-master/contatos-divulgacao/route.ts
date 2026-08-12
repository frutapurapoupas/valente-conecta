// Caminho: C:\valente_conecta\app\api\admin-master\contatos-divulgacao\route.ts
//
// Lista de contatos (fora da plataforma) pra divulgacao/convite. Entrada
// manual (nome+telefone) ou por planilha (.xlsx/.csv), processada aqui no
// servidor com xlsx (build oficial do SheetJS, sem as vulnerabilidades da
// versao publicada no npm). Nao envia nada sozinho — cada contato vira um
// link wa.me pronto pro admin abrir e enviar um a um (ver pagina da tela).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

const TAMANHO_MAX_ARQUIVO = 4 * 1024 * 1024; // limite de corpo de requisicao da Vercel (~4.5MB)
const MAX_LINHAS_PLANILHA = 5000;

function normalizarTelefone(valor: unknown): string {
  return String(valor ?? '').replace(/\D/g, '');
}

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('contatos_divulgacao')
    .select('*')
    .order('criado_em', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || [] });
}

// Entrada manual: { nome?, telefone }
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      const arquivo = form.get('arquivo') as File | null;
      if (!arquivo) return NextResponse.json({ success: false, error: 'Arquivo é obrigatório' }, { status: 400 });
      if (arquivo.size > TAMANHO_MAX_ARQUIVO) {
        return NextResponse.json({ success: false, error: 'Arquivo muito grande (máx. 4MB)' }, { status: 400 });
      }

      const buffer = Buffer.from(await arquivo.arrayBuffer());
      let linhas: any[][];
      try {
        const planilha = XLSX.read(buffer, { type: 'buffer', cellFormula: false, cellHTML: false });
        const primeiraAba = planilha.SheetNames[0];
        linhas = XLSX.utils.sheet_to_json(planilha.Sheets[primeiraAba], { header: 1, blankrows: false }) as any[][];
      } catch {
        return NextResponse.json({ success: false, error: 'Não foi possível ler a planilha. Verifique o formato.' }, { status: 400 });
      }

      if (linhas.length > MAX_LINHAS_PLANILHA) {
        return NextResponse.json({ success: false, error: `Planilha tem mais de ${MAX_LINHAS_PLANILHA} linhas.` }, { status: 400 });
      }

      // Aceita planilha com ou sem cabecalho. Coluna A = nome, coluna B = telefone
      // (se so tiver uma coluna, assume que e' telefone).
      const contatos: { nome: string | null; telefone: string }[] = [];
      for (const linha of linhas) {
        if (!linha || linha.length === 0) continue;
        const [colA, colB] = linha;
        const temDuasColunas = colB !== undefined && colB !== null && String(colB).trim() !== '';
        const nomeBruto = temDuasColunas ? colA : null;
        const telefoneBruto = temDuasColunas ? colB : colA;
        const telefone = normalizarTelefone(telefoneBruto);
        if (telefone.length < 10 || telefone.length > 13) continue; // descarta linha de cabecalho/lixo
        contatos.push({ nome: nomeBruto ? String(nomeBruto).trim().slice(0, 120) : null, telefone });
      }

      if (contatos.length === 0) {
        return NextResponse.json({ success: false, error: 'Nenhum telefone válido encontrado na planilha' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('contatos_divulgacao')
        .insert(contatos.map((c) => ({ nome: c.nome, telefone: c.telefone, origem: 'planilha' })))
        .select('*');
      if (error) throw error;

      return NextResponse.json({ success: true, data, importados: contatos.length });
    }

    const body = await request.json();
    const telefone = normalizarTelefone(body.telefone);
    if (telefone.length < 10) {
      return NextResponse.json({ success: false, error: 'Telefone inválido' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('contatos_divulgacao')
      .insert({ nome: body.nome?.trim() || null, telefone, origem: 'manual' })
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao salvar contato' }, { status: 500 });
  }
}

// Marca contato como enviado (depois que o admin clicou no link do wa.me)
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });

    const supabase = createClient();
    const { data, error } = await supabase
      .from('contatos_divulgacao')
      .update({ status: 'enviado', enviado_em: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao atualizar' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });

    const supabase = createClient();
    const { error } = await supabase.from('contatos_divulgacao').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Erro ao excluir' }, { status: 500 });
  }
}
