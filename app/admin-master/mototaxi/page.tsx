'use client';

import { Bike, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Corrida {
  id: string;
  passageiroNome: string;
  passageiroTelefone: string;
  origem: string;
  destino: string;
  valor: number;
  status: 'pendente' | 'aceita' | 'a_caminho' | 'finalizada' | 'cancelada';
  motoristaId?: string;
  motoristaNome?: string;
  motoristaTelefone?: string;
  latOrigem: number;
  lngOrigem: number;
}

export default function AdminMotoTaxi() {
  const [corridas, setCorridas] = useState<Corrida[]>([]);
  const [filtro, setFiltro] = useState<'todas' | 'pendente' | 'em_andamento' | 'finalizada'>('todas');

  const carregarCorridas = () => {
    const dados = JSON.parse(localStorage.getItem('mototaxi_corridas') || '[]');
    setCorridas(dados);
  };

  useEffect(() => {
    carregarCorridas();
    const interval = setInterval(carregarCorridas, 5000);
    return () => clearInterval(interval);
  }, []);

  const excluirCorrida = (id: string) => {
    const novas = corridas.filter((c) => c.id !== id);
    localStorage.setItem('mototaxi_corridas', JSON.stringify(novas));
    setCorridas(novas);
  };

  const limparHistorico = () => {
    if (confirm('Deseja realmente limpar todo o histórico de corridas?')) {
      localStorage.setItem('mototaxi_corridas', '[]');
      setCorridas([]);
    }
  };

  const filtrarLista = () => {
    if (filtro === 'todas') return corridas;
    if (filtro === 'pendente') return corridas.filter((c) => c.status === 'pendente');
    if (filtro === 'em_andamento') return corridas.filter((c) => ['aceita', 'a_caminho'].includes(c.status));
    return corridas.filter((c) => ['finalizada', 'cancelada'].includes(c.status));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 text-white rounded-lg">
            <Bike className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Master - Mototáxi</h1>
            <p className="text-sm text-gray-500">Controle e auditoria de corridas em Valente-BA</p>
          </div>
        </div>
        <button
          onClick={limparHistorico}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded transition-all"
        >
          Limpar Tudo
        </button>
      </div>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <span className="text-xs text-gray-400 font-bold block">TOTAL</span>
          <span className="text-2xl font-black text-gray-800">{corridas.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <span className="text-xs text-yellow-500 font-bold block">AGUARDANDO</span>
          <span className="text-2xl font-black text-yellow-600">
            {corridas.filter(c => c.status === 'pendente').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <span className="text-xs text-blue-500 font-bold block">EM VIAGEM</span>
          <span className="text-2xl font-black text-blue-600">
            {corridas.filter(c => ['aceita', 'a_caminho'].includes(c.status)).length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <span className="text-xs text-green-500 font-bold block">CONCLUÍDAS</span>
          <span className="text-2xl font-black text-green-600">
            {corridas.filter(c => c.status === 'finalizada').length}
          </span>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        {['todas', 'pendente', 'em_andamento', 'finalizada'].map((tipo) => (
          <button
            key={tipo}
            onClick={() => setFiltro(tipo as any)}
            className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${filtro === tipo ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'
              }`}
          >
            {tipo.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Lista de Monitoramento */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-xs font-bold text-gray-500 border-b">
              <th className="p-3">Cliente</th>
              <th className="p-3">Trajeto</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Motorista</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y text-xs">
            {filtrarLista().length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-gray-400">Nenhuma corrida encontrada para o filtro atual.</td>
              </tr>
            ) : (
              filtrarLista().map((corrida) => (
                <tr key={corrida.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-semibold">
                    {corrida.passageiroNome}
                    <span className="block text-[10px] text-gray-400 font-normal">{corrida.passageiroTelefone}</span>
                  </td>
                  <td className="p-3">
                    <span className="font-medium text-blue-600">De:</span> {corrida.origem}
                    <span className="block font-medium text-green-600">Para: {corrida.destino}</span>
                  </td>
                  <td className="p-3 font-bold text-gray-700">R$ {corrida.valor.toFixed(2)}</td>
                  <td className="p-3">
                    {corrida.motoristaNome ? (
                      <>
                        <span className="font-semibold">{corrida.motoristaNome}</span>
                        <span className="block text-[10px] text-gray-400">{corrida.motoristaTelefone}</span>
                      </>
                    ) : (
                      <span className="text-gray-400 italic">Procurando...</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-black text-[10px] ${corrida.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                        corrida.status === 'aceita' ? 'bg-blue-100 text-blue-700' :
                          corrida.status === 'a_caminho' ? 'bg-indigo-100 text-indigo-700' :
                            corrida.status === 'finalizada' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                      }`}>
                      {corrida.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => excluirCorrida(corrida.id)}
                      className="p-1 hover:bg-red-50 text-red-500 rounded transition-all"
                      title="Excluir do sistema"
                    >
                      <Trash2 className="w-4 h-4 mx-auto" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}