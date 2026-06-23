// app/api/cozinha/financeiro/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Listar todas as transações
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('financeiro')
      .select('*')
      .order('data', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('❌ Erro GET /financeiro:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Criar uma nova transação
export async function POST(request: NextRequest) {
  try {
    // 1. LER O BODY COMO TEXTO PRIMEIRO
    const rawBody = await request.text();
    console.log('📥 Raw body recebido:', rawBody);

    // 2. SE O BODY ESTIVER VAZIO, RETORNAR ERRO
    if (!rawBody || rawBody.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Corpo da requisição vazio' },
        { status: 400 }
      );
    }

    // 3. TENTAR FAZER O PARSE DO JSON
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON:', parseError);
      return NextResponse.json(
        { success: false, error: 'JSON inválido' },
        { status: 400 }
      );
    }

    console.log('📥 Body parseado:', body);

    // 4. VALIDAÇÃO BÁSICA
    if (!body.descricao || !body.valor || !body.tipo) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campos obrigatórios: descricao, valor, tipo',
          recebido: body 
        },
        { status: 400 }
      );
    }

    // 5. PREPARAR DADOS - Garantir que os campos correspondam à tabela
    const dados = {
      descricao: body.descricao.trim(),
      valor: parseFloat(body.valor) || 0,
      tipo: body.tipo,
      categoria: body.categoria || null,
      data: body.data || new Date().toISOString().split('T')[0],
      forma_pagamento: body.forma_pagamento || 'PIX',
      status: body.status || 'pago',
      recorrencia: body.recorrencia || 'nenhuma',
      recorrencia_quantidade: body.recorrencia_quantidade || 0,
      observacoes: body.observacoes || null,
    };

    console.log('📤 Inserindo no Supabase:', dados);

    // 6. INSERIR NO SUPABASE
    const { data, error } = await supabase
      .from('financeiro')
      .insert(dados)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro Supabase:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Transação criada:', data);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('❌ Erro ao criar transação:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}