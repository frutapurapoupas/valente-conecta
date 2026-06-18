'use client';

import { useEffect, useState } from 'react';

interface ItemCompra {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  prioridade: 'alta' | 'media' | 'baixa';
  status: 'pendente' | 'comprado';
}

export default function ComprasPage() {
  const [itens, setItens] = useState<ItemCompra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarListaCompras();
  }, []);

  async function carregarListaCompras() {
    setLoading(true);
    try {
      // Tentar carregar lista de compras salva
      const saved = localStorage.getItem('lista_compras');
      if (saved) {
        setItens(JSON.parse(saved));
      } else {
        // Dados de exemplo
        setItens([
          { id: '1', nome: 'Arroz', quantidade: 10, unidade: 'kg', prioridade: 'alta', status: 'pendente' },
          { id: '2', nome: 'Feijão', quantidade: 5, unidade: 'kg', prioridade: 'alta', status: 'pendente' },
          { id: '3', nome: 'Óleo', quantidade: 2, unidade: 'L', prioridade: 'media', status: 'pendente' }
        ]);
      }
    } catch (error) {
      console.error('Erro ao carregar lista:', error);
    } finally {
      setLoading(false);
    }
  }

  function salvarLista(novaLista: ItemCompra[]) {
    setItens(novaLista);
    localStorage.setItem('lista_compras', JSON.stringify(novaLista));
  }

  function adicionarItem() {
    const nome = prompt('Nome do item:');
    if (!nome) return;
    
    const quantidade = parseFloat(prompt('Quantidade:') || '0');
    if (quantidade <= 0) return;
    
    const unidade = prompt('Unidade (kg, L, unidade):') || 'un';
    const prioridade = prompt('Prioridade (alta/media/baixa):') || 'media';
    
    const novoItem: ItemCompra = {
      id: Date.now().toString(),
      nome,
      quantidade,
      unidade,
      prioridade: prioridade as any,
      status: 'pendente'
    };
    
    salvarLista([...itens, novoItem]);
  }

  function toggleStatus(id: string) {
    const novaLista = itens.map(item =>
      item.id === id
        ? { ...item, status: item.status === 'pendente' ? 'comprado' : 'pendente' }
        : item
    );
    salvarLista(novaLista);
  }

  function removerItem(id: string) {
    if (confirm('Remover este item da lista?')) {
      salvarLista(itens.filter(item => item.id !== id));
    }
  }

  function limparComprados() {
    if (confirm('Remover todos os itens comprados?')) {
      salvarLista(itens.filter(item => item.status !== 'comprado'));
    }
  }

  const prioridadeCores = {
    alta: 'text-red-600 bg-red-50',
    media: 'text-yellow-600 bg-yellow-50',
    baixa: 'text-green-600 bg-green-50'
  };

  const pendentes = itens.filter(i => i.status === 'pendente');
  const comprados = itens.filter(i => i.status === 'comprado');

  if (loading) {
    return (
      <div className="p-8 text-center">Carregando lista de compras...</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🛒 Lista de Compras</h1>
          <p className="text-gray-600 mt-2">Gerencie os itens para comprar</p>
        </div>

        {/* Ações */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={adicionarItem}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            + Adicionar Item
          </button>
          <button
            onClick={limparComprados}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            Limpar Comprados
          </button>
        </div>

        {/* Lista de Pendentes */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📋 Para Comprar ({pendentes.length})</h2>
          {pendentes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum item pendente</p>
          ) : (
            <div className="space-y-2">
              {pendentes.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => toggleStatus(item.id)}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <div>
                      <p className="font-medium">{item.nome}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantidade} {item.unidade}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${prioridadeCores[item.prioridade]}`}>
                      {item.prioridade}
                    </span>
                    <button
                      onClick={() => removerItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lista de Comprados */}
        {comprados.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">✅ Já Comprados ({comprados.length})</h2>
            <div className="space-y-2">
              {comprados.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 opacity-70"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => toggleStatus(item.id)}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <div>
                      <p className="font-medium line-through">{item.nome}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantidade} {item.unidade}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removerItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
