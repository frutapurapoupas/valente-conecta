// app/admin-master/cardapio/extrato-compras/page.tsx
"use client";

import {
  Calendar,
  FileText, Filter,
  Printer
} from "lucide-react";
import { useEffect, useState } from "react";

interface Ingrediente {
  id: number;
  nome: string;
  quantidade: number;
  unidade: string;
  custoUnitario: number;
}

interface Prato {
  id: number;
  nome: string;
  ingredientes: Ingrediente[];
  precoVenda: number;
}

interface Pedido {
  id: number;
  numero: string;
  itens: { nome: string; quantidade: number; tipo: string }[];
  data: string;
  tipo: string;
}

interface ItemExtrato {
  ingrediente: string;
  unidade: string;
  quantidadeTotal: number;
  custoUnitario: number;
  custoTotal: number;
}

export default function ExtratoComprasPage() {
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [dataInicio, setDataInicio] = useState(new Date(new Date().setDate(1)).toISOString().split("T")[0]);
  const [dataFim, setDataFim] = useState(new Date().toISOString().split("T")[0]);
  const [extrato, setExtrato] = useState<ItemExtrato[]>([]);
  const [totalGeral, setTotalGeral] = useState(0);
  const [gerandoPDF, setGerandoPDF] = useState(false);

  useEffect(() => {
    // Carregar pratos
    const storedPratos = localStorage.getItem("pratos_cardapio_completo");
    if (storedPratos) {
      setPratos(JSON.parse(storedPratos));
    }

    // Carregar pedidos
    const storedPedidos = localStorage.getItem("pedidos_cozinha");
    if (storedPedidos) {
      setPedidos(JSON.parse(storedPedidos));
    }
  }, []);

  useEffect(() => {
    calcularExtrato();
  }, [dataInicio, dataFim, pratos, pedidos]);

  const calcularExtrato = () => {
    // Filtrar pedidos por período
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    fim.setHours(23, 59, 59);

    const pedidosFiltrados = pedidos.filter(pedido => {
      const dataPedido = new Date(pedido.data.split('/').reverse().join('-'));
      return dataPedido >= inicio && dataPedido <= fim;
    });

    // Contar quantidades de cada prato
    const contagemPratos: { [key: string]: number } = {};
    pedidosFiltrados.forEach(pedido => {
      pedido.itens.forEach(item => {
        const nomePrato = item.nome;
        contagemPratos[nomePrato] = (contagemPratos[nomePrato] || 0) + item.quantidade;
      });
    });

    // Calcular necessidade de ingredientes
    const necessidadeIngredientes: { [key: string]: { quantidade: number; unidade: string; custoUnitario: number } } = {};

    Object.entries(contagemPratos).forEach(([nomePrato, quantidade]) => {
      const prato = pratos.find(p => p.nome === nomePrato);
      if (prato) {
        prato.ingredientes.forEach(ing => {
          const quantidadeTotal = (ing.quantidade / 1000) * quantidade; // Converter para kg
          if (!necessidadeIngredientes[ing.nome]) {
            necessidadeIngredientes[ing.nome] = {
              quantidade: quantidadeTotal,
              unidade: "kg",
              custoUnitario: ing.custoUnitario
            };
          } else {
            necessidadeIngredientes[ing.nome].quantidade += quantidadeTotal;
          }
        });
      }
    });

    // Converter para array
    const extratoArray: ItemExtrato[] = Object.entries(necessidadeIngredientes).map(([nome, data]) => ({
      ingrediente: nome,
      unidade: data.unidade,
      quantidadeTotal: data.quantidade,
      custoUnitario: data.custoUnitario,
      custoTotal: data.quantidade * data.custoUnitario
    }));

    setExtrato(extratoArray.sort((a, b) => b.custoTotal - a.custoTotal));
    setTotalGeral(extratoArray.reduce((sum, item) => sum + item.custoTotal, 0));
  };

  const gerarPDF = () => {
    setGerandoPDF(true);

    // Criar conteúdo HTML para impressão
    const conteudo = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Extrato de Compras - Valente Conecta</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #ea580c; text-align: center; }
          .header { text-align: center; margin-bottom: 30px; }
          .periodo { text-align: center; color: #666; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f97316; color: white; }
          .total { margin-top: 30px; text-align: right; font-size: 18px; font-weight: bold; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ðŸ½ï¸ Valente Conecta</h1>
          <h2>Extrato de Compras</h2>
        </div>
        <div class="periodo">
          Período: ${new Date(dataInicio).toLocaleDateString()} a ${new Date(dataFim).toLocaleDateString()}
        </div>
        <table>
          <thead>
            <tr>
              <th>Ingrediente</th>
              <th>Quantidade</th>
              <th>Unidade</th>
              <th>Custo Unitário</th>
              <th>Custo Total</th>
             </tr>
          </thead>
          <tbody>
            ${extrato.map(item => `
              <tr>
                <td>${item.ingrediente}</td>
                <td>${item.quantidadeTotal.toFixed(2)}</td>
                <td>${item.unidade}</td>
                <td>R$ ${item.custoUnitario.toFixed(2)}</td>
                <td>R$ ${item.custoTotal.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">
          Total de Compras: R$ ${totalGeral.toFixed(2)}
        </div>
        <div class="footer">
          Relatório gerado em ${new Date().toLocaleString()}
        </div>
      </body>
      </html>
    `;

    const janela = window.open();
    janela?.document.write(conteudo);
    janela?.document.close();
    janela?.print();

    setGerandoPDF(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">ðŸ“Š Extrato de Compras</h1>
            <p className="text-sm text-gray-500">Lista de compras baseada nos pedidos do período</p>
          </div>
          <div className="flex gap-2">
            <button onClick={gerarPDF} disabled={gerandoPDF} className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600">
              <FileText size={18} /> {gerandoPDF ? "Gerando..." : "Gerar PDF"}
            </button>
            <button onClick={() => window.print()} className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Printer size={18} /> Imprimir
            </button>
          </div>
        </div>

        {/* Filtro de Período */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-gray-400" />
              <span className="text-sm font-medium">Período:</span>
            </div>
            <div>
              <label className="text-xs text-gray-500 block">Data Início</label>
              <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="p-2 border rounded-lg" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block">Data Fim</label>
              <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="p-2 border rounded-lg" />
            </div>
            <button onClick={calcularExtrato} className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Filter size={16} /> Filtrar
            </button>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
            <p className="text-xs text-gray-500">Total de Ingredientes</p>
            <p className="text-2xl font-bold text-gray-800">{extrato.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
            <p className="text-xs text-gray-500">Quantidade Total</p>
            <p className="text-2xl font-bold text-blue-600">{extrato.reduce((sum, i) => sum + i.quantidadeTotal, 0).toFixed(2)} kg</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
            <p className="text-xs text-gray-500">Custo Total</p>
            <p className="text-2xl font-bold text-green-600">R$ {totalGeral.toFixed(2)}</p>
          </div>
        </div>

        {/* Tabela de Extrato */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-orange-50 border-b">
                <tr>
                  <th className="p-3 text-left text-xs font-medium text-gray-700">Ingrediente</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-700">Quantidade</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-700">Unidade</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-700">Custo Unitário</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-700">Custo Total</th>
                </tr>
              </thead>
              <tbody>
                {extrato.map(item => (
                  <tr key={item.ingrediente} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{item.ingrediente}</td>
                    <td className="p-3">{item.quantidadeTotal.toFixed(2)}</td>
                    <td className="p-3">{item.unidade}</td>
                    <td className="p-3">R$ {item.custoUnitario.toFixed(2)}</td>
                    <td className="p-3 font-bold text-green-600">R$ {item.custoTotal.toFixed(2)}</td>
                  </tr>
                ))}
                {extrato.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      Nenhum dado encontrado no período selecionado
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50 border-t">
                <tr>
                  <td colSpan={4} className="p-3 text-right font-bold">Total Geral:</td>
                  <td className="p-3 font-bold text-green-600">R$ {totalGeral.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

