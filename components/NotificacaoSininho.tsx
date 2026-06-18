'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Notificacao {
  id: number;
  titulo: string;
  mensagem: string;
  produtoId: string;
  lida: boolean;
  data: string;
}

export default function NotificacaoSininho() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [naoLidas, setNaoLidas] = useState(0);

  useEffect(() => {
    carregarNotificacoes();
    
    // Verificar notificações a cada 30 segundos
    const interval = setInterval(carregarNotificacoes, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const carregarNotificacoes = async () => {
    try {
      const response = await fetch('/api/notificacoes');
      const data = await response.json();
      
      if (data.success) {
        setNotificacoes(data.notificacoes);
        const naoLidasCount = data.notificacoes.filter((n: Notificacao) => !n.lida).length;
        setNaoLidas(naoLidasCount);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const marcarComoLida = async (id: number) => {
    try {
      await fetch(`/api/notificacoes?id=${id}`, { method: 'PUT' });
      carregarNotificacoes();
    } catch (error) {
      console.error('Erro ao marcar notificação:', error);
    }
  };

  const handleNotificacaoClick = (notificacao: Notificacao) => {
    marcarComoLida(notificacao.id);
    setMostrarMenu(false);
    
    // Redirecionar para o produto encontrado
    if (notificacao.produtoId) {
      window.location.href = `/catalogo/produto/${notificacao.produtoId}`;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setMostrarMenu(!mostrarMenu)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {naoLidas > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      {mostrarMenu && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="p-3 border-b bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Notificações</h3>
              <button onClick={() => setMostrarMenu(false)}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notificacoes.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              notificacoes.map((notificacao) => (
                <div
                  key={notificacao.id}
                  onClick={() => handleNotificacaoClick(notificacao)}
                  className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notificacao.lida ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex gap-2">
                    <div className="flex-shrink-0">
                      <Package className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{notificacao.titulo}</p>
                      <p className="text-xs text-gray-500 mt-1">{notificacao.mensagem}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notificacao.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    {!notificacao.lida && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}