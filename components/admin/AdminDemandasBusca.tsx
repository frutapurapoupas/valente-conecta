'use client';

import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Archive, Trash2, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DemandaBusca {
  id: string;
  termo: string;
  userId: string;
  localizacao?: { lat: number; lng: number };
  status: 'pendente' | 'respondida' | 'arquivada';
  criadoEm: string;
  respondidoEm: string | null;
  resposta: string | null;
}

interface AdminDemandasBuscaProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function AdminDemandasBusca({
  autoRefresh = true,
  refreshInterval = 30000
}: AdminDemandasBuscaProps) {
  const [demandas, setDemandas] = useState<DemandaBusca[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<'pendente' | 'respondida' | 'arquivada' | 'todos'>('pendente');
  const [carregando, setCarregando] = useState(true);
  const [expandida, setExpandida] = useState<string | null>(null);
  const [respostaModal, setRespostaModal] = useState<{ demandaId: string; show: boolean } | null>(null);
  const [resposta, setResposta] = useState('');
  const [estatisticas, setEstatisticas] = useState({ pendentes: 0, respondidas: 0, arquivadas: 0 });

  // Carregar demandas
  const carregarDemandas = async () => {
    try {
      const response = await fetch(`/api/admin/demandas-busca?status=${filtroStatus}`);
      const data = await response.json();

      if (data.success) {
        setDemandas(data.demandas);
        setEstatisticas(data.estatisticas);
      }
    } catch (error) {
      console.error('Erro ao carregar demandas:', error);
      toast.error('Erro ao carregar demandas');
    } finally {
      setCarregando(false);
    }
  };

  // Auto-refresh
  useEffect(() => {
    carregarDemandas();
    
    if (autoRefresh) {
      const interval = setInterval(carregarDemandas, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [filtroStatus, autoRefresh, refreshInterval]);

  // Responder demanda
  const handleResponder = async (demandaId: string) => {
    if (!resposta.trim()) {
      toast.error('Digite uma resposta');
      return;
    }

    try {
      const response = await fetch('/api/admin/demandas-busca', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demandaId,
          status: 'respondida',
          resposta
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Demanda respondida!');
        setResposta('');
        setRespostaModal(null);
        carregarDemandas();
      }
    } catch (error) {
      console.error('Erro ao responder:', error);
      toast.error('Erro ao responder demanda');
    }
  };

  // Arquivar demanda
  const handleArquivar = async (demandaId: string) => {
    try {
      const response = await fetch('/api/admin/demandas-busca', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demandaId,
          status: 'arquivada'
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Demanda arquivada');
        carregarDemandas();
      }
    } catch (error) {
      console.error('Erro ao arquivar:', error);
      toast.error('Erro ao arquivar demanda');
    }
  };

  // Deletar demanda
  const handleDeletar = async (demandaId: string) => {
    if (!confirm('Tem certeza que deseja deletar?')) return;

    try {
      const response = await fetch(`/api/admin/demandas-busca?id=${demandaId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Demanda deletada');
        carregarDemandas();
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
      toast.error('Erro ao deletar demanda');
    }
  };

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-blue-600" />
              Demandas de Busca
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Gerenciar buscas que não encontraram resultados locais
            </p>
          </div>
          <button
            onClick={carregarDemandas}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Atualizar
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-700 font-semibold">PENDENTES</p>
            <p className="text-2xl font-bold text-yellow-600">{estatisticas.pendentes}</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-xs text-green-700 font-semibold">RESPONDIDAS</p>
            <p className="text-2xl font-bold text-green-600">{estatisticas.respondidas}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-700 font-semibold">ARQUIVADAS</p>
            <p className="text-2xl font-bold text-gray-600">{estatisticas.arquivadas}</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {['pendente', 'respondida', 'arquivada', 'todos'].map((status) => (
          <button
            key={status}
            onClick={() => setFiltroStatus(status as any)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filtroStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Lista de demandas */}
      <div className="space-y-2">
        {carregando ? (
          <div className="text-center py-8 text-gray-500">Carregando...</div>
        ) : demandas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhuma demanda encontrada
          </div>
        ) : (
          demandas.map((demanda) => (
            <div
              key={demanda.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
            >
              {/* Card fechado */}
              <button
                onClick={() => setExpandida(expandida === demanda.id ? null : demanda.id)}
                className="w-full text-left p-4 flex items-start justify-between hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      "{demanda.termo}"
                    </h3>
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        demanda.status === 'pendente'
                          ? 'bg-yellow-100 text-yellow-700'
                          : demanda.status === 'respondida'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {demanda.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Usuário: {demanda.userId}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatarData(demanda.criadoEm)}
                  </p>
                </div>
                <div className="text-gray-400">
                  {expandida === demanda.id ? '▲' : '▼'}
                </div>
              </button>

              {/* Card expandido */}
              {expandida === demanda.id && (
                <div className="bg-gray-50 border-t border-gray-200 p-4 space-y-3">
                  {/* Localização */}
                  {demanda.localizacao && (
                    <div className="text-sm">
                      <p className="font-semibold text-gray-700">Localização:</p>
                      <p className="text-gray-600">
                        Lat: {demanda.localizacao.lat.toFixed(4)}, Lng: {demanda.localizacao.lng.toFixed(4)}
                      </p>
                      <a
                        href={`https://www.google.com/maps/?q=${demanda.localizacao.lat},${demanda.localizacao.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Ver no mapa
                      </a>
                    </div>
                  )}

                  {/* Resposta anterior */}
                  {demanda.resposta && (
                    <div className="text-sm bg-white p-3 rounded-lg border border-green-200">
                      <p className="font-semibold text-gray-700">Resposta:</p>
                      <p className="text-gray-600 mt-1">{demanda.resposta}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatarData(demanda.respondidoEm || '')}
                      </p>
                    </div>
                  )}

                  {/* Área para nova resposta */}
                  {demanda.status === 'pendente' && (
                    <div className="space-y-2">
                      <textarea
                        value={respostaModal?.demandaId === demanda.id ? resposta : ''}
                        onChange={(e) => setResposta(e.target.value)}
                        onClick={() => setRespostaModal({ demandaId: demanda.id, show: true })}
                        placeholder="Digite uma resposta ou sugestão..."
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResponder(demanda.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Responder
                        </button>
                        <button
                          onClick={() => setRespostaModal(null)}
                          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg font-semibold text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    {demanda.status === 'pendente' && (
                      <button
                        onClick={() => handleArquivar(demanda.id)}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                      >
                        <Archive className="w-4 h-4" />
                        Arquivar
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletar(demanda.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Deletar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
