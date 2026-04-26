// components/agendamento/FilaEspera.tsx
'use client';

import { useState, useEffect } from 'react';
import { Clock, User, Calendar, Bell, CheckCircle, XCircle, Users, Plus, Trash2 } from 'lucide-react';

interface ClienteFila {
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

interface FilaEsperaProps {
  profissionalId?: string;
  empresaId?: string;
  onNotificarCliente?: (clienteId: string, mensagem: string) => void;
}

export function FilaEspera({ profissionalId, empresaId, onNotificarCliente }: FilaEsperaProps) {
  const [clientes, setClientes] = useState<ClienteFila[]>([]);
  const [showNovoCliente, setShowNovoCliente] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [novoCliente, setNovoCliente] = useState({
    nome: '',
    telefone: '',
    servicoDesejado: '',
    prioridade: 'media' as 'alta' | 'media' | 'baixa',
    horarioPreferencial: '',
    observacao: '',
  });

  // Mock data para demonstração
  useEffect(() => {
    const mockClientes: ClienteFila[] = [
      {
        id: '1',
        nome: 'Maria Silva',
        telefone: '(75) 98888-1111',
        servicoDesejado: 'Corte de cabelo',
        dataSolicitacao: new Date(2024, 3, 24, 10, 30),
        prioridade: 'alta',
        status: 'aguardando',
        horarioPreferencial: 'Manhã',
        observacao: 'Cliente preferencial',
      },
      {
        id: '2',
        nome: 'João Santos',
        telefone: '(75) 97777-2222',
        servicoDesejado: 'Barba',
        dataSolicitacao: new Date(2024, 3, 24, 11, 0),
        prioridade: 'media',
        status: 'aguardando',
      },
      {
        id: '3',
        nome: 'Ana Oliveira',
        telefone: '(75) 96666-3333',
        servicoDesejado: 'Manicure',
        dataSolicitacao: new Date(2024, 3, 23, 14, 0),
        prioridade: 'baixa',
        status: 'confirmado',
        horarioPreferencial: 'Tarde',
      },
    ];
    setClientes(mockClientes);
    setLoading(false);
  }, []);

  const adicionarCliente = () => {
    if (!novoCliente.nome || !novoCliente.telefone || !novoCliente.servicoDesejado) return;

    const novo: ClienteFila = {
      id: Date.now().toString(),
      nome: novoCliente.nome,
      telefone: novoCliente.telefone,
      servicoDesejado: novoCliente.servicoDesejado,
      dataSolicitacao: new Date(),
      prioridade: novoCliente.prioridade,
      status: 'aguardando',
      horarioPreferencial: novoCliente.horarioPreferencial || undefined,
      observacao: novoCliente.observacao || undefined,
    };

    setClientes(prev => [novo, ...prev]);
    setShowNovoCliente(false);
    setNovoCliente({
      nome: '',
      telefone: '',
      servicoDesejado: '',
      prioridade: 'media',
      horarioPreferencial: '',
      observacao: '',
    });
  };

  const atualizarStatus = (id: string, novoStatus: ClienteFila['status']) => {
    setClientes(prev =>
      prev.map(cliente =>
        cliente.id === id ? { ...cliente, status: novoStatus } : cliente
      )
    );

    // Notificar cliente se necessário
    if (onNotificarCliente && (novoStatus === 'confirmado' || novoStatus === 'cancelado')) {
      const cliente = clientes.find(c => c.id === id);
      if (cliente) {
        const mensagem = novoStatus === 'confirmado'
          ? `Olá ${cliente.nome}! Sua vaga na fila de espera foi confirmada. Por favor, confirme sua presença.`
          : `Olá ${cliente.nome}! Infelizmente sua solicitação foi cancelada. Entre em contato para mais informações.`;
        onNotificarCliente(id, mensagem);
      }
    }
  };

  const removerCliente = (id: string) => {
    if (window.confirm('Remover este cliente da fila?')) {
      setClientes(prev => prev.filter(c => c.id !== id));
    }
  };

  const enviarNotificacaoManual = (cliente: ClienteFila) => {
    if (onNotificarCliente) {
      const mensagem = `Olá ${cliente.nome}! Temos uma vaga disponível para ${cliente.servicoDesejado}. Deseja confirmar o horário?`;
      onNotificarCliente(cliente.id, mensagem);
      alert(`Notificação enviada para ${cliente.nome}`);
    }
  };

  const clientesFiltrados = clientes.filter(c => filtroStatus === 'todos' || c.status === filtroStatus);

  const getPrioridadeCor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-100 text-red-700 border-red-200';
      case 'media': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getStatusIcone = (status: string) => {
    switch (status) {
      case 'confirmado': return <CheckCircle size={16} className="text-green-500" />;
      case 'cancelado': return <XCircle size={16} className="text-red-500" />;
      case 'atendido': return <CheckCircle size={16} className="text-blue-500" />;
      default: return <Clock size={16} className="text-yellow-500" />;
    }
  };

  const getStatusTexto = (status: string) => {
    switch (status) {
      case 'aguardando': return 'Aguardando';
      case 'confirmado': return 'Confirmado';
      case 'cancelado': return 'Cancelado';
      case 'atendido': return 'Atendido';
      default: return status;
    }
  };

  const formatarHorario = (data: Date) => {
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatarData = (data: Date) => {
    return data.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return <div className="text-center py-8">Carregando fila de espera...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users size={20} className="text-blue-500" />
              Fila de Espera
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {clientes.filter(c => c.status === 'aguardando').length} cliente(s) aguardando
            </p>
          </div>
          <button
            onClick={() => setShowNovoCliente(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={18} /> Adicionar à Fila
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="p-4 border-b flex gap-2 overflow-x-auto">
        {['todos', 'aguardando', 'confirmado', 'atendido', 'cancelado'].map(status => (
          <button
            key={status}
            onClick={() => setFiltroStatus(status)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filtroStatus === status
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status === 'todos' ? 'Todos' : getStatusTexto(status)}
          </button>
        ))}
      </div>

      {/* Lista de Clientes */}
      <div className="divide-y max-h-[500px] overflow-y-auto">
        {clientesFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Nenhum cliente na fila</p>
          </div>
        ) : (
          clientesFiltrados.map(cliente => (
            <div key={cliente.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPrioridadeCor(cliente.prioridade)}`}>
                      {cliente.prioridade === 'alta' ? '🔴 Alta' : cliente.prioridade === 'media' ? '🟡 Média' : '🟢 Baixa'}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar size={12} />
                      {formatarData(cliente.dataSolicitacao)} às {formatarHorario(cliente.dataSolicitacao)}
                    </div>
                  </div>
                  <p className="font-medium text-gray-800">{cliente.nome}</p>
                  <p className="text-sm text-gray-600">📞 {cliente.telefone}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    🎯 Serviço: <span className="font-medium">{cliente.servicoDesejado}</span>
                  </p>
                  {cliente.horarioPreferencial && (
                    <p className="text-xs text-gray-400">⏰ Prefere: {cliente.horarioPreferencial}</p>
                  )}
                  {cliente.observacao && (
                    <p className="text-xs text-gray-400 mt-1">📝 {cliente.observacao}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1 text-sm">
                    {getStatusIcone(cliente.status)}
                    <span className={cliente.status === 'aguardando' ? 'text-yellow-600' : cliente.status === 'confirmado' ? 'text-green-600' : 'text-gray-500'}>
                      {getStatusTexto(cliente.status)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {cliente.status === 'aguardando' && (
                      <>
                        <button
                          onClick={() => atualizarStatus(cliente.id, 'confirmado')}
                          className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Confirmar"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => enviarNotificacaoManual(cliente)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Notificar"
                        >
                          <Bell size={18} />
                        </button>
                      </>
                    )}
                    {cliente.status === 'confirmado' && (
                      <button
                        onClick={() => atualizarStatus(cliente.id, 'atendido')}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Marcar como atendido"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => removerCliente(cliente.id)}
                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Remover"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Novo Cliente */}
      {showNovoCliente && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Adicionar à Fila de Espera</h3>
              <button onClick={() => setShowNovoCliente(false)} className="p-1 hover:bg-gray-100 rounded">
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input
                  type="text"
                  value={novoCliente.nome}
                  onChange={(e) => setNovoCliente(prev => ({ ...prev, nome: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefone *</label>
                <input
                  type="tel"
                  value={novoCliente.telefone}
                  onChange={(e) => setNovoCliente(prev => ({ ...prev, telefone: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Serviço Desejado *</label>
                <input
                  type="text"
                  value={novoCliente.servicoDesejado}
                  onChange={(e) => setNovoCliente(prev => ({ ...prev, servicoDesejado: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Ex: Corte de cabelo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Prioridade</label>
                <select
                  value={novoCliente.prioridade}
                  onChange={(e) => setNovoCliente(prev => ({ ...prev, prioridade: e.target.value as any }))}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Horário Preferencial</label>
                <input
                  type="text"
                  value={novoCliente.horarioPreferencial}
                  onChange={(e) => setNovoCliente(prev => ({ ...prev, horarioPreferencial: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Ex: Manhã, Tarde, 14h..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Observação</label>
                <textarea
                  value={novoCliente.observacao}
                  onChange={(e) => setNovoCliente(prev => ({ ...prev, observacao: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                  placeholder="Informações adicionais..."
                />
              </div>
            </div>
            <div className="p-4 border-t flex gap-3">
              <button
                onClick={adicionarCliente}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600"
              >
                Adicionar
              </button>
              <button
                onClick={() => setShowNovoCliente(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}