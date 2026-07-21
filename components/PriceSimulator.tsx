'use client';
import { useState } from 'react';
import { calcularValores } from '../services/cozinhaService';

export default function PriceSimulator() {
  const [preco, setPreco] = useState(0);
  const [resultados, setResultados] = useState(null as any);

  const handleCalculate = () => {
    setResultados(calcularValores(preco));
  };

  return (
    <div className="p-4 border rounded shadow-sm">
      <h3 className="font-bold mb-2">Simulador de Preço</h3>
      <input 
        type="number" 
        onChange={(e) => setPreco(Number(e.target.value))} 
        className="border p-2 w-full mb-2" 
        placeholder="Preço" 
      />
      <button onClick={handleCalculate} className="bg-blue-500 text-white p-2 rounded">
        Calcular
      </button>
      {resultados && (
        <div className="mt-4">
          <p>Insumos (40%): R$ {resultados.insumos}</p>
          <p>Chef (30%): R$ {resultados.chef}</p>
          <p>Parceiro (30%): R$ {resultados.parceiro}</p>
        </div>
      )}
    </div>
  );
}

