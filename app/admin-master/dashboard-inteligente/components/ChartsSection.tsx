"use client";

import { PieChart } from "lucide-react";

interface Categoria {
  nome: string;
  count: number;
}

export default function ChartsSection({ categorias }: { categorias: Categoria[] }) {
  const total = categorias.reduce((acc, cat) => acc + cat.count, 0);
  const cores = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"];

  if (total === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <PieChart size={18} className="text-indigo-600" />
          Demanda por Categoria
        </h3>
        <p className="text-center text-gray-400 py-8">Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <PieChart size={18} className="text-indigo-600" />
        Demanda por Categoria
      </h3>
      <div className="space-y-3">
        {categorias.map((cat, index) => {
          const percentual = (cat.count / total) * 100;
          const cor = cores[index % cores.length];
          return (
            <div key={cat.nome}>
              <div className="flex justify-between text-sm mb-1">
                <span>{cat.nome}</span>
                <span className="text-gray-500">{percentual.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`${cor} h-2 rounded-full transition-all`} style={{ width: `${percentual}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

