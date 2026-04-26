// components/agendamento/NotificacaoAgendamento.tsx
'use client';

import { useState, useEffect } from 'react';
import { Bell, Calendar, Clock, MessageCircle, Mail, Smartphone, Check, X, Send } from 'lucide-react';

interface NotificacaoConfig {
  id: string;
  tipo: 'whatsapp' | 'sms' | 'email' | 'push';
  habilitado: boolean;
  antecedenciaMinutos: number;
  templateMensagem: string;
}

interface AgendamentoNotificacao {
  id: string;
  clienteNome: string;
  clienteTelefone: string;
  clienteEmail?: string;
  servico: string;
  data: Date;
  profissional: string;
}

interface NotificacaoAgendamentoProps {
  agendamento: AgendamentoNotificacao;
  onEnviarNotificacao: (tipo: string, mensagem: string) => Promise<void>;
  onFechar: () => void;
}

export function NotificacaoAgendamento({ agendamento, onEnviarNotificacao, onFechar }: NotificacaoAgendamentoProps) {
  const [configuracoes, setConfiguracoes] = useState<NotificacaoConfig[]>([
    { id: '1', tipo: 'whatsapp', habilitado: true, antecedenciaMinutos: 60, templateMensagem: 'Olá {cliente}, lembramos do seu agendamento para {servico} às {horario}.' },
    { id: '2', tipo: 'sms', habilitado: false, antecedenciaMinutos: 120, templateMensagem: 'Lembrete: {servico} em {data} às {horario}' },
    { id: '3', tipo: 'email', habilitado: false, antecedenciaMinutos: 1440, templateMensagem: 'Prezado(a) {cliente}, seu agendamento está confirmado para {data} às {horario}.' },
    { id: '4', tipo: 'push', habilitado: true, antecedenciaMinutos: 30, templateMensagem: '🔔 Seu horário está chegando! {servico} em {minutos} minutos.' },
  ]);
  const [notificacaoEnviada, setNotificacaoEnviada] = useState<{ tipo: string; sucesso: boolean }[]>([]);
  const [enviando, setEnviando] = useState(false);

  const formatarData = (data: Date) => {
    return data.toLocaleDateString('pt-BR');
  };

  const formatarHorario = (data: Date) => {
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const calcularDiferencaMinutos = (data: Date) => {
    const agora = new Date();
    const diffMs = data.getTime() - agora.getTime();
    return Math.floor(diffMs / (1000 * 60));
  };

  const preencherTemplate = (template: string, minutosAntecedencia?: number) => {
    return template
      .replace(/{cliente}/g, agendamento.clienteNome)
      .replace(/{servico}/g, agendamento.servico)
      .replace(/{data}/g, formatarData(agendamento.data))
      .replace(/{horario}/g, formatarHorario(agendamento.data))
      .replace(/{minutos}/g, (minutosAntecedencia || 0).toString())
      .replace(/{profissional}/g, agendamento.profissional);
  };

  const enviarNotificacao = async (config: NotificacaoConfig) => {
    setEnviando(true);
    const minutosAntecedencia = config.antecedenciaMinutos;
    const mensagem = preencherTemplate(config.templateMensagem, minutosAntecedencia);
    
    try {
      await onEnviarNotificacao(config.tipo, mensagem);
      setNotificacaoEnviada(prev => [...prev, { tipo: config.tipo, sucesso: true }]);
    } catch (error) {
      console.error(`Erro ao enviar ${config.tipo}:`, error);
      setNotificacaoEnviada(prev => [...prev, { tipo: config.tipo, sucesso: false }]);
    } finally {
      setEnviando(false);
    }
  };

  const enviarTodasNotificacoes = async () => {
    const configuracoesHabilitadas = configuracoes.filter(c => c.habilitado);
    for (const config of configuracoesHabilitadas) {
      await enviarNotificacao(config);
      await new Promise(resolve => setTimeout(resolve, 500)); // Delay entre envios
    }
  };

  const toggleConfiguracao = (id: string) => {
    setConfiguracoes(prev =>
      prev.map(c => c.id === id ? { ...c, habilitado: !c.habilitado } : c)
    );
  };

  const atualizarAntecedencia = (id: string, minutos: number) => {
    setConfiguracoes(prev =>
      prev.map(c => c.id === id ? { ...c, antecedenciaMinutos: minutos } : c)
    );
  };

  const minutosAteAgendamento = calcularDiferencaMinutos(agendamento.data);
  const podeNotificar = minutosAteAgendamento > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white p-4 border-b rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Bell size={20} className="text-blue-500" />
                Notificações de Agendamento
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Envie lembretes para {agendamento.clienteNome}
              </p>
            </div>
            <button onClick={onFechar} className="p-1 hover:bg-gray-100 rounded-lg">
              ✕
            </button>
          </div>
        </div>

        {/* Informações do Agendamento */}
        <div className="p-4 bg-blue-50 border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">Cliente</p>
              <p className="font-medium text-sm">{agendamento.clienteNome}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Serviço</p>
              <p className="font-medium text-sm">{agendamento.servico}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Data</p>
              <p className="font-medium text-sm flex items-center gap-1">
                <Calendar size={12} /> {formatarData(agendamento.data)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Horário</p>
              <p className="font-medium text-sm flex items-center gap-1">
                <Clock size={12} /> {formatarHorario(agendamento.data)}
              </p>
            </div>
          </div>
          {!podeNotificar && (
            <div className="mt-3 p-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm flex items-center gap-2">
              <Clock size={14} />
              Agendamento já passou ou está muito próximo. Não é possível enviar notificações.
            </div>
          )}
          {podeNotificar && minutosAteAgendamento < 60 && (
            <div className="mt-3 p-2 bg-orange-100 text-orange-700 rounded-lg text-sm flex items-center gap-2">
              <Bell size={14} />
              Atenção! O agendamento está a apenas {minutosAteAgendamento} minutos.
            </div>
          )}
        </div>

        {/* Configurações de Notificação */}
        <div className="p-4 space-y-4">
          <h3 className="font-medium text-gray-700">Canais de Notificação</h3>
          
          {configuracoes.map(config => (
            <div key={config.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    config.tipo === 'whatsapp' ? 'bg-green-100' :
                    config.tipo === 'sms' ? 'bg-blue-100' :
                    config.tipo === 'email' ? 'bg-purple-100' : 'bg-orange-100'
                  }`}>
                    {config.tipo === 'whatsapp' && <MessageCircle size={20} className="text-green-600" />}
                    {config.tipo === 'sms' && <Smartphone size={20} className="text-blue-600" />}
                    {config.tipo === 'email' && <Mail size={20} className="text-purple-600" />}
                    {config.tipo === 'push' && <Bell size={20} className="text-orange-600" />}
                  </div>
                  <div>
                    <p className="font-medium capitalize">{config.tipo}</p>
                    <p className="text-xs text-gray-500">
                      {config.tipo === 'whatsapp' && agendamento.clienteTelefone}
                      {config.tipo === 'sms' && agendamento.clienteTelefone}
                      {config.tipo === 'email' && (agendamento.clienteEmail || 'Não informado')}
                      {config.tipo === 'push' && 'Notificação push no app'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleConfiguracao(config.id)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    config.habilitado ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    config.habilitado ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>

              <div className="ml-14">
                <label className="text-xs text-gray-500 block mb-1">
                  Antecedência (minutos)
                </label>
                <select
                  value={config.antecedenciaMinutos}
                  onChange={(e) => atualizarAntecedencia(config.id, parseInt(e.target.value))}
                  className="text-sm border rounded-lg px-2 py-1 mb-3"
                  disabled={!config.habilitado}
                >
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={60}>1 hora</option>
                  <option value={120}>2 horas</option>
                  <option value={1440}>1 dia</option>
                  <option value={2880}>2 dias</option>
                </select>

                <label className="text-xs text-gray-500 block mb-1">Template da Mensagem</label>
                <textarea
                  value={config.templateMensagem}
                  onChange={(e) => setConfiguracoes(prev =>
                    prev.map(c => c.id === config.id ? { ...c, templateMensagem: e.target.value } : c)
                  )}
                  className="w-full text-sm border rounded-lg px-3 py-2 resize-none"
                  rows={2}
                  disabled={!config.habilitado}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Variáveis: {'{cliente}'}, {'{servico}'}, {'{data}'}, {'{horario}'}, {'{minutos}'}
                </p>
              </div>

              {notificacaoEnviada.find(n => n.tipo === config.tipo) && (
                <div className={`mt-3 text-sm flex items-center gap-1 ${
                  notificacaoEnviada.find(n => n.tipo === config.tipo)?.sucesso
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {notificacaoEnviada.find(n => n.tipo === config.tipo)?.sucesso ? (
                    <><Check size={14} /> Notificação enviada com sucesso!</>
                  ) : (
                    <><X size={14} /> Falha ao enviar notificação</>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Ações */}
        <div className="sticky bottom-0 bg-white p-4 border-t flex gap-3">
          <button
            onClick={enviarTodasNotificacoes}
            disabled={!podeNotificar || enviando}
            className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {enviando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Enviando...
              </>
            ) : (
              <>
                <Send size={18} />
                Enviar Notificações
              </>
            )}
          </button>
          <button
            onClick={onFechar}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}