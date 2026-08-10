// app/api/transacoes/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Listar transações do usuário
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
  }
  
  const { data, error } = await supabase
    .from('transacoes')
    .select('*')
    .eq('usuario_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ transacoes: data });
}

// POST - Registrar débito/crédito
export async function POST(request: Request) {
  const body = await request.json();
  const { usuario_id, tipo, valor, descricao, servico } = body;
  
  if (!usuario_id || !tipo || !valor || !descricao) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
  }
  
  // Buscar saldo atual
  const { data: user, error: userError } = await supabase
    .from('usuarios')
    .select('wallet')
    .eq('id', usuario_id)
    .single();
  
  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }
  
  const saldoAntes = user?.wallet || 0;
  let saldoDepois = saldoAntes;
  
  if (tipo === 'credito') {
    saldoDepois = saldoAntes + valor;
  } else if (tipo === 'debito') {
    if (saldoAntes < valor) {
      return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 });
    }
    saldoDepois = saldoAntes - valor;
  }
  
  // Registrar transação
  const { data: transacao, error: transError } = await supabase
    .from('transacoes')
    .insert({
      usuario_id,
      tipo,
      valor,
      descricao,
      servico,
      saldo_antes: saldoAntes,
      saldo_depois: saldoDepois,
      status: 'concluido'
    })
    .select()
    .single();
  
  if (transError) {
    return NextResponse.json({ error: transError.message }, { status: 500 });
  }
  
  // Atualizar saldo do usuário
  await supabase
    .from('usuarios')
    .update({ wallet: saldoDepois })
    .eq('id', usuario_id);
  
  return NextResponse.json({ transacao, novoSaldo: saldoDepois });
}

