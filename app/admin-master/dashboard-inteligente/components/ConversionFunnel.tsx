"use client";

import { Award, CreditCard, Eye, UserCheck } from "lucide-react";

export default function ConversionFunnel() {
  const etapas = [
    { nome: "Visitantes", valor: 1250, icone: Eye, cor: "bg-blue-500" },
    { nome: "Cadastros", valor: 320, icone: UserCheck, cor: "bg-green-500" },
    { nome: "Assinaturas", valor: 89, icone: CreditCard, cor: "bg-purple-500" },
    { nome: "Indicações", valor: 45, icone: Award, cor: "bg-orange-500" }
  ];

  const maxValor = Math.max(...etapas.map(e => e.valor));

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">?? Funil de Conversão</h3>
      <div className="space-y-4">
        {etapas.map((etapa, idx) => {
          const Icon = etapa.icone;
          const percentual = (etapa.valor / maxValor) * 100;
          return (
            <div key={etapa.nome}>
              <div className="flex items-center justify-between text-sm mb-1">
                <div className="flex items-center gap-2">
                  <div className={`${etapa.cor} p-1 rounded-full text-white`}>
                    <Icon size={12} />
                  </div>
                  <span className="font-medium">{etapa.nome}</span>
                </div>
                <span className="font-semibold">{etapa.valor}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`${etapa.cor} h-2 rounded-full`} style={{ width: `${percentual}%` }}></div>
              </div>
              {idx < etapas.length - 1 && (
                <div className="text-center text-[10px] text-gray-400 mt-1">
                  ? taxa de conversão: {idx === 0 ? "25.6%" : idx === 1 ? "27.8%" : "50.6%"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

