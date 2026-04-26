// hooks/useAgendamento.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client-switch';
import { isMockMode } from '@/lib/supabase-client-switch';
import { MOCK_DATA } from '@/lib/mock/mock-data';

export interface Agendamento {
  id: string;
  clienteId: string;
  clienteNome: string;
  clienteTelefone: string;
  clienteEmail?: string;
  profissionalId: string;
  profissionalNome: string;
  servicoId: string;
  servicoNome: string;
  servicoPreco: number;
  data: string;
  horario: string;
  status: 'pendente' | 'confirmado' | 'cancelado' | 'realizado';
  observacao?: string;
  createdAt: string;
}

export interface ClienteFila {
  id: string;
  nome: string;
  telefone: string;
  servicoDesejado: string;
  dataSolicitacao: Date;
  prioridade: 'alta' | 'media' | 'baixa';
  status: 'aguardando' | 'confirmado' | 'cancelado' | 'atendido';
  horarioPreferencial?: string;
  observacao?: string;
}

export interface NotificacaoAgendamento {
  id: string;
  agendamentoId: string;
  tipo: 'whatsapp' | 'sms' | 'email' | 'push';
  enviado: boolean;
  dataEnvio?: string;
  mensagem: string;
  erro?: string;
}

export const useAgendamento = (profissionalId?: string, empresaId?: string) => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [filaEspera, setFilaEspera] = useState<ClienteFila[]>([]);
  const [notificacoes, setNotificacoes] = useState<NotificacaoAgendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);

  // Buscar agendamentos
  const fetchAgendamentos = useCallback(async () => {
    setLoading(true);
    if (isMockMode()) {
      console.log('📅 Usando dados MOCK para Agendamentos');
      setAgendamentos([]);
      setFilaEspera([]);
    } else {
      try {
        let query = supabase.from('agendamentos').select('*');
        if (profissionalId) query = query.eq('profissional_id', profissionalId);
        if (empresaId) query = query.eq('empresa_id', empresaId);
        const { data, error } = await query.order('data', { ascending: true });
        if (error) throw error;
        setAgendamentos(data || []);
      } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
      }
    }
    setLoading(false);
  }, [profissionalId, empresaId]);

  useEffect(() => {
    fetchAgendamentos();
  }, [fetchAgendamentos]);

  // Criar agendamento
  const criarAgendamento = async (agendamento: Omit<Agendamento, 'id' | 'createdAt'>) => {
    const novoAgendamento = {
      ...agendamento,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    if (isMockMode()) {
      setAgendamentos(prev => [...prev, novoAgendamento]);
      return novoAgendamento;
    }

    const { data, error } = await supabase
      .from('agendamentos')
      .insert(agendamento)
      .select()
      .single();
    if (error) throw error;
    setAgendamentos(prev => [...prev, data]);
    return data;
  };

  // Atualizar agendamento
  const atualizarAgendamento = async (id: string, updates: Partial<Agendamento>) => {
    if (isMockMode()) {
      setAgendamentos(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
      return;
    }

    const { error } = await supabase
      .from('agendamentos')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    setAgendamentos(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  // Cancelar agendamento
  const cancelarAgendamento = async (id: string, motivo?: string) => {
    await atualizarAgendamento(id, { status: 'cancelado' });
    
    // Adicionar à fila de espera se necessário
    const agendamento = agendamentos.find(a => a.id === id);
    if (agendamento) {
      await adicionarFilaEspera({
        nome: agendamento.clienteNome,
        telefone: agendamento.clienteTelefone,
        servicoDesejado: agendamento.servicoNome,
        prioridade: 'media',
        observacao: motivo || `Cancelamento do agendamento ${id}`,
      });
    }
  };

  // Adicionar à fila de espera
  const adicionarFilaEspera = async (cliente: Omit<ClienteFila, 'id' | 'dataSolicitacao' | 'status'>) => {
    const novoCliente: ClienteFila = {
      ...cliente,
      id: Date.now().toString(),
      dataSolicitacao: new Date(),
      status: 'aguardando',
    };

    if (isMockMode()) {
      setFilaEspera(prev => [...prev, novoCliente]);
      return novoCliente;
    }

    const { data, error } = await supabase
      .from('fila_espera')
      .insert(novoCliente)
      .select()
      .single();
    if (error) throw error;
    setFilaEspera(prev => [...prev, data]);
    return data;
  };

  // Remover da fila de espera
  const removerFilaEspera = async (id: string) => {
    if (isMockMode()) {
      setFilaEspera(prev => prev.filter(c => c.id !== id));
      return;
    }

    const { error } = await supabase
      .from('fila_espera')
      .delete()
      .eq('id', id);
    if (error) throw error;
    setFilaEspera(prev => prev.filter(c => c.id !== id));
  };

  // Atualizar status na fila de espera
  const atualizarStatusFila = async (id: string, status: ClienteFila['status']) => {
    if (isMockMode()) {
      setFilaEspera(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      return;
    }

    const { error } = await supabase
      .from('fila_espera')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
    setFilaEspera(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  // Enviar notificação de agendamento
  const enviarNotificacaoAgendamento = async (agendamentoId: string, tipo: string, mensagem: string) => {
    const notificacao: NotificacaoAgendamento = {
      id: Date.now().toString(),
      agendamentoId,
      tipo: tipo as any,
      enviado: true,
      dataEnvio: new Date().toISOString(),
      mensagem,
    };

    // Simular envio real
    console.log(`📨 Enviando ${tipo} para agendamento ${agendamentoId}:`, mensagem);

    if (isMockMode()) {
      setNotificacoes(prev => [...prev, notificacao]);
      return notificacao;
    }

    const { data, error } = await supabase
      .from('notificacoes_agendamento')
      .insert(notificacao)
      .select()
      .single();
    if (error) throw error;
    setNotificacoes(prev => [...prev, data]);
    return data;
  };

  // Buscar horários disponíveis para um profissional
  const buscarHorariosDisponiveis = async (profissionalId: string, data: string, duracaoServico: number = 30) => {
    // Horário comercial: 08:00 às 18:00
    const horariosBase = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
    ];

    if (isMockMode()) {
      // Simular horários já ocupados
      const ocupados = agendamentos
        .filter(a => a.profissionalId === profissionalId && a.data === data && a.status !== 'cancelado')
        .map(a => a.horario);
      
      const disponiveis = horariosBase.filter(h => !ocupados.includes(h));
      setHorariosDisponiveis(disponiveis);
      return disponiveis;
    }

    try {
      const { data: ocupados, error } = await supabase
        .from('agendamentos')
        .select('horario')
        .eq('profissional_id', profissionalId)
        .eq('data', data)
        .in('status', ['pendente', 'confirmado']);
      
      if (error) throw error;
      
      const horariosOcupados = ocupados?.map((o: any) => o.horario) || [];
      const disponiveis = horariosBase.filter(h => !horariosOcupados.includes(h));
      setHorariosDisponiveis(disponiveis);
      return disponiveis;
    } catch (error) {
      console.error('Erro ao buscar horários disponíveis:', error);
      return [];
    }
  };

  // Estatísticas
  const getEstatisticas = useCallback(() => {
    const hoje = new Date().toISOString().split('T')[0];
    
    const agendamentosHoje = agendamentos.filter(a => a.data === hoje);
    const confirmadosHoje = agendamentosHoje.filter(a => a.status === 'confirmado').length;
    const pendentesHoje = agendamentosHoje.filter(a => a.status === 'pendente').length;
    const canceladosHoje = agendamentosHoje.filter(a => a.status === 'cancelado').length;
    
    const totalMes = agendamentos.filter(a => {
      const dataAgenda = new Date(a.data);
      const agora = new Date();
      return dataAgenda.getMonth() === agora.getMonth() && dataAgenda.getFullYear() === agora.getFullYear();
    }).length;
    
    const taxaConfirmacao = agendamentosHoje.length > 0 
      ? (confirmadosHoje / agendamentosHoje.length) * 100 
      : 0;

    return {
      total: agendamentos.length,
      hoje: agendamentosHoje.length,
      confirmadosHoje,
      pendentesHoje,
      canceladosHoje,
      totalMes,
      taxaConfirmacao: Math.round(taxaConfirmacao),
      filaEspera: filaEspera.filter(c => c.status === 'aguardando').length,
    };
  }, [agendamentos, filaEspera]);

  return {
    agendamentos,
    filaEspera,
    notificacoes,
    loading,
    horariosDisponiveis,
    criarAgendamento,
    atualizarAgendamento,
    cancelarAgendamento,
    adicionarFilaEspera,
    removerFilaEspera,
    atualizarStatusFila,
    enviarNotificacaoAgendamento,
    buscarHorariosDisponiveis,
    getEstatisticas,
    refresh: fetchAgendamentos,
  };
};