// app/admin-master/cozinha-chef/compras/ajuste/page.tsx

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Package,
  Trash2
} from 'lucide-react';
import { useCompras } from '@/hooks/cozinha/useCompras';
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

  // Carregar itens comprados
  const carregarItensComprados = () => {
    const comprados = items.filter(i => i.comprado);
    const ajustesMap: Record<string, ItemAjuste> = {};
    
    comprados.forEach(item => {
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

  const removerDoAjuste = (id: string) => {
    setAjustes((prev) => {
      const novo = { ...prev };
      delete novo[id];
      return novo;
    });
  };

  const excluirItemDaCompra = async (id: string) => {
    const ok = await excluir(id);
    if (!ok) {
      setResultado({ tipo: 'error', mensagem: '❌ Não foi possível excluir o item da lista de compras.' });
      return;
    }
    removerDoAjuste(id);
    setResultado({ tipo: 'success', mensagem: '✅ Item excluído da lista de compras.' });
  };

  useEffect(() => {
    if (!loading) {
      carregarItensAguardandoAjuste();
    }
  }, [loading, items]);

  // Atualizar ajuste
  const atualizarAjuste = (
    id: string,
    campo: 'quantidade_real' | 'preco_real' | 'fornecedor',
    valor: number | string
  ) => {
    setAjustes(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [campo]: valor
      }
    }));
  };

  // Salvar ajustes
  const salvarAjustes = async () => {
    setSalvando(true);
    setResultado(null);
    
    try {
      const itensAjustados = Object.values(ajustes);

      const estResp = await fetch('/api/cozinha/estoque');
      const estData = await estResp.json();
      const estoqueAtual = estData.success ? (estData.data || []) : [];

      const normalizar = (v: string) =>
        String(v || '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .trim();

      const toBase = (qtd: number, unidade: string) => {
        const u = normalizar(unidade);
        if (u === 'kg') return qtd * 1000;
        if (u === 'l') return qtd * 1000;
        if (u === 'dz') return qtd * 12;
        return qtd;
      };

      const fromBaseToUnit = (qtdBase: number, unidade: string) => {
        const u = normalizar(unidade);
        if (u === 'kg') return qtdBase / 1000;
        if (u === 'l') return qtdBase / 1000;
        if (u === 'dz') return qtdBase / 12;
        return qtdBase;
      };

      const resultados = await Promise.all(
        itensAjustados.map(async (item) => {
          const compraOk = await atualizar(item.id, {
            quantidade: item.quantidade_real,
            preco_real: item.preco_real,
            fornecedor: item.fornecedor,
            comprado: true,
            data_compra: new Date().toISOString(),
          });

          const alvoEstoque = estoqueAtual.find(
            (e: any) => normalizar(e.nome) === normalizar(item.nome)
          );

          if (alvoEstoque?.id) {
            const qtdCompraBase = toBase(Number(item.quantidade_real || 0), item.unidade || 'un');
            const qtdEstoqueBase = toBase(Number(alvoEstoque.quantidade || 0), alvoEstoque.unidade || 'un');
            const novaQuantidadeEstoque = fromBaseToUnit(
              qtdEstoqueBase + qtdCompraBase,
              alvoEstoque.unidade || 'un'
            );

            await fetch(`/api/cozinha/estoque?id=${alvoEstoque.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                quantidade: Number(novaQuantidadeEstoque || 0),
                preco_unitario: Number(item.preco_real || alvoEstoque.preco_unitario || 0),
                fornecedor: item.fornecedor || alvoEstoque.fornecedor || ''
              })
            });
          }

          await fetch('/api/cozinha/stock-movements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ingredientId: alvoEstoque?.id || item.id,
              ingredientName: item.nome,
              ingredient_id: alvoEstoque?.id || item.id,
              ingredient_name: item.nome,
              type: 'entrada',
              quantity: Number(item.quantidade_real || 0),
              unit: item.unidade,
              reason: `Compra aprovada - fornecedor: ${item.fornecedor || 'não informado'}`,
              createdAt: new Date().toISOString()
            })
          }).catch(() => null);

          return compraOk;
        })
      );

      const success = resultados.every(Boolean);
      
      if (success) {
        setResultado({
          tipo: 'success',
          mensagem: `✅ Estoque atualizado com sucesso! ${itensAjustados.length} itens ajustados.`
        });
        await carregar();
        window.dispatchEvent(new CustomEvent('cozinha_data_updated'));
        setTimeout(() => carregarItensComprados(), 500);
      } else {
        setResultado({
          tipo: 'error',
          mensagem: '❌ Erro ao atualizar estoque. Tente novamente.'
        });
      }
    } catch (error) {
      setResultado({
        tipo: 'error',
        mensagem: '❌ Erro ao salvar ajustes.'
      });
    } finally {
      setSalvando(false);
    }
  };

  const itensComprados = Object.values(ajustes);
  const totalAjustado = itensComprados.reduce((sum, item) => sum + (item.quantidade_real * (item.preco_real || 0)), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <Link href="/admin-master/cozinha-chef/compras" className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition">
              <ArrowLeft size={16} /> Voltar à Lista de Compras
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2 mt-1">
              <Package className="text-blue-400" />
              Ajuste Pós-Compra
            </h1>
            <p className="text-sm text-gray-400">Ajuste quantidades e preços reais da compra</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={carregarItensAguardandoAjuste}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg flex items-center gap-2 text-sm transition"
            >
              <AlertCircle size={16} /> Carregar Aguardando Ajuste
            </button>
            <button
              onClick={carregarItensComprados}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 text-sm transition"
            >
              <RefreshCw size={16} /> Carregar Itens Comprados
            </button>
            <button
              onClick={salvarAjustes}
              disabled={itensComprados.length === 0 || salvando}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 text-sm transition disabled:opacity-50"
            >
              {salvando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {salvando ? 'Salvando...' : 'Salvar Ajustes'}
            </button>
          </div>
        </div>

        {/* Resultado */}
        {resultado && (
          <div className={`p-4 rounded-lg border mb-6 ${
            resultado.tipo === 'success' 
              ? 'border-green-500/30 bg-green-500/10 text-green-400' 
              : 'border-red-500/30 bg-red-500/10 text-red-400'
          }`}>
            <div className="flex items-center gap-2">
              {resultado.tipo === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              {resultado.mensagem}
            </div>
          </div>
        )}

        {/* Lista de Itens Comprados */}
        {itensComprados.length === 0 ? (
          <div className="text-center py-12 text-gray-400 border border-dashed border-gray-700 rounded-xl">
            <Package size={48} className="mx-auto opacity-30 mb-3" />
            <p>Nenhum item comprado encontrado</p>
            <p className="text-sm text-gray-500 mt-1">
              Marque itens como comprados e use "Carregar Aguardando Ajuste" para editar, ajustar ou excluir.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {itensComprados.map((item) => (
              <div key={item.id} className="bg-gray-800/30 rounded-xl border border-gray-700 p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[150px]">
                    <h3 className="font-medium">{item.nome}</h3>
                    <p className="text-sm text-gray-400">{item.unidade}</p>
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <label className="text-xs text-gray-400 block">Previsto</label>
                    <p className="font-medium">{item.quantidade} {item.unidade}</p>
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <label className="text-xs text-gray-400 block">Quantidade Real</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.quantidade_real || item.quantidade}
                      onChange={(e) => atualizarAjuste(item.id, 'quantidade_real', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <label className="text-xs text-gray-400 block">Preço Real (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.preco_real || item.preco_estimado || 0}
                      onChange={(e) => atualizarAjuste(item.id, 'preco_real', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1 min-w-[170px]">
                    <label className="text-xs text-gray-400 block">Fornecedor</label>
                    <input
                      type="text"
                      value={item.fornecedor || ''}
                      onChange={(e) => atualizarAjuste(item.id, 'fornecedor', e.target.value)}
                      placeholder="Nome do fornecedor"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1 min-w-[100px] text-right">
                    <p className="text-xs text-gray-400">Subtotal</p>
                    <p className="font-bold text-green-400">
                      R$ {((item.quantidade_real || item.quantidade) * (item.preco_real || 0)).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removerDoAjuste(item.id)}
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs"
                    >
                      Remover da Tela
                    </button>
                    <button
                      onClick={() => excluirItemDaCompra(item.id)}
                      className="px-3 py-2 bg-red-700 hover:bg-red-600 rounded-lg text-xs flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Excluir Item
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Resumo */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 mt-4">
              <div className="flex flex-wrap justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400">Total de Itens Ajustados</p>
                  <p className="text-2xl font-bold">{itensComprados.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Valor Total Ajustado</p>
                  <p className="text-2xl font-bold text-green-400">R$ {totalAjustado.toFixed(2)}</p>
                </div>
                <button
                  onClick={salvarAjustes}
                  disabled={salvando}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl flex items-center gap-2 transition disabled:opacity-50"
                >
                  {salvando ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                  {salvando ? 'Salvando...' : 'Atualizar Estoque'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}