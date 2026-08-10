// app/admin-master/cardapio/lista-compras/page.tsx
"use client";

import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Download,
  Package,
  Plus,
  Printer,
  Scale,
  ShoppingCart,
  Trash2,
  Truck,
  X
} from "lucide-react";
import { useEffect, useState } from "react";

interface Ingrediente {
  id: number;
  nome: string;
  quantidade: number;
  unidade: "kg" | "g" | "l" | "ml" | "unidade" | "colher" | "xicara";
  precoMedio?: number;
}

interface Prato {
  id: number;
  nome: string;
  categoria: string;
  ingredientes: Ingrediente[];
  precoVenda: number;
}

interface CardapioConfig {
  dia: string;
  pratoCarneId: number | null;
  pratoFrangoId: number | null;
}

interface PrevisaoVendas {
  [key: string]: number;
}

interface EstoqueIngrediente {
  nome: string;
  quantidade: number;
  unidade: string;
  ultimaAtualizacao: string;
}

interface ItemListaCompra {
  ingrediente: string;
  unidade: string;
  quantidadeNecessaria: number;
  quantidadeEstoque: number;
  quantidadeComprar: number;
  custoEstimado: number;
  fornecedor?: string;
  categoria?: string;
}

interface Fornecedor {
  id: number;
  nome: string;
  contato: string;
  produtos: string[];
}

export default function ListaComprasPage() {
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [configuracoes, setConfiguracoes] = useState<CardapioConfig[]>([]);
  const [previsaoVendas, setPrevisaoVendas] = useState<PrevisaoVendas>({});
  const [estoque, setEstoque] = useState<EstoqueIngrediente[]>([]);
  const [itensCompra, setItensCompra] = useState<ItemListaCompra[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [showFornecedorModal, setShowFornecedorModal] = useState(false);
  const [showEstoqueModal, setShowEstoqueModal] = useState(false);
  const [periodoSelecionado, setPeriodoSelecionado] = useState<"semana" | "quinzena" | "mes">("semana");
  const [margemSeguranca, setMargemSeguranca] = useState<number>(15); // Percentual de margem
  const [carregando, setCarregando] = useState(true);
  const [editandoFornecedor, setEditandoFornecedor] = useState<Fornecedor | null>(null);
  const [novoFornecedor, setNovoFornecedor] = useState({ nome: "", contato: "", produtos: [] as string[] });

  const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (pratos.length && configuracoes.length && Object.keys(previsaoVendas).length) {
      calcularListaCompras();
    }
  }, [pratos, configuracoes, previsaoVendas, estoque, periodoSelecionado, margemSeguranca]);

  const carregarDados = () => {
    // Carregar pratos
    const storedPratos = localStorage.getItem("pratos_cardapio");
    if (storedPratos) {
      setPratos(JSON.parse(storedPratos));
    }

    // Carregar configurações do cardápio
    const storedConfig = localStorage.getItem("cardapio_config");
    if (storedConfig) {
      setConfiguracoes(JSON.parse(storedConfig));
    }

    // Carregar previsão de vendas
    const storedPrevisao = localStorage.getItem("previsao_vendas");
    if (storedPrevisao) {
      setPrevisaoVendas(JSON.parse(storedPrevisao));
    } else {
      const previsaoInicial: PrevisaoVendas = {};
      diasSemana.forEach(dia => { previsaoInicial[dia] = 20; });
      setPrevisaoVendas(previsaoInicial);
    }

    // Carregar estoque
    const storedEstoque = localStorage.getItem("estoque_ingredientes");
    if (storedEstoque) {
      setEstoque(JSON.parse(storedEstoque));
    } else {
      // Estoque inicial vazio
      setEstoque([]);
    }

    // Carregar fornecedores
    const storedFornecedores = localStorage.getItem("fornecedores");
    if (storedFornecedores) {
      setFornecedores(JSON.parse(storedFornecedores));
    } else {
      const fornecedoresIniciais: Fornecedor[] = [
        { id: 1, nome: "Açougue do Zé", contato: "(75) 99999-1111", produtos: ["Carne", "Frango", "Carne moída"] },
        { id: 2, nome: "Mercearia do João", contato: "(75) 99999-2222", produtos: ["Arroz", "Feijão", "Farinha", "Açúcar"] },
        { id: 3, nome: "Hortifruti da Ana", contato: "(75) 99999-3333", produtos: ["Cenoura", "Brócolis", "Tomate", "Cebola"] },
        { id: 4, nome: "Laticínios São José", contato: "(75) 99999-4444", produtos: ["Leite", "Queijo", "Creme de leite"] }
      ];
      setFornecedores(fornecedoresIniciais);
      localStorage.setItem("fornecedores", JSON.stringify(fornecedoresIniciais));
    }

    setCarregando(false);
  };

  const calcularMultiplicadorPeriodo = () => {
    switch (periodoSelecionado) {
      case "semana": return 1;
      case "quinzena": return 2;
      case "mes": return 4;
      default: return 1;
    }
  };

  const calcularListaCompras = () => {
    const multiplicador = calcularMultiplicadorPeriodo();
    const necessidades: { [key: string]: { quantidade: number; unidade: string; categoria?: string } } = {};

    // Para cada dia da semana
    diasSemana.forEach(dia => {
      const config = configuracoes.find(c => c.dia === dia);
      let qtdVendas = previsaoVendas[dia] || 0;
      qtdVendas = qtdVendas * multiplicador; // Multiplicar pelo período

      if (qtdVendas === 0) return;

      // Prato de Carne
      if (config?.pratoCarneId) {
        const pratoCarne = pratos.find(p => p.id === config.pratoCarneId);
        if (pratoCarne) {
          pratoCarne.ingredientes.forEach(ing => {
            const totalNecessario = (ing.quantidade / 1000) * qtdVendas; // Converter para kg quando necessário
            if (!necessidades[ing.nome]) {
              necessidades[ing.nome] = {
                quantidade: totalNecessario,
                unidade: ing.unidade,
                categoria: pratoCarne.categoria
              };
            } else {
              necessidades[ing.nome].quantidade += totalNecessario;
            }
          });
        }
      }

      // Prato de Frango
      if (config?.pratoFrangoId) {
        const pratoFrango = pratos.find(p => p.id === config.pratoFrangoId);
        if (pratoFrango) {
          pratoFrango.ingredientes.forEach(ing => {
            const totalNecessario = (ing.quantidade / 1000) * qtdVendas;
            if (!necessidades[ing.nome]) {
              necessidades[ing.nome] = {
                quantidade: totalNecessario,
                unidade: ing.unidade,
                categoria: pratoFrango.categoria
              };
            } else {
              necessidades[ing.nome].quantidade += totalNecessario;
            }
          });
        }
      }
    });

    // Aplicar margem de segurança
    Object.keys(necessidades).forEach(key => {
      necessidades[key].quantidade *= (1 + margemSeguranca / 100);
    });

    // Converter para array e calcular quantidade a comprar
    const listaCompra: ItemListaCompra[] = Object.entries(necessidades).map(([nome, data]) => {
      const estoqueItem = estoque.find(e => e.nome === nome);
      const quantidadeEstoque = estoqueItem?.quantidade || 0;
      let quantidadeNecessaria = data.quantidade;

      // Ajustar unidades
      if (data.unidade === "g") quantidadeNecessaria = quantidadeNecessaria / 1000;

      let quantidadeComprar = Math.max(0, quantidadeNecessaria - quantidadeEstoque);

      // Encontrar fornecedor sugerido
      const fornecedor = fornecedores.find(f =>
        f.produtos.some(p => nome.toLowerCase().includes(p.toLowerCase()))
      );

      return {
        ingrediente: nome,
        unidade: data.unidade === "g" ? "kg" : data.unidade,
        quantidadeNecessaria: quantidadeNecessaria,
        quantidadeEstoque: quantidadeEstoque,
        quantidadeComprar: quantidadeComprar,
        custoEstimado: quantidadeComprar * 15, // Valor estimado por kg
        fornecedor: fornecedor?.nome,
        categoria: data.categoria
      };
    });

    // Ordenar por quantidade a comprar (maior primeiro)
    setItensCompra(listaCompra.sort((a, b) => b.quantidadeComprar - a.quantidadeComprar));
  };

  const atualizarEstoque = (ingrediente: string, quantidade: number) => {
    const novoEstoque = [...estoque];
    const index = novoEstoque.findIndex(e => e.nome === ingrediente);

    if (index >= 0) {
      novoEstoque[index] = {
        ...novoEstoque[index],
        quantidade: quantidade,
        ultimaAtualizacao: new Date().toLocaleString()
      };
    } else {
      novoEstoque.push({
        nome: ingrediente,
        quantidade: quantidade,
        unidade: "kg",
        ultimaAtualizacao: new Date().toLocaleString()
      });
    }

    setEstoque(novoEstoque);
    localStorage.setItem("estoque_ingredientes", JSON.stringify(novoEstoque));
  };

  const adicionarFornecedor = () => {
    if (novoFornecedor.nome && novoFornecedor.contato) {
      const novo: Fornecedor = {
        id: Date.now(),
        nome: novoFornecedor.nome,
        contato: novoFornecedor.contato,
        produtos: novoFornecedor.produtos
      };
      const novosFornecedores = [...fornecedores, novo];
      setFornecedores(novosFornecedores);
      localStorage.setItem("fornecedores", JSON.stringify(novosFornecedores));
      setNovoFornecedor({ nome: "", contato: "", produtos: [] });
      setShowFornecedorModal(false);
    }
  };

  const removerFornecedor = (id: number) => {
    const novosFornecedores = fornecedores.filter(f => f.id !== id);
    setFornecedores(novosFornecedores);
    localStorage.setItem("fornecedores", JSON.stringify(novosFornecedores));
  };

  const totalComprar = itensCompra.reduce((sum, item) => sum + item.quantidadeComprar, 0);
  const totalEstimado = itensCompra.reduce((sum, item) => sum + item.custoEstimado, 0);
  const totalNecessario = itensCompra.reduce((sum, item) => sum + item.quantidadeNecessaria, 0);
  const totalEstoque = itensCompra.reduce((sum, item) => sum + item.quantidadeEstoque, 0);

  const formatarQuantidade = (qtd: number, unidade: string) => {
    if (unidade === "kg" && qtd < 1) return `${(qtd * 1000).toFixed(0)} g`;
    if (unidade === "kg") return `${qtd.toFixed(2)} kg`;
    if (unidade === "unidade") return `${Math.round(qtd)} un`;
    return `${qtd.toFixed(2)} ${unidade}`;
  };

  const gerarRelatorioCSV = () => {
    const headers = ["Ingrediente", "Necessário", "Unidade", "Estoque", "Comprar", "Custo Estimado", "Fornecedor"];
    const rows = itensCompra.filter(i => i.quantidadeComprar > 0).map(i => [
      i.ingrediente,
      formatarQuantidade(i.quantidadeNecessaria, i.unidade),
      i.unidade,
      formatarQuantidade(i.quantidadeEstoque, i.unidade),
      formatarQuantidade(i.quantidadeComprar, i.unidade),
      `R$ ${i.custoEstimado.toFixed(2)}`,
      i.fornecedor || "-"
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lista_compras_${new Date().toLocaleDateString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">📋 Lista de Compras Inteligente</h1>
            <p className="text-sm text-gray-500">
              Baseado no cardápio configurado e previsão de vendas
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEstoqueModal(true)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-600"
            >
              <Package size={18} /> Estoque
            </button>
            <button
              onClick={() => setShowFornecedorModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
            >
              <Truck size={18} /> Fornecedores
            </button>
            <button
              onClick={gerarRelatorioCSV}
              className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600"
            >
              <Download size={18} /> Exportar CSV
            </button>
            <button
              onClick={() => window.print()}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-600"
            >
              <Printer size={18} /> Imprimir
            </button>
          </div>
        </div>

        {/* Configurações */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <label className="text-sm text-gray-600 flex items-center gap-2 mb-2">
              <Calendar size={16} /> Período de Compra
            </label>
            <select
              value={periodoSelecionado}
              onChange={(e) => setPeriodoSelecionado(e.target.value as any)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="semana">Semanal (1x)</option>
              <option value="quinzena">Quinzenal (2x)</option>
              <option value="mes">Mensal (4x)</option>
            </select>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <label className="text-sm text-gray-600 flex items-center gap-2 mb-2">
              <AlertTriangle size={16} /> Margem de Segurança
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="30"
                value={margemSeguranca}
                onChange={(e) => setMargemSeguranca(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="w-12 text-right font-medium">{margemSeguranca}%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Margem extra para imprevistos</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <label className="text-sm text-gray-600 flex items-center gap-2 mb-2">
              <ShoppingCart size={16} /> Resumo da Compra
            </label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-400">Necessário</p>
                <p className="font-bold text-blue-600">{formatarQuantidade(totalNecessario, "kg")}</p>
              </div>
              <div>
                <p className="text-gray-400">Em Estoque</p>
                <p className="font-bold text-green-600">{formatarQuantidade(totalEstoque, "kg")}</p>
              </div>
              <div>
                <p className="text-gray-400">Comprar</p>
                <p className="font-bold text-orange-600">{formatarQuantidade(totalComprar, "kg")}</p>
              </div>
              <div>
                <p className="text-gray-400">Custo</p>
                <p className="font-bold text-purple-600">R$ {totalEstimado.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Compras */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <ShoppingCart size={18} /> Itens para Compra
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 text-left text-xs font-medium text-gray-500">Ingrediente</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500">Necessário</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500">Em Estoque</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500">Comprar</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500">Custo Est.</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500">Fornecedor</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {itensCompra.map(item => {
                  const percentualEstoque = (item.quantidadeEstoque / item.quantidadeNecessaria) * 100;
                  const statusCor = item.quantidadeComprar === 0 ? "green" :
                    item.quantidadeComprar < item.quantidadeNecessaria * 0.3 ? "yellow" : "red";

                  return (
                    <tr key={item.ingrediente} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">
                        <div className="flex items-center gap-2">
                          <Scale size={14} className="text-gray-400" />
                          {item.ingrediente}
                        </div>
                      </td>
                      <td className="p-3">{formatarQuantidade(item.quantidadeNecessaria, item.unidade)}</td>
                      <td className="p-3">{formatarQuantidade(item.quantidadeEstoque, item.unidade)}</td>
                      <td className="p-3">
                        <div className="w-24">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${percentualEstoque >= 100 ? "bg-green-500" : percentualEstoque >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                              style={{ width: `${Math.min(100, percentualEstoque)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{Math.round(percentualEstoque)}%</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`font-bold ${item.quantidadeComprar === 0 ? "text-green-600" : "text-orange-600"
                          }`}>
                          {item.quantidadeComprar === 0 ? "✅ Suficiente" : formatarQuantidade(item.quantidadeComprar, item.unidade)}
                        </span>
                      </td>
                      <td className="p-3">R$ {item.custoEstimado.toFixed(2)}</td>
                      <td className="p-3">
                        {item.fornecedor ? (
                          <span className="text-sm text-blue-600">{item.fornecedor}</span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            const novaQtd = prompt(`Estoque atual de ${item.ingrediente} (${item.unidade}):`, item.quantidadeEstoque.toString());
                            if (novaQtd) atualizarEstoque(item.ingrediente, parseFloat(novaQtd));
                          }}
                          className="text-blue-500 text-sm hover:underline"
                        >
                          Atualizar
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {itensCompra.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      Nenhum ingrediente necessário. Configure o cardápio e a previsão de vendas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Seção de Sugestões */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={20} className="text-green-600" />
              <h3 className="font-semibold text-green-800">Itens Suficientes</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {itensCompra.filter(i => i.quantidadeComprar === 0).map(i => (
                <span key={i.ingrediente} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  {i.ingrediente}
                </span>
              ))}
              {itensCompra.filter(i => i.quantidadeComprar === 0).length === 0 && (
                <p className="text-sm text-green-600">Nenhum item com estoque suficiente</p>
              )}
            </div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={20} className="text-yellow-600" />
              <h3 className="font-semibold text-yellow-800">Prioridade de Compra</h3>
            </div>
            <div className="space-y-1">
              {itensCompra.filter(i => i.quantidadeComprar > 0).slice(0, 5).map(i => (
                <div key={i.ingrediente} className="flex justify-between text-sm">
                  <span>{i.ingrediente}</span>
                  <span className="font-medium text-orange-600">{formatarQuantidade(i.quantidadeComprar, i.unidade)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Estoque */}
      {showEstoqueModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Package size={20} /> Gerenciar Estoque
              </h3>
              <button onClick={() => setShowEstoqueModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 text-left text-xs font-medium">Ingrediente</th>
                    <th className="p-2 text-left text-xs font-medium">Estoque</th>
                    <th className="p-2 text-left text-xs font-medium">Unidade</th>
                    <th className="p-2 text-left text-xs font-medium">Última Atualização</th>
                    <th className="p-2 text-left text-xs font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {itensCompra.map(item => (
                    <tr key={item.ingrediente} className="border-b">
                      <td className="p-2 text-sm">{item.ingrediente}</td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.1"
                          value={item.quantidadeEstoque}
                          onChange={(e) => atualizarEstoque(item.ingrediente, parseFloat(e.target.value))}
                          className="w-24 p-1 border rounded"
                        />
                      </td>
                      <td className="p-2 text-sm">{item.unidade}</td>
                      <td className="p-2 text-xs text-gray-400">
                        {estoque.find(e => e.nome === item.ingrediente)?.ultimaAtualizacao || "-"}
                      </td>
                      <td className="p-2">
                        <button
                          onClick={() => atualizarEstoque(item.ingrediente, 0)}
                          className="text-red-500 text-xs"
                        >
                          Zerar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t">
              <button
                onClick={() => setShowEstoqueModal(false)}
                className="w-full bg-blue-500 text-white py-2 rounded-lg"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Fornecedores */}
      {showFornecedorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Truck size={20} /> Fornecedores
              </h3>
              <button onClick={() => setShowFornecedorModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {fornecedores.map(f => (
                <div key={f.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{f.nome}</h4>
                      <p className="text-sm text-gray-500">{f.contato}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {f.produtos.map(p => (
                          <span key={p} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{p}</span>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => removerFornecedor(f.id)} className="text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="border rounded-lg p-3">
                <input
                  type="text"
                  placeholder="Nome do fornecedor"
                  value={novoFornecedor.nome}
                  onChange={(e) => setNovoFornecedor({ ...novoFornecedor, nome: e.target.value })}
                  className="w-full p-2 border rounded-lg mb-2"
                />
                <input
                  type="text"
                  placeholder="Contato (telefone/email)"
                  value={novoFornecedor.contato}
                  onChange={(e) => setNovoFornecedor({ ...novoFornecedor, contato: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
                <button
                  onClick={adicionarFornecedor}
                  className="mt-2 w-full bg-green-500 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Adicionar Fornecedor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

