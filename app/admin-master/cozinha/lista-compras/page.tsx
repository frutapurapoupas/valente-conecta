"use client";

import { Calculator, Download } from "lucide-react";
import { useEffect, useState } from "react";

interface ItemCompra {
  nome: string;
  unidade: string;
  quantidadeNecessaria: number;
  quantidadeEstoque: number;
  quantidadeComprar: number;
}

export default function ListaComprasPage() {
  const [itensCompra, setItensCompra] = useState<ItemCompra[]>([]);
  const [totalVendas, setTotalVendas] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calcularListaCompras();
  }, []);

  const calcularListaCompras = () => {
    const receitas = JSON.parse(localStorage.getItem("cozinha_receitas") || "[]");
    const vendas = JSON.parse(localStorage.getItem("cozinha_admin_vendas") || "[]");
    const vendasUltimaSemana = vendas.filter((v: any) => new Date(v.data) > new Date(Date.now() - 7 * 86400000));
    const totalVendasPeriodo = vendasUltimaSemana.length;
    setTotalVendas(totalVendasPeriodo);

    const necessidade: Record<string, { quantidade: number; unidade: string }> = {};
    receitas.forEach((receita: any) => {
      const vezesVendido = totalVendasPeriodo || 10;
      receita.itens.forEach((item: any) => {
        const qtdNecessaria = item.quantidade * vezesVendido;
        if (!necessidade[item.nome]) necessidade[item.nome] = { quantidade: 0, unidade: item.unidade };
        necessidade[item.nome].quantidade += qtdNecessaria;
      });
    });

    const estoqueAtual: Record<string, number> = { "Frango": 5, "Quiabo": 2, "Arroz": 10, "Feijão": 8, "Creme de leite": 12, "Batata palha": 6 };
    const itens: ItemCompra[] = Object.entries(necessidade).map(([nome, dados]) => ({ nome, unidade: dados.unidade, quantidadeNecessaria: dados.quantidade, quantidadeEstoque: estoqueAtual[nome] || 0, quantidadeComprar: Math.max(0, dados.quantidade - (estoqueAtual[nome] || 0)) }));
    setItensCompra(itens);
    setLoading(false);
  };

  const totalCompras = itensCompra.reduce((acc, i) => acc + i.quantidadeComprar, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><div><h1 className="text-2xl font-bold text-gray-800">🛒 Lista de Compras</h1><p className="text-sm text-gray-500">Calculado com base nas vendas da última semana</p></div><div className="flex gap-2"><button onClick={calcularListaCompras} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"><Calculator size={16} /> Recalcular</button><button className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"><Download size={16} /> Exportar</button></div></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500"><p className="text-xs text-gray-500">Vendas (última semana)</p><p className="text-2xl font-bold text-gray-800">{totalVendas} pratos</p></div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-yellow-500"><p className="text-xs text-gray-500">Itens para comprar</p><p className="text-2xl font-bold text-gray-800">{itensCompra.length} itens</p></div>
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500"><p className="text-xs text-gray-500">Total de itens</p><p className="text-2xl font-bold text-gray-800">{totalCompras.toFixed(1)} unidades</p></div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b"><tr><th className="p-3 text-left text-xs font-semibold text-gray-600">Item</th><th className="p-3 text-left text-xs font-semibold text-gray-600">Necessário</th><th className="p-3 text-left text-xs font-semibold text-gray-600">Estoque</th><th className="p-3 text-left text-xs font-semibold text-gray-600">Comprar</th><th className="p-3 text-left text-xs font-semibold text-gray-600">Status</th></tr></thead>
            <tbody>{itensCompra.map(i => (<tr key={i.nome} className="border-b hover:bg-gray-50"><td className="p-3 font-medium text-gray-800">{i.nome}</td><td className="p-3 text-gray-600">{i.quantidadeNecessaria.toFixed(1)} {i.unidade}</td><td className="p-3 text-gray-600">{i.quantidadeEstoque.toFixed(1)} {i.unidade}</td><td className="p-3 font-bold text-orange-600">{i.quantidadeComprar.toFixed(1)} {i.unidade}</td><td className="p-3">{i.quantidadeComprar > 0 ? <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">⚠️ Comprar</span> : <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✅ Ok</span>}</td></tr>))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}