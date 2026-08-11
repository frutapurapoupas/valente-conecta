// Caminho: C:\valente_conecta\app\api\academia\route.ts
// Substitui o stub anterior (que sempre retornava array vazio).
// Cobre lado aluno, lado empresarial e admin master, sobre a fundação
// de dados criada em 009_academia_fundacao.sql.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enviarPushParaAluno } from '@/lib/push';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const recurso = searchParams.get('recurso') || 'alunos';

    // ============================================================
    // LADO ALUNO
    // ============================================================

    if (recurso === 'alunos') {
      let query = supabase.from('academia_alunos').select('*').order('nome');
      const gymUnitId = searchParams.get('gym_unit_id');
      const alunoId = searchParams.get('aluno_id');
      const userId = searchParams.get('user_id');
      if (gymUnitId) query = query.eq('gym_unit_id', gymUnitId);
      if (alunoId) query = query.eq('id', alunoId);
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (error) throw error;
      return NextResponse.json({ success: true, data: data || [] });
    }

    if (recurso === 'checkins') {
      let query = supabase.from('academia_checkins').select('*').order('checkin_time', { ascending: false });
      const alunoId = searchParams.get('aluno_id');
      if (alunoId) query = query.eq('aluno_id', alunoId);
      const { data, error } = await query;
      if (error) throw error;
      return NextResponse.json({ success: true, data: data || [] });
    }

    if (recurso === 'sessoes') {
      let query = supabase.from('academia_sessoes').select('*').order('created_at', { ascending: false });
      const userId = searchParams.get('user_id');
      const limit = searchParams.get('limit');
      if (userId) query = query.eq('user_id', userId);
      if (limit) query = query.limit(Number(limit));
      const { data, error } = await query;
      if (error) throw error;
      return NextResponse.json({ success: true, data: data || [] });
    }

    if (recurso === 'perfil') {
      const alunoId = searchParams.get('aluno_id');
      if (!alunoId) return NextResponse.json({ success: false, error: 'aluno_id obrigatorio' }, { status: 400 });
      const { data, error } = await supabase.from('academia_perfis').select('*').eq('aluno_id', alunoId).maybeSingle();
      if (error) throw error;
      return NextResponse.json({ success: true, data: data || null });
    }

    if (recurso === 'exercicios_catalogo') {
      const { data, error } = await supabase.from('academia_exercicios_catalogo').select('*').eq('ativo', true).order('nome');
      if (error) throw error;
      return NextResponse.json({ success: true, data: data || [] });
    }

    if (recurso === 'aluno_exercicios') {
      const alunoId = searchParams.get('aluno_id');
      if (!alunoId) return NextResponse.json({ success: false, error: 'aluno_id obrigatorio' }, { status: 400 });
      const { data, error } = await supabase
        .from('academia_aluno_exercicios')
        .select('*, academia_exercicios_catalogo(*)')
        .eq('aluno_id', alunoId);
      if (error) throw error;
      return NextResponse.json({ success: true, data: data || [] });
    }

    if (recurso === 'execucoes') {
      const alunoId = searchParams.get('aluno_id');
      const exercicioId = searchParams.get('exercicio_id');
      let query = supabase.from('academia_execucoes').select('*').order('concluido_em', { ascending: false });
      if (alunoId) query = query.eq('aluno_id', alunoId);
      if (exercicioId) query = query.eq('exercicio_id', exercicioId);
      const { data, error } = await query;
      if (error) throw error;
      return NextResponse.json({ success: true, data: data || [] });
    }

    if (recurso === 'atividades_esportivas') {
      const alunoId = searchParams.get('aluno_id');
      if (!alunoId) return NextResponse.json({ success: false, error: 'aluno_id obrigatorio' }, { status: 400 });
      const { data, error } = await supabase
        .from('academia_atividades_esportivas')
        .select('*')
        .eq('aluno_id', alunoId)
        .order('dia_semana');
      if (error) throw error;
      return NextResponse.json({ success: true, data: data || [] });
    }

    // ============================================================
    // LADO EMPRESARIAL
    // ============================================================

    if (recurso === 'empresas') {
      let query = supabase.from('gym_units').select('*, academia_planos(*)').order('nome');
      const cidade = searchParams.get('cidade');
      const empresaId = searchParams.get('id');
      const donoUserId = searchParams.get('dono_user_id');
      if (cidade) query = query.eq('cidade', cidade);
      if (empresaId) query = query.eq('id', empresaId);
      if (donoUserId) query = query.eq('dono_user_id', donoUserId);
      const { data, error } = await query;
      if (error) throw error;
      return NextResponse.json({ success: true, data: data || [] });
    }

    if (recurso === 'membros') {
      let query = supabase.from('gym_members').select('*').order('nome');
      const gymUnitId = searchParams.get('gym_unit_id');
      if (gymUnitId) query = query.eq('gym_unit_id', gymUnitId);
      const { data, error } = await query;
      if (error) throw error;
      return NextResponse.json({ success: true, data: data || [] });
    }

    if (recurso === 'usuarios_empresa') {
      const gymUnitId = searchParams.get('gym_unit_id');
      if (!gymUnitId) {
        return NextResponse.json({ success: false, error: 'gym_unit_id obrigatorio' }, { status: 400 });
      }
      const { data, error } = await supabase
        .from('gym_unit_usuarios')
        .select('*')
        .eq('gym_unit_id', gymUnitId)
        .order('papel');
      if (error) throw error;
      return NextResponse.json({ success: true, data: data || [] });
    }

    // ============================================================
    // PLANOS E FUNCIONALIDADES (admin master + catálogo público)
    // ============================================================

    if (recurso === 'planos') {
      const { data: planos, error } = await supabase
        .from('academia_planos')
        .select('*')
        .order('ordem_exibicao');
      if (error) throw error;

      const { data: pivot } = await supabase
        .from('academia_plano_funcionalidades')
        .select('plano_id, incluida, gym_funcionalidades(id, label)');

      const planosComFuncionalidades = (planos || []).map((plano) => ({
        ...plano,
        funcionalidades: (pivot || []).filter((p) => p.plano_id === plano.id),
      }));

      return NextResponse.json({ success: true, data: planosComFuncionalidades });
    }

    if (recurso === 'funcionalidades') {
      const { data, error } = await supabase.from('gym_funcionalidades').select('*').order('label');
      if (error) throw error;
      return NextResponse.json({ success: true, data: data || [] });
    }

    // ============================================================
    // COBRANÇA (mensalidade da empresa + serviços avulsos)
    // ============================================================

    if (recurso === 'cobrancas') {
      let query = supabase.from('academia_cobrancas').select('*').order('referencia_mes', { ascending: false });
      const gymUnitId = searchParams.get('gym_unit_id');
      const status = searchParams.get('status');
      if (gymUnitId) query = query.eq('gym_unit_id', gymUnitId);
      if (status) query = query.eq('status', status);
      const { data, error } = await query;
      if (error) throw error;
      return NextResponse.json({ success: true, data: data || [] });
    }

    if (recurso === 'servicos') {
      let query = supabase.from('academia_servicos').select('*').eq('ativo', true).order('nome');
      const cobrancaDe = searchParams.get('cobranca_de');
      if (cobrancaDe) query = query.eq('cobranca_de', cobrancaDe);
      const { data, error } = await query;
      if (error) throw error;
      return NextResponse.json({ success: true, data: data || [] });
    }

    if (recurso === 'consumos') {
      let query = supabase.from('academia_servico_consumos').select('*, academia_servicos(nome, preco)').order('created_at', { ascending: false });
      const alunoId = searchParams.get('aluno_id');
      const gymUnitId = searchParams.get('gym_unit_id');
      if (alunoId) query = query.eq('aluno_id', alunoId);
      if (gymUnitId) query = query.eq('gym_unit_id', gymUnitId);
      const { data, error } = await query;
      if (error) throw error;
      return NextResponse.json({ success: true, data: data || [] });
    }

    // ============================================================
    // DASHBOARD DO ADMIN MASTER
    // ============================================================

    if (recurso === 'metrics') {
      const [{ data: empresas }, { data: alunos }, { data: cobrancas }] = await Promise.all([
        supabase.from('gym_units').select('id, ativa, status_assinatura'),
        supabase.from('academia_alunos').select('id, status'),
        supabase.from('academia_cobrancas').select('status, valor, referencia_mes'),
      ]);

      const listaEmpresas = empresas || [];
      const listaAlunos = alunos || [];
      const listaCobrancas = cobrancas || [];

      const mesAtual = new Date().toISOString().slice(0, 7);
      const cobrancasMesAtual = listaCobrancas.filter((c) => String(c.referencia_mes).slice(0, 7) === mesAtual);
      const receitaMesAtual = cobrancasMesAtual.filter((c) => c.status === 'pago').reduce((soma, c) => soma + Number(c.valor || 0), 0);
      const inadimplentes = listaEmpresas.filter((e) => e.status_assinatura === 'inadimplente').length;

      return NextResponse.json({
        success: true,
        data: {
          totalEmpresas: listaEmpresas.length,
          empresasAtivas: listaEmpresas.filter((e) => e.ativa).length,
          empresasInadimplentes: inadimplentes,
          totalAlunos: listaAlunos.length,
          alunosAtivos: listaAlunos.filter((a) => a.status === 'ativo').length,
          receitaMesAtual: Number(receitaMesAtual.toFixed(2)),
          cobrancasPendentesMesAtual: cobrancasMesAtual.filter((c) => c.status === 'pendente').length,
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Recurso invalido.' }, { status: 400 });
  } catch (error: any) {
    console.error('Erro GET academia:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Erro interno.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const recurso = body?.recurso;

    if (recurso === 'alunos') {
      const obrigatorios = ['nome'];
      for (const campo of obrigatorios) {
        if (!body?.[campo]) return NextResponse.json({ success: false, error: `Campo obrigatorio: ${campo}` }, { status: 400 });
      }
      const { data, error } = await supabase
        .from('academia_alunos')
        .insert([{
          nome: body.nome,
          email: body.email || null,
          telefone: body.telefone || null,
          plano: body.plano || 'gratis',
          status: body.status || 'ativo',
          user_id: body.user_id || null,
          gym_unit_id: body.gym_unit_id || null,
        }])
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (recurso === 'checkins') {
      if (!body?.aluno_id) return NextResponse.json({ success: false, error: 'aluno_id obrigatorio' }, { status: 400 });
      const { data, error } = await supabase
        .from('academia_checkins')
        .insert([{ aluno_id: body.aluno_id, qr_code: body.qr_code || null, checkin_time: new Date().toISOString() }])
        .select()
        .single();
      if (error) throw error;

      // Mantém total_checkins e ultimo_checkin de gym_members em dia, se o
      // aluno estiver vinculado a um membro do lado empresarial.
      if (body.gym_member_id) {
        const { data: membroAtual } = await supabase
          .from('gym_members')
          .select('total_checkins')
          .eq('id', body.gym_member_id)
          .single();
        await supabase
          .from('gym_members')
          .update({
            total_checkins: (membroAtual?.total_checkins || 0) + 1,
            ultimo_checkin: new Date().toISOString().slice(0, 10),
          })
          .eq('id', body.gym_member_id);
      }

      return NextResponse.json({ success: true, data });
    }

    if (recurso === 'push_subscription') {
      if (!body?.aluno_id || !body?.subscription) {
        return NextResponse.json({ success: false, error: 'aluno_id e subscription obrigatorios' }, { status: 400 });
      }
      const { error } = await supabase
        .from('academia_alunos')
        .update({ push_subscription: body.subscription })
        .eq('id', body.aluno_id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (recurso === 'sessoes') {
      const obrigatorios = ['user_id', 'minutos'];
      for (const campo of obrigatorios) {
        if (body?.[campo] === undefined || body?.[campo] === null) {
          return NextResponse.json({ success: false, error: `Campo obrigatorio: ${campo}` }, { status: 400 });
        }
      }
      const { data, error } = await supabase
        .from('academia_sessoes')
        .insert([{
          user_id: body.user_id,
          minutos: body.minutos,
          calorias: body.calorias || Math.round(Number(body.minutos) * 7), // estimativa simples, ajustável
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (recurso === 'perfil') {
      if (!body?.aluno_id) return NextResponse.json({ success: false, error: 'aluno_id obrigatorio' }, { status: 400 });
      const { data, error } = await supabase
        .from('academia_perfis')
        .upsert({
          aluno_id: body.aluno_id,
          altura: body.altura,
          peso_atual: body.peso_atual,
          peso_meta: body.peso_meta,
          idade: body.idade,
          sexo: body.sexo,
          condicao_fisica: body.condicao_fisica || null,
          nivel_vida: body.nivel_vida || null,
          objetivos: body.objetivos || [],
          condicoes_medicas: body.condicoes_medicas || [],
          freq_semanal: body.freq_semanal || 3,
          nivel: body.nivel || 'iniciante',
          tipo_exercicio: body.tipo_exercicio || [],
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (recurso === 'aluno_exercicio') {
      const obrigatorios = ['aluno_id', 'exercicio_id'];
      for (const campo of obrigatorios) {
        if (!body?.[campo]) return NextResponse.json({ success: false, error: `Campo obrigatorio: ${campo}` }, { status: 400 });
      }
      const { data, error } = await supabase
        .from('academia_aluno_exercicios')
        .upsert({
          aluno_id: body.aluno_id,
          exercicio_id: body.exercicio_id,
          carga_atual: body.carga_atual ?? 0,
          carga_meta: body.carga_meta ?? 0,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'aluno_id,exercicio_id' })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (recurso === 'execucao') {
      const obrigatorios = ['aluno_id', 'exercicio_id', 'carga'];
      for (const campo of obrigatorios) {
        if (body?.[campo] === undefined) return NextResponse.json({ success: false, error: `Campo obrigatorio: ${campo}` }, { status: 400 });
      }
      const { data, error } = await supabase
        .from('academia_execucoes')
        .insert([{ aluno_id: body.aluno_id, exercicio_id: body.exercicio_id, carga: body.carga }])
        .select()
        .single();
      if (error) throw error;

      // Também marca como concluído hoje no progresso atual
      await supabase
        .from('academia_aluno_exercicios')
        .update({ concluido_hoje: true, ultima_conclusao: new Date().toISOString() })
        .eq('aluno_id', body.aluno_id)
        .eq('exercicio_id', body.exercicio_id);

      return NextResponse.json({ success: true, data });
    }

    if (recurso === 'atividade_esportiva') {
      const obrigatorios = ['aluno_id', 'tipo', 'local', 'dia_semana', 'horario'];
      for (const campo of obrigatorios) {
        if (!body?.[campo]) return NextResponse.json({ success: false, error: `Campo obrigatorio: ${campo}` }, { status: 400 });
      }
      const { data, error } = await supabase
        .from('academia_atividades_esportivas')
        .insert([{
          aluno_id: body.aluno_id,
          tipo: body.tipo,
          nome: body.nome || body.tipo,
          local: body.local,
          latitude: body.latitude || null,
          longitude: body.longitude || null,
          dia_semana: body.dia_semana,
          horario: body.horario,
          duracao_min: body.duracao_min || 60,
          tempo_permanencia_min: body.tempo_permanencia_min || 60,
          alerta_ativo: body.alerta_ativo ?? true,
        }])
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (recurso === 'empresas') {
      const obrigatorios = ['nome', 'responsavel', 'cidade', 'contato', 'endereco'];
      for (const campo of obrigatorios) {
        if (!body?.[campo]) return NextResponse.json({ success: false, error: `Campo obrigatorio: ${campo}` }, { status: 400 });
      }
      const { data, error } = await supabase
        .from('gym_units')
        .insert([{
          nome: body.nome,
          responsavel: body.responsavel,
          cidade: body.cidade,
          contato: body.contato,
          endereco: body.endereco,
          localizador: body.localizador || '',
          latitude: body.latitude ?? null,
          longitude: body.longitude ?? null,
          alunos: 0,
          ativa: body.ativa ?? false, // fica inativa até admin master aprovar
          plano_id: body.plano_id || null,
          dono_nome: body.dono_nome || body.responsavel,
          dono_email: body.dono_email || null,
          dono_telefone: body.dono_telefone || body.contato,
          status_assinatura: 'trial',
        }])
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (recurso === 'membros') {
      const obrigatorios = ['nome', 'gym_unit_id'];
      for (const campo of obrigatorios) {
        if (!body?.[campo]) return NextResponse.json({ success: false, error: `Campo obrigatorio: ${campo}` }, { status: 400 });
      }
      const { data, error } = await supabase
        .from('gym_members')
        .insert([{
          nome: body.nome,
          foto: body.foto || '',
          plano: body.plano || 'gratuito',
          gym_unit_id: body.gym_unit_id,
          academia: body.academia || '',
          whatsapp: body.whatsapp || '',
          total_checkins: 0,
          ativo: true,
        }])
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (recurso === 'usuarios_empresa') {
      const obrigatorios = ['gym_unit_id', 'nome', 'papel'];
      for (const campo of obrigatorios) {
        if (!body?.[campo]) return NextResponse.json({ success: false, error: `Campo obrigatorio: ${campo}` }, { status: 400 });
      }
      const { data, error } = await supabase
        .from('gym_unit_usuarios')
        .insert([{
          gym_unit_id: body.gym_unit_id,
          nome: body.nome,
          email: body.email || null,
          telefone: body.telefone || null,
          papel: body.papel,
        }])
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (recurso === 'planos') {
      const obrigatorios = ['nome', 'preco_mensal'];
      for (const campo of obrigatorios) {
        if (body?.[campo] === undefined) return NextResponse.json({ success: false, error: `Campo obrigatorio: ${campo}` }, { status: 400 });
      }
      const { data, error } = await supabase
        .from('academia_planos')
        .insert([{
          nome: body.nome,
          descricao: body.descricao || null,
          preco_mensal: body.preco_mensal,
          limite_alunos: body.limite_alunos ?? null,
          limite_usuarios_adicionais: body.limite_usuarios_adicionais ?? 1,
          ordem_exibicao: body.ordem_exibicao ?? 99,
        }])
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (recurso === 'cobrancas') {
      const obrigatorios = ['gym_unit_id', 'referencia_mes', 'valor', 'vencimento'];
      for (const campo of obrigatorios) {
        if (body?.[campo] === undefined) return NextResponse.json({ success: false, error: `Campo obrigatorio: ${campo}` }, { status: 400 });
      }
      const { data, error } = await supabase
        .from('academia_cobrancas')
        .insert([{
          gym_unit_id: body.gym_unit_id,
          referencia_mes: body.referencia_mes,
          valor: body.valor,
          vencimento: body.vencimento,
          status: 'pendente',
        }])
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (recurso === 'servicos') {
      const obrigatorios = ['nome', 'preco'];
      for (const campo of obrigatorios) {
        if (body?.[campo] === undefined) return NextResponse.json({ success: false, error: `Campo obrigatorio: ${campo}` }, { status: 400 });
      }
      const { data, error } = await supabase
        .from('academia_servicos')
        .insert([{
          nome: body.nome,
          descricao: body.descricao || null,
          preco: body.preco,
          cobranca_de: body.cobranca_de || 'aluno',
        }])
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (recurso === 'consumos') {
      if (!body?.servico_id || body?.valor_cobrado === undefined) {
        return NextResponse.json({ success: false, error: 'servico_id e valor_cobrado obrigatorios' }, { status: 400 });
      }
      const { data, error } = await supabase
        .from('academia_servico_consumos')
        .insert([{
          servico_id: body.servico_id,
          aluno_id: body.aluno_id || null,
          gym_unit_id: body.gym_unit_id || null,
          valor_cobrado: body.valor_cobrado,
          status_pagamento: 'pendente',
        }])
        .select()
        .single();
      if (error) throw error;

      if (data?.aluno_id) {
        const { data: servico } = await supabase
          .from('academia_servicos')
          .select('nome')
          .eq('id', body.servico_id)
          .maybeSingle();
        await enviarPushParaAluno(data.aluno_id, {
          title: 'Nova cobrança na sua academia',
          body: `${servico?.nome || 'Serviço'} — R$ ${Number(body.valor_cobrado).toFixed(2)} pendente.`,
          url: '/academia/empresa/servicos',
        });
      }

      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: false, error: 'Recurso invalido.' }, { status: 400 });
  } catch (error: any) {
    console.error('Erro POST academia:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Erro ao salvar.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const recurso = body?.recurso;

    if (recurso === 'aluno_status') {
      const { data, error } = await supabase
        .from('academia_alunos')
        .update({ status: body.status })
        .eq('id', body.alunoId)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    // Edição genérica do aluno: nome, telefone, email, campos da
    // "academia manual" (quando o aluno frequenta um local ainda não
    // cadastrado no sistema), e vínculo com uma academia real (gym_unit_id).
    if (recurso === 'aluno') {
      const { id, patch } = body;
      if (!id) return NextResponse.json({ success: false, error: 'id obrigatorio' }, { status: 400 });
      const { data, error } = await supabase
        .from('academia_alunos')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (recurso === 'empresa') {
      const { id, patch } = body;
      if (!id) return NextResponse.json({ success: false, error: 'id obrigatorio' }, { status: 400 });
      const { data, error } = await supabase
        .from('gym_units')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    // Admin master ativa/muda o plano de uma empresa — é aqui que entra
    // "incluir em planos de pagamento mensal" pedido no escopo.
    if (recurso === 'empresa_plano') {
      const { gymUnitId, planoId, statusAssinatura } = body;
      if (!gymUnitId || !planoId) return NextResponse.json({ success: false, error: 'gymUnitId e planoId obrigatorios' }, { status: 400 });
      const { data, error } = await supabase
        .from('gym_units')
        .update({ plano_id: planoId, status_assinatura: statusAssinatura || 'ativo' })
        .eq('id', gymUnitId)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (recurso === 'cobranca_status') {
      const { cobrancaId, status } = body;
      const patch: any = { status };
      if (status === 'pago') patch.pago_em = new Date().toISOString();
      const { data, error } = await supabase
        .from('academia_cobrancas')
        .update(patch)
        .eq('id', cobrancaId)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (recurso === 'plano') {
      const { id, patch } = body;
      const { data, error } = await supabase
        .from('academia_planos')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (recurso === 'funcionalidade_plano') {
      // Liga/desliga uma funcionalidade para um plano (checkbox do admin master)
      const { planoId, funcionalidadeId, incluida } = body;
      const { data, error } = await supabase
        .from('academia_plano_funcionalidades')
        .upsert({ plano_id: planoId, funcionalidade_id: funcionalidadeId, incluida })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (recurso === 'consumo_status') {
      const { consumoId, statusPagamento } = body;
      const { data, error } = await supabase
        .from('academia_servico_consumos')
        .update({ status_pagamento: statusPagamento })
        .eq('id', consumoId)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    if (recurso === 'atividade_esportiva_alerta') {
      const { atividadeId, alertaAtivo } = body;
      if (!atividadeId) return NextResponse.json({ success: false, error: 'atividadeId obrigatorio' }, { status: 400 });
      const { data, error } = await supabase
        .from('academia_atividades_esportivas')
        .update({ alerta_ativo: alertaAtivo })
        .eq('id', atividadeId)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: false, error: 'Recurso invalido.' }, { status: 400 });
  } catch (error: any) {
    console.error('Erro PUT academia:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Erro ao atualizar.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const recurso = searchParams.get('recurso');
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'id obrigatorio' }, { status: 400 });

    if (recurso === 'atividade_esportiva') {
      const { error } = await supabase.from('academia_atividades_esportivas').delete().eq('id', id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Recurso invalido.' }, { status: 400 });
  } catch (error: any) {
    console.error('Erro DELETE academia:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Erro ao remover.' }, { status: 500 });
  }
}