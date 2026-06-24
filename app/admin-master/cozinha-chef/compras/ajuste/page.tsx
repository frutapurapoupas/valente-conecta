"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, RefreshCw, CheckCircle, AlertCircle, Loader2, Package, Trash2 } from 'lucide-react';
import { useCompras } from '@/hooks/cozinha/useCompras'; // CORREÇÃO: 'useCompras' com C maiúsculo
import { CompraItem } from '@/types/cozinha';

interface ItemAjuste extends CompraItem {
  quantidade_real: number;
  preco_real: number;
  fornecedor: string;
}

export default function AjustePosCompra() {
  const { items, loading, carregar, atualizar, excluir } = useCompras();
  const [ajustes, setAjustes] = useState<Record<string, ItemAjuste>>({});
  const [salvando, setSalvando] = useState(false);
  const [resultado, setResultado] = useState<{ tipo: 'success' | 'error'; mensagem: string } | null>(null);

  const carregarItensAguardandoAjuste = () => {
    const aguardando = items.filter(
      (i) => i.comprado && (!i.data_compra || !i.fornecedor || !(Number(i.preco_real || 0) > 0))
    );

    const ajustesMap: Record<string, ItemAjuste> = {};
    
    aguardando.forEach(item => {
      ajustesMap[item.id] = {
        ...item,
        quantidade_real: item.quantidade || 0,
        preco_real: item.preco_real || item.preco_estimado || 0,
        fornecedor: item.fornecedor || ''
      };
    });

    setAjustes(ajustesMap);
    setResultado(null);
  };

  // Carregar dados iniciais quando os itens mudarem
  useEffect(() => {
    carregarItensAguardandoAjuste();
  }, [items]);

  // Função handleInputChange para os campos controlados do formulário
  const handleInputChange = (id: string, campo: keyof ItemAjuste, valor: any) => {
    setAjustes(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [campo]: valor
      }
    }));
  };

  // Função salvar que continha o erro de tipo (data_compra corrigida)
  const handleSalvarAjuste = async (id: string) => {
    setSalvando(true);
    try {
      const item = ajustes[id];
      
      await atualizar(id, {
        ...item,
        comprado: true,
        data_compra: new Date(), // Mantido como objeto Date para evitar o erro anterior
      });

      setResultado({ tipo: 'success', mensagem: 'Ajuste salvo com sucesso!' });
      carregar(); // Recarrega os dados do hook global
    } catch (error) {
      setResultado({ tipo: 'error', mensagem: 'Erro ao salvar o ajuste.' });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin-master/cozinha-chef/compras" className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Ajuste Pós-Compra</h1>
        </div>
        <button 
          onClick={carregar} 
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Lista
        </button>
      </div>

      {/* Feedback Visual */}
      {resultado && (
        <div className={`p-4 mb-6 rounded-lg flex items-center gap-3 ${
          resultado.tipo === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {resultado.tipo === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{resultado.mensagem}</span>
        </div>
      )}

      {/* Tabela de Ajustes */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : Object.keys(ajustes).length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-xl bg-gray-50">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum item aguardando ajuste pós-compra.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-600 font-semibold text-sm">
                <th className="p-4">Item</th>
                <th className="p-4">Qtd. Real</th>
                <th className="p-4">Preço Real (R$)</th>
                <th className="p-4">Fornecedor</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-700">
              {Object.values(ajustes).map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium">{item.nome || 'Item sem nome'}</td>
                  <td className="p-4">
                    <input 
                      type="number" 
                      value={item.quantidade_real}
                      onChange={(e) => handleInputChange(item.id, 'quantidade_real', Number(e.target.value))}
                      className="w-20 px-2 py-1 border rounded focus:outline-orange-500"
                    />
                  </td>
                  <td className="p-4">
                    <input 
                      type="number" 
                      step="0.01"
                      value={item.preco_real}
                      onChange={(e) => handleInputChange(item.id, 'preco_real', Number(e.target.value))}
                      className="w-24 px-2 py-1 border rounded focus:outline-orange-500"
                    />
                  </td>
                  <td className="p-4">
                    <input 
                      type="text" 
                      value={item.fornecedor}
                      onChange={(e) => handleInputChange(item.id, 'fornecedor', e.target.value)}
                      placeholder="Nome do fornecedor"
                      className="w-full max-w-xs px-2 py-1 border rounded focus:outline-orange-500"
                    />
                  </td>
                  <td className="p-4 text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleSalvarAjuste(item.id)}
                      disabled={salvando}
                      className="p-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition shadow-sm disabled:opacity-50"
                      title="Salvar Alterações"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if(confirm("Deseja realmente excluir este item?")) {
                          await excluir(item.id);
                          carregar();
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Excluir Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
