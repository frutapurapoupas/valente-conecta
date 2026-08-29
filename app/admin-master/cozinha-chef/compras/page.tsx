"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Package,
  Loader2,
  Printer
} from 'lucide-react';
import { useCompras } from '../hooks/useCompras';
import { useComprasRequests } from '../hooks/useComprasRequests';
import { LinhaListaCompras } from './_components/LinhaListaCompras';

export default function ListaCompras() {
  const { items, loading, carregar, marcarComprado, desmarcarComprado, excluir, salvarFornecedor } = useCompras();
  const { items: requests, loading: loadingRequests, aprovar, reload: reloadRequests } = useComprasRequests();
  const [requestsCollapsed, setRequestsCollapsed] = useState(true);
  const [expandedRequestIds, setExpandedRequestIds] = useState<Record<string, boolean>>({});
  const [selectedRequestIds, setSelectedRequestIds] = useState<Record<string, boolean>>({});
  const [excludedIngredientIndexesByRequest, setExcludedIngredientIndexesByRequest] = useState<Record<string, Record<number, boolean>>>({});

  const pendentes = requests.filter((r) => r.status === 'pendente');

  const selectedPendentes = useMemo(
    () => pendentes.filter((req) => selectedRequestIds[req.id]),
    [pendentes, selectedRequestIds]
  );

  const getExcludedIndexes = (requestId: string) => {
    const map = excludedIngredientIndexesByRequest[requestId] || {};
    return Object.entries(map)
      .filter(([, checked]) => checked)
      .map(([index]) => Number(index))
      .filter((index) => Number.isInteger(index));
  };

  const handleAprovar = async (id: string) => {
    const result = await aprovar(id, { excludedIngredientIndexes: getExcludedIndexes(id) });
    if (result?.success) {
      await Promise.all([carregar(), reloadRequests()]);
      window.dispatchEvent(new CustomEvent('cozinha_data_updated'));
    } else {
      alert('Erro ao aprovar solicitação');
    }
  };

  const handleAprovarSelecionadas = async () => {
    if (selectedPendentes.length === 0) {
      alert('Selecione pelo menos uma remessa para aprovar.');
      return;
    }

    const results = await Promise.all(
      selectedPendentes.map((req) =>
        aprovar(req.id, { excludedIngredientIndexes: getExcludedIndexes(req.id) })
      )
    );
    const success = results.every((r: any) => r?.success);

    if (!success) {
      alert('Uma ou mais remessas falharam na aprovação.');
    }

    setSelectedRequestIds({});
    await Promise.all([carregar(), reloadRequests()]);
    window.dispatchEvent(new CustomEvent('cozinha_data_updated'));
  };

  const handleAprovarTodas = async () => {
    if (pendentes.length === 0) {
      alert('Não há remessas pendentes para aprovar.');
      return;
    }

    const results = await Promise.all(
      pendentes.map((req) =>
        aprovar(req.id, { excludedIngredientIndexes: getExcludedIndexes(req.id) })
      )
    );
    const success = results.every((r: any) => r?.success);

    if (!success) {
      alert('Uma ou mais remessas falharam na aprovação.');
    }

    setSelectedRequestIds({});
    await Promise.all([carregar(), reloadRequests()]);
    window.dispatchEvent(new CustomEvent('cozinha_data_updated'));
  };

  const toggleRequestExpand = (id: string) => {
    setExpandedRequestIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleRequestSelect = (id: string) => {
    setSelectedRequestIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleIngredientExclude = (requestId: string, ingredientIndex: number) => {
    setExcludedIngredientIndexesByRequest((prev) => ({
      ...prev,
      [requestId]: {
        ...(prev[requestId] || {}),
        [ingredientIndex]: !(prev[requestId]?.[ingredientIndex])
      }
    }));
  };

  const imprimirExtrato = () => {
    // item.preco_estimado/preco_real ja' sao o CUSTO TOTAL daquela linha
    // (soma de todos os ingredientes iguais mesclados de varias receitas —
    // ver /api/cozinha/lista-compras/revisar), nao um preco por unidade.
    // Multiplicar de novo pela quantidade aqui inflava o total absurdamente
    // (ex: R$ 4,97 de frango virava R$ 1.243,75 por causa dos 250g).
    const pendentesCompra = items.filter((i) => !i.comprado);
    const total = pendentesCompra.reduce((acc, item) => acc + Number(item.preco_estimado || 0), 0);

    const linhas = pendentesCompra
      .map((item) => {
        const valorTotal = Number(item.preco_real || item.preco_estimado || 0);
        const valorUnitario = item.quantidade > 0 ? valorTotal / item.quantidade : 0;
        return `
          <tr>
            <td>${item.nome}</td>
            <td>${item.quantidade}</td>
            <td>${item.unidade}</td>
            <td>${item.receita_origem || '-'}</td>
            <td>${item.fornecedor || '-'}</td>
            <td>R$ ${valorUnitario.toFixed(2)}</td>
            <td>R$ ${valorTotal.toFixed(2)}</td>
          </tr>`;
      })
      .join('');

    const html = `
      <html>
      <head>
        <title>Extrato de Compras - Cozinha Chef</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          h1 { margin-bottom: 6px; }
          .meta { color: #555; margin-bottom: 18px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f2f2f2; }
          .total { margin-top: 14px; font-weight: bold; font-size: 16px; }
        </style>
      </head>
      <body>
        <h1>Extrato de Compras - Cozinha Chef Neide</h1>
        <div class="meta">Emitido em ${new Date().toLocaleString('pt-BR')}</div>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantidade</th>
              <th>Unidade</th>
              <th>Origem</th>
              <th>Fornecedor</th>
              <th>Valor Unitário</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>${linhas || '<tr><td colspan="7">Sem itens pendentes.</td></tr>'}</tbody>
        </table>
        <div class="total">Valor total previsto: R$ ${total.toFixed(2)}</div>
      </body>
      </html>
    `;

    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.print();
  };


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
            <Link href="/admin-master/cozinha-chef" className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition">
              <ArrowLeft size={16} /> Voltar ao Dashboard
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2 mt-1">
              <Package className="text-blue-400" />
              Lista de Compras
            </h1>
            <p className="text-sm text-gray-400">Gerencie os itens para compra</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={carregar}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2 text-sm transition"
            >
              <Loader2 size={16} className={loading ? 'animate-spin' : ''} /> 
              Atualizar
            </button>
            <button
              onClick={imprimirExtrato}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center gap-2 text-sm transition"
            >
              <Printer size={16} /> Imprimir Extrato
            </button>
            <Link
              href="/admin-master/cozinha-chef/compras/ajuste"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 text-sm transition"
            >
              <CheckCircle size={16} /> Ajuste Pós-Compra
            </Link>
          </div>
        </div>

        {/* Lista de Itens */}
        <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-4 mb-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Solicitações de Compra Pendentes ({pendentes.length})</h2>
            <button
              onClick={() => setRequestsCollapsed((v) => !v)}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm flex items-center gap-1"
            >
              {requestsCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              {requestsCollapsed ? 'Abrir' : 'Recolher'}
            </button>
          </div>

          {loadingRequests ? (
            <p className="text-gray-400 text-sm">Carregando solicitações...</p>
          ) : pendentes.length === 0 ? (
            <p className="text-gray-400 text-sm">Nenhuma solicitação pendente</p>
          ) : requestsCollapsed ? (
            <p className="text-gray-400 text-sm mt-2">
              Card recolhido. Abra para aprovar remessas individuais ou em lote.
            </p>
          ) : (
            <div className="space-y-3 mt-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleAprovarSelecionadas}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
                >
                  Aprovar Selecionadas ({selectedPendentes.length})
                </button>
                <button
                  onClick={handleAprovarTodas}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium"
                >
                  Aprovar Todas
                </button>
              </div>

              {pendentes.map((req) => {
                // Garantir que created_at existe antes de criar a data
                const dataCriacao = req.created_at ? new Date(req.created_at) : new Date();
                // Lista de ingredientes com fallback para array vazio
                const ingredientes = req.ingredientes || [];

                return (
                  <div key={req.id} className="bg-gray-900/60 border border-gray-700 rounded-lg p-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={Boolean(selectedRequestIds[req.id])}
                          onChange={() => toggleRequestSelect(req.id)}
                          className="mt-1"
                        />
                        <div>
                          <p className="font-medium text-white">{req.receitaNome}</p>
                          <p className="text-sm text-gray-400">
                            {dataCriacao.toLocaleString('pt-BR')} • Produção: {req.quantidade || 1}x • Itens: {ingredientes.length}
                          </p>
                          <p className="text-sm text-amber-300 mt-1">
                            Excluídos da soma: {getExcludedIndexes(req.id).length}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleRequestExpand(req.id)}
                          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium"
                        >
                          {expandedRequestIds[req.id] ? 'Ocultar Itens' : 'Ver Itens'}
                        </button>
                        <button
                          onClick={() => handleAprovar(req.id)}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
                        >
                          Aprovar Isolado
                        </button>
                      </div>
                    </div>

                    {expandedRequestIds[req.id] && (
                      <div className="mt-3 border-t border-gray-700 pt-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {ingredientes.map((ing: any, index: number) => (
                            <div key={`${req.id}-${index}`} className="text-sm text-gray-300 bg-gray-800/70 rounded p-2">
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <span className="font-medium text-white">{ing.ingredientName}</span>
                                  <span> • {Number(ing.quantidade || ing.quantity || 0).toFixed(2)} {ing.unit}</span>
                                </div>
                                <label className="inline-flex items-center gap-1 text-[11px] text-amber-300">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(excludedIngredientIndexesByRequest[req.id]?.[index])}
                                    onChange={() => toggleIngredientExclude(req.id, index)}
                                  />
                                  Não somar
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50 border-b border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-400">Item</th>
                  <th className="px-4 py-3 text-left text-gray-400">Qtd</th>
                  <th className="px-4 py-3 text-left text-gray-400">Unidade</th>
                  <th className="px-4 py-3 text-left text-gray-400">Custo Total Est.</th>
                  <th className="px-4 py-3 text-left text-gray-400">Origem</th>
                  <th className="px-4 py-3 text-left text-gray-400">Fornecedor</th>
                  <th className="px-4 py-3 text-left text-gray-400">Preço Real</th>
                  <th className="px-4 py-3 text-left text-gray-400">Status</th>
                  <th className="px-4 py-3 text-center text-gray-400">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                      <Package size={32} className="mx-auto opacity-30 mb-2" />
                      Nenhum item na lista de compras
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <LinhaListaCompras
                      key={item.id}
                      item={item}
                      onSalvarFornecedor={salvarFornecedor}
                      onMarcarComprado={marcarComprado}
                      onDesmarcarComprado={desmarcarComprado}
                      onExcluir={excluir}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumo */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700 text-center">
            <p className="text-sm text-gray-400">Total de Itens</p>
            <p className="text-xl font-bold">{items.length}</p>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700 text-center">
            <p className="text-sm text-gray-400">Comprados</p>
            <p className="text-xl font-bold text-green-400">
              {items.filter(i => i.comprado).length}
            </p>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700 text-center">
            <p className="text-sm text-gray-400">Pendentes</p>
            <p className="text-xl font-bold text-yellow-400">
              {items.filter(i => !i.comprado).length}
            </p>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700 text-center">
            <p className="text-sm text-gray-400">Valor Total (pendentes)</p>
            <p className="text-xl font-bold text-blue-400">
              R$ {items.filter(i => !i.comprado).reduce((soma, i) => soma + Number(i.preco_estimado || 0), 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}