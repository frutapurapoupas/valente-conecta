// Caminho: C:\valente_conecta\app\api\profissionais\route.ts
//
// Diretorio publico de profissionais autonomos, agora no Supabase (ver
// 084_profissionais_diretorio.sql). Antes gravava em data/profissionais.json,
// que nao persiste em runtime serverless (Vercel) -- cadastro/edicao/exclusao
// falhavam sempre com 500 em producao.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

function paraApi(row: any) {
  return {
    id: row.id,
    nome: row.nome,
    foto: row.foto || '',
    categoria: row.categoria,
    especialidades: row.especialidades || [],
    descricao: row.descricao || '',
    experiencia: row.experiencia,
    bairro: row.bairro || '',
    cidade: row.cidade,
    telefone: row.telefone,
    whatsapp: row.whatsapp || row.telefone,
    precoHora: Number(row.preco_hora),
    precoServico: Number(row.preco_servico),
    disponibilidade: row.disponibilidade || '',
    plano: row.plano,
    status: row.status,
    avaliacao: Number(row.avaliacao),
    totalAvaliacoes: row.total_avaliacoes,
    destaque: row.destaque,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get('categoria');
    const status = searchParams.get('status');
    const busca = (searchParams.get('busca') || '').trim();

    const supabase = createClient();
    let query = supabase.from('profissionais_diretorio').select('*').order('created_at', { ascending: false });

    if (categoria) query = query.eq('categoria', categoria);
    if (status) query = query.eq('status', status);
    if (busca) {
      query = query.or(
        `nome.ilike.%${busca}%,descricao.ilike.%${busca}%,categoria.ilike.%${busca}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data: (data || []).map(paraApi) });
  } catch (error) {
    console.error('Erro ao carregar profissionais:', error);
    return NextResponse.json({ success: false, error: 'Erro ao carregar profissionais' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.nome?.trim() || !body.categoria?.trim() || !body.telefone?.trim()) {
      return NextResponse.json({ success: false, error: 'Nome, categoria e telefone são obrigatórios.' }, { status: 400 });
    }

    const especialidades = Array.isArray(body.especialidades)
      ? body.especialidades
      : String(body.especialidades || '').split(',').map((s: string) => s.trim()).filter(Boolean);

    const supabase = createClient();
    const { data, error } = await supabase
      .from('profissionais_diretorio')
      .insert({
        nome: String(body.nome).trim(),
        foto: String(body.foto || '').trim(),
        categoria: String(body.categoria).trim(),
        especialidades,
        descricao: String(body.descricao || '').trim(),
        experiencia: Number(body.experiencia || 0),
        bairro: String(body.bairro || '').trim(),
        cidade: String(body.cidade || 'Valente').trim(),
        telefone: String(body.telefone).trim(),
        whatsapp: String(body.whatsapp || body.telefone || '').trim(),
        preco_hora: Number(body.precoHora || 0),
        preco_servico: Number(body.precoServico || 0),
        disponibilidade: String(body.disponibilidade || '').trim(),
        plano: String(body.plano || 'basico'),
        status: 'pendente'
      })
      .select('*')
      .single();
    if (error) throw error;

    return NextResponse.json({ success: true, data: paraApi(data) });
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
    const patch: Record<string, any> = {};
    if (body.nome !== undefined) patch.nome = String(body.nome).trim();
    if (body.foto !== undefined) patch.foto = String(body.foto || '').trim();
    if (body.categoria !== undefined) patch.categoria = String(body.categoria).trim();
    if (body.especialidades !== undefined) {
      patch.especialidades = Array.isArray(body.especialidades)
        ? body.especialidades
        : String(body.especialidades || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    if (body.descricao !== undefined) patch.descricao = String(body.descricao || '').trim();
    if (body.experiencia !== undefined) patch.experiencia = Number(body.experiencia || 0);
    if (body.bairro !== undefined) patch.bairro = String(body.bairro || '').trim();
    if (body.cidade !== undefined) patch.cidade = String(body.cidade || 'Valente').trim();
    if (body.telefone !== undefined) patch.telefone = String(body.telefone).trim();
    if (body.whatsapp !== undefined) patch.whatsapp = String(body.whatsapp || '').trim();
    if (body.precoHora !== undefined) patch.preco_hora = Number(body.precoHora || 0);
    if (body.precoServico !== undefined) patch.preco_servico = Number(body.precoServico || 0);
    if (body.disponibilidade !== undefined) patch.disponibilidade = String(body.disponibilidade || '').trim();
    if (body.plano !== undefined) patch.plano = String(body.plano);
    if (body.status !== undefined) patch.status = String(body.status);
    if (body.avaliacao !== undefined) patch.avaliacao = Number(body.avaliacao);
    if (body.totalAvaliacoes !== undefined) patch.total_avaliacoes = Number(body.totalAvaliacoes);
    if (body.destaque !== undefined) patch.destaque = Boolean(body.destaque);
    patch.updated_at = new Date().toISOString();

    const supabase = createClient();
    const { data, error } = await supabase
      .from('profissionais_diretorio')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    if (!data) return NextResponse.json({ success: false, error: 'Profissional não encontrado' }, { status: 404 });

    return NextResponse.json({ success: true, data: paraApi(data) });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: 'ID não informado' }, { status: 400 });

    const supabase = createClient();
    const { error, count } = await supabase
      .from('profissionais_diretorio')
      .delete({ count: 'exact' })
      .eq('id', id);
    if (error) throw error;
    if (!count) return NextResponse.json({ success: false, error: 'Profissional não encontrado' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
