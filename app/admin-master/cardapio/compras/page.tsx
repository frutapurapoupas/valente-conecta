// app/admin-master/cardapio/compras/page.tsx
"use client";

import {
  AlertTriangle,
  Package,
  Printer,
  ShoppingCart
} from "lucide-react";
import { useEffect, useState } from "react";

interface Ingrediente {
  id: number;
  nome: string;
  quantidade: number;
  unidade: string;
  precoMedio?: number;
}

interface Prato {
  id: number;
  nome: string;
  categoria: string;
  ingredientes: Ingrediente[];
}

interface CardapioConfig {
  dia: string;
  pratoCarneId: number | null;
  pratoFrangoId: number | null;
}

interface ItemCompra {
  ingrediente: string;
  unidade: string;
  quantidadeTotal: number;
  quantidadeEstoque: number;
  quantidadeComprar: number;
  custoEstimado: number;
}

export default function ExtratoComprasPage() {
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [configuracoes, setConfiguracoes] = useState<CardapioConfig[]>([]);
  const [previsaoVendas, setPrevisaoVendas] = useState<{ [key: string]: number }>({});
  const [estoque, setEstoque] = useState<{ [key: string]: number }>({});
  const [itensCompra, setItensCompra] = useState<ItemCompra[]>([]);
  const [showEstoqueModal, setShowEstoqueModal] = useState(false);

  const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  useEffect(() => {
    const storedPratos = localStorage.getItem("pratos_cardapio");
    if (storedPratos) {
      setPratos(JSON.parse(storedPratos));
    }

    const storedConfig = localStorage.getItem("cardapio_config");
    if (storedConfig) {
      setConfiguracoes(JSON.parse(storedConfig));
    }

    const storedPrevisao = localStorage.getItem("previsao_vendas");
    if (storedPrevisao) {
      setPrevisaoVendas(JSON.parse(storedPrevisao));
    }

    const storedEstoque = localStorage.getItem("estoque_ingredientes");
    if (storedEstoque) {
      setEstoque(JSON.parse(storedEstoque));
    }
  }, []);

  useEffect(() => {
    calcularListaCompras();
  }, [pratos, configuracoes, previsaoVendas, estoque]);

  const calcularListaCompras = () => {
    const necessidades: { [key: string]: { quantidade: number; unidade: string } } = {};

    // Para cada dia da semana
    diasSemana.forEach(dia => {
      const config = configuracoes.find(c => c.dia === dia);
      const qtdVendas = previsaoVendas[dia] || 0;

      if (qtdVendas === 0) return;

      // Prato de Carne
      if (config?.pratoCarneId) {
        const pratoCarne = pratos.find(p => p.id === config.pratoCarneId);
        if (pratoCarne) {
          pratoCarne.ingredientes.forEach(ing => {
            const totalNecessario = ing.quantidade * qtdVendas;
            if (!necessidades[ing.nome]) {
              necessidades[ing.nome] = { quantidade: totalNecessario, unidade: ing.unidade };
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
            const totalNecessario = ing.quantidade * qtdVendas;
            if (!necessidades[ing.nome]) {
              necessidades[ing.nome] = { quantidade: totalNecessario, unidade: ing.unidade };
            } else {
              necessidades[ing.nome].quantidade += totalNecessario;
            }
          });
        }
      }
    });

    // Converter para array e calcular quantidade a comprar
    const listaCompra: ItemCompra[] = Object.entries(necessidades).map(([nome, data]) => {
      const quantidadeEstoque = estoque[nome] || 0;
      const quantidadeComprar = Math.max(0, data.quantidade - quantidadeEstoque);
      return {
        ingrediente: nome,
        unidade: data.unidade,
        quantidadeTotal: data.quantidade,
        quantidadeEstoque,
        quantidadeComprar,
        custoEstimado: quantidadeComprar * 10 // Estimativa
      };
    });

    setItensCompra(listaCompra.sort((a, b) => b.quantidadeComprar - a.quantidadeComprar));
  };

  const atualizarEstoque = (ingrediente: string, valor: number) => {
    const novoEstoque = { ...estoque, [ingrediente]: valor };
    setEstoque(novoEstoque);
    localStorage.setItem("estoque_ingredientes", JSON.stringify(novoEstoque));
  };

  const totalComprar = itensCompra.reduce((sum, item) => sum + item.quantidadeComprar, 0);
  const totalEstimado = itensCompra.reduce((sum, item) => sum + item.custoEstimado, 0);

  const formatarQuantidade = (qtd: number, unidade: string) => {
    if (unidade === "kg" && qtd >= 1000) return `${(qtd / 1000).toFixed(2)} kg`;
    if (unidade === "g" && qtd >= 1000) return `${(qtd / 1000).toFixed(2)} kg`;
    if (unidade === "ml" && qtd >= 1000) return `${(qtd / 1000).toFixed(2)} L`;
    return `${qtd.toFixed(0)} ${unidade}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">📋 Extrato para Compras</h1>
            <p className="text-sm text-gray-500">
              Lista de compras baseada na previsão de vendas da semana
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEstoqueModal(true)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-600"
            >
              <Package size={18} /> Gerenciar Estoque
            </button>
            <button
              onClick={() => window.print()}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
            >
              <Printer size={18} /> Imprimir
            </button>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
            <p className="text-xs text-gray-500">Total da Semana</p>
            <p className="text-2xl font-bold text-blue-600">
              {Object.values(previsaoVendas).reduce((a, b) => a + b, 0)} marmitas
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
            <p className="text-xs text-gray-500">Ingredientes</p>
            <p className="text-2xl font-bold text-orange-600">{itensCompra.length} itens</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500">
            <p className="text-xs text-gray-500">Quantidade a Comprar</p>
            <p className="text-2xl font-bold text-red-600">{formatarQuantidade(totalComprar, "kg")}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
            <p className="text-xs text-gray-500">Custo Estimado</p>
            <p className="text-2xl font-bold text-green-600">R$ {totalEstimado.toFixed(2)}</p>
          </div>
        </div>

        {/* Tabela de Compras */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <ShoppingCart size={18} /> Lista de Compras Necessárias
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-xs font-medium text-gray-500">Ingrediente</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500">Necessário</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500">Em Estoque</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500">Comprar</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500">Custo Est.</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody>
                {itensCompra.map(item => (
                  <tr key={item.ingrediente} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{item.ingrediente}</td>
                    <td className="p-3">{formatarQuantidade(item.quantidadeTotal, item.unidade)}</td>
                    <td className="p-3">
                      <span className={item.quantidadeEstoque >= item.quantidadeTotal ? "text-green-600" : "text-red-600"}>
                        {formatarQuantidade(item.quantidadeEstoque, item.unidade)}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-orange-600">
                      {item.quantidadeComprar > 0 ? formatarQuantidade(item.quantidadeComprar, item.unidade) : "✅ Suficiente"}
                    </td>
                    <td className="p-3">R$ {(item.custoEstimado).toFixed(2)}</td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          const novaQtd = prompt(`Estoque atual de ${item.ingrediente}:`, item.quantidadeEstoque.toString());
                          if (novaQtd) atualizarEstoque(item.ingrediente, parseFloat(novaQtd));
                        }}
                        className="text-blue-500 text-sm"
                      >
                        Atualizar
                      </button>
                    </td>
                  </tr>
                ))}
                {itensCompra.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      Nenhum ingrediente necessário. Configure o cardápio e a previsão de vendas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dicas de Compra */}
        <div className="mt-6 bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={20} className="text-yellow-600" />
            <h3 className="font-semibold text-yellow-800">Dicas para Compra</h3>
          </div>
          <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
            <li>Considere comprar a granel para itens com alto consumo</li>
            <li>Verifique fornecedores locais para carnes e verduras frescas</li>
            <li>Estime uma margem de segurança de 10-15% para imprevistos</li>
            <li>Itens com <strong>"✅ Suficiente"</strong> não precisam ser comprados</li>
          </ul>
        </div>
      </div>

      {/* Modal Estoque */}
      {showEstoqueModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold">📦 Gerenciar Estoque</h3>
              <button onClick={() => setShowEstoqueModal(false)} className="text-gray-400">✕</button>
            </div>
            <div className="p-4 space-y-3">
              {itensCompra.map(item => (
                <div key={item.ingrediente} className="flex items-center justify-between p-2 border rounded-lg">
                  <span className="font-medium">{item.ingrediente}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{formatarQuantidade(item.quantidadeEstoque, item.unidade)}</span>
                    <button
                      onClick={() => {
                        const novaQtd = prompt(`Nova quantidade de ${item.ingrediente}:`, item.quantidadeEstoque.toString());
                        if (novaQtd) atualizarEstoque(item.ingrediente, parseFloat(novaQtd));
                      }}
                      className="text-blue-500 text-sm px-2 py-1 border rounded"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}