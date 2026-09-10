// Caminho: C:\valente_conecta\app\api\admin-master\unidades-saude\route.ts
//
// Cadastro de unidade de saude pelo admin master (ver proposta "Modo
// Valente Facil", item 5). O admin master nomeia o primeiro "diretor"
// (nivel 'administrar' em unidade_saude_equipe) -- ainda nao existe
// auto-cadastro de unidade. O diretor precisa JA' ter uma conta no app
// (mesmo padrao usado em fiado_clientes: resolve por whatsapp, nao cria
// usuario aqui -- criar conta e' so' via cadastroSimples).

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('unidades_saude')
    .select('*, unidade_saude_equipe(id, nivel, usuarios(nome, whatsapp)), unidade_saude_servicos(*)')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: data || [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const nome = String(body.nome || '').trim();
    const tipo = String(body.tipo || '').trim();
    const regime = String(body.regime || 'sus').trim();
    const diretorWhatsapp = String(body.diretorWhatsapp || '').replace(/\D/g, '');
    const criadoPor = String(body.criadoPor || '').trim();

    if (!nome || !tipo || !diretorWhatsapp || !criadoPor) {
      return NextResponse.json({ success: false, error: 'nome, tipo, diretorWhatsapp e criadoPor são obrigatórios' }, { status: 400 });
    }
    if (!['hospital', 'clinica', 'laboratorio'].includes(tipo)) {
      return NextResponse.json({ success: false, error: 'tipo inválido' }, { status: 400 });
    }
    if (!['sus', 'particular', 'hibrido'].includes(regime)) {
      return NextResponse.json({ success: false, error: 'regime inválido' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: diretor } = await supabase.from('usuarios').select('id, nome').eq('whatsapp', diretorWhatsapp).maybeSingle();
    if (!diretor) {
      return NextResponse.json({ success: false, error: 'Esse WhatsApp ainda não tem conta no Valente Conecta. Peça pro diretor abrir o app pelo menos uma vez antes de cadastrar a unidade.' }, { status: 404 });
    }

    const { data: unidade, error: erroUnidade } = await supabase
      .from('unidades_saude')
      .insert({ nome, tipo, regime, endereco: body.endereco || null, cidade: body.cidade || 'Valente', criado_por: criadoPor })
      .select('*')
      .single();
    if (erroUnidade) throw erroUnidade;

    const { error: erroEquipe } = await supabase
      .from('unidade_saude_equipe')
      .insert({ unidade_id: unidade.id, usuario_id: diretor.id, nivel: 'administrar', convidado_por: criadoPor });
    if (erroEquipe) throw erroEquipe;

    const servicos = Array.isArray(body.servicos) ? body.servicos : [];
    if (servicos.length > 0) {
      const linhas = servicos
        .filter((s: any) => s?.nome?.trim())
        .map((s: any) => ({ unidade_id: unidade.id, nome: String(s.nome).trim(), tipo: s.tipo === 'exame' ? 'exame' : 'consulta', preco: Number(s.preco || 0) }));
      if (linhas.length > 0) await supabase.from('unidade_saude_servicos').insert(linhas);
    }

    return NextResponse.json({ success: true, data: unidade, diretorNome: diretor.nome });
  } catch (error: any) {
    console.error('Erro ao cadastrar unidade de saúde:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Erro interno' }, { status: 500 });
  }
}
