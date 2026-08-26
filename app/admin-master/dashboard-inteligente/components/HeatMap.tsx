"use client";

import { Building, MapPin, Users } from "lucide-react";

interface Cidade {
  nome: string;
  usuarios: number;
  empresas: number;
}

export default function HeatMap({ cidades }: { cidades: Cidade[] }) {
  if (!cidades || cidades.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <MapPin size={18} className="text-indigo-600" />
          Mapa de Calor por Cidade
        </h3>
        <p className="text-center text-gray-400 py-8">Nenhuma cidade com dados ainda</p>
      </div>
    );
  }

  const maxUsuarios = Math.max(...cidades.map(c => c.usuarios), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <MapPin size={18} className="text-indigo-600" />
          Mapa de Calor por Cidade
        </h3>
        <span className="text-sm text-gray-500">Mais ativas primeiro</span>
      </div>
      <div className="space-y-3">
        {cidades.map((cidade) => {
          const intensidade = Math.min(100, Math.round((cidade.usuarios / maxUsuarios) * 100));
          const cor = intensidade > 70 ? "bg-red-500" : intensidade > 40 ? "bg-orange-500" : "bg-yellow-500";
          return (
            <div key={cidade.nome}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{cidade.nome}</span>
                <span className="text-gray-500 flex items-center gap-2">
                  <Users size={12} /> {cidade.usuarios}
                  <Building size={12} className="ml-1" /> {cidade.empresas}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`${cor} h-2 rounded-full transition-all`} style={{ width: `${intensidade}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

