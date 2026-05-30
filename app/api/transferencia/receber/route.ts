// ============================================================================
// ARQUIVO: app/api/transferencia/receber/route.ts
// Funcionalidade: API para receber transferências de Moeda Conecta
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { walletService } from '@/services/walletService';

export async function POST(request: NextRequest) {
  try {
    const { destinatario_id, valor, descricao, origem_id, origem_nome } = await request.json();

    if (!destinatario_id || !valor || valor <= 0) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Registrar transação de recebimento no banco
    const { error } = await supabase
      .from('transacoes')
      .insert({
        id: Date.now().toString(),
        usuario_id: destinatario_id,
        tipo: 'recebimento',
        valor: valor,
        status: 'concluido',
        descricao: descricao || `Transferência recebida de ${origem_nome || 'Usuário'}`,
        data: new Date().toISOString(),
        metodo: 'moeda_conecta',
        origem_id: origem_id,
        origem_nome: origem_nome
      });

    if (error) {
      console.error('Erro ao registrar recebimento:', error);
      return NextResponse.json({ error: 'Erro ao processar transferência' }, { status: 500 });
    }

    // Atualizar saldo do destinatário
    const { data: wallet } = await supabase
      .from('wallet')
      .select('total, disponivel')
      .eq('usuario_id', destinatario_id)
      .single();

    if (wallet) {
      await supabase
        .from('wallet')
        .update({
          total: wallet.total + valor,
          disponivel: wallet.disponivel + valor,
          ultima_atualizacao: new Date().toISOString()
        })
        .eq('usuario_id', destinatario_id);
    }

    return NextResponse.json({ success: true, message: 'Transferência recebida com sucesso' });
  } catch (error) {
    console.error('Erro na API de transferência:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}