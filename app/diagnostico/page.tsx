"use client";

import { useState, useEffect } from "react";

// Adicionado para desabilitar renderização estática
export const dynamic = 'force-dynamic';

export default function DiagnosticoPage() {
  const [dados, setDados] = useState<any>({});

  useEffect(() => {
    const perfilIA = localStorage.getItem('academia_perfil_ia');
    const perfilInicial = localStorage.getItem('academia_perfil_inicial');
    const academiaLocal = localStorage.getItem('academia_local_dados');
    const esportes = localStorage.getItem('academia_esportes');
    
    setDados({
      perfilIA: perfilIA ? JSON.parse(perfilIA) : null,
      perfilInicial: perfilInicial ? JSON.parse(perfilInicial) : null,
      academiaLocal: academiaLocal ? JSON.parse(academiaLocal) : null,
      esportes: esportes ? JSON.parse(esportes) : null
    });
  }, []);

  const calcularIMC = (peso: number, alturaCm: number) => {
    const alturaM = alturaCm / 100;
    return (peso / (alturaM * alturaM)).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">🔍 Diagnóstico do Sistema</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-2xl p-4">
          <h2 className="text-lg font-bold text-yellow-400 mb-3">📊 Perfil IA</h2>
          {dados.perfilIA ? (
            <pre className="text-xs text-gray-300 overflow-auto">
              {JSON.stringify(dados.perfilIA, null, 2)}
            </pre>
          ) : <p className="text-gray-500">Não encontrado</p>}
        </div>

        <div className="bg-gray-800 rounded-2xl p-4">
          <h2 className="text-lg font-bold text-yellow-400 mb-3">📝 Perfil Inicial</h2>
          {dados.perfilInicial ? (
            <pre className="text-xs text-gray-300 overflow-auto">
              {JSON.stringify(dados.perfilInicial, null, 2)}
            </pre>
          ) : <p className="text-gray-500">Não encontrado</p>}
        </div>

        <div className="bg-gray-800 rounded-2xl p-4">
          <h2 className="text-lg font-bold text-green-400 mb-3">✅ Cálculo do IMC Correto</h2>
          {dados.perfilIA && (
            <div className="space-y-2">
              <p>Peso: {dados.perfilIA.peso_atual} kg</p>
              <p>Altura em cm: {dados.perfilIA.altura} cm</p>
              <p>Altura em metros: {(dados.perfilIA.altura / 100).toFixed(2)} m</p>
              <p className="font-bold text-yellow-400">IMC: {calcularIMC(dados.perfilIA.peso_atual, dados.perfilIA.altura)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}