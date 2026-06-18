@echo off
echo Criando estruturas de pastas...
mkdir services
mkdir components

echo Criando service de cozinha...
(
echo export const calcularValores = (precoVenda: number^) =^> {
echo   const insumos = precoVenda * 0.40;
echo   const chef = precoVenda * 0.30;
echo   const parceiro = precoVenda * 0.30;
echo   return {
echo     insumos: Number(insumos.toFixed(2^)^),
echo     chef: Number(chef.toFixed(2^)^),
echo     parceiro: Number(parceiro.toFixed(2^)^),
echo     total: Number((insumos + chef + parceiro^).toFixed(2^)^)
echo   };
echo };
) > services\cozinhaService.ts

echo Criando componente de simulador...
(
echo 'use client';
echo import { useState } from 'react';
echo import { calcularValores } from '../services/cozinhaService';
echo export default function PriceSimulator() {
echo   const [preco, setPreco] = useState(0^);
echo   const [resultados, setResultados] = useState(null^);
echo   const handleCalculate = () =^> { setResultados(calcularValores(preco^)^); };
echo   return (
echo     ^<div className="p-4 border rounded shadow-sm"^>
echo       ^<h3 className="font-bold mb-2"^>Simulador de Preço^</h3^>
echo       ^<input type="number" onChange={(e^) =^> setPreco(Number(e.target.value^)^) } className="border p-2 w-full mb-2" placeholder="Preço" /^>
echo       ^<button onClick={handleCalculate} className="bg-blue-500 text-white p-2 rounded"^>Calcular^</button^>
echo       {resultados ^&^& (
echo         ^<div className="mt-4"^>
echo           ^<p^>Insumos (40%%^): R$ {resultados.insumos}^</p^>
echo           ^<p^>Chef (30%%^): R$ {resultados.chef}^</p^>
echo           ^<p^>Parceiro (30%%^): R$ {resultados.parceiro}^</p^>
echo         ^</div^>
echo       )}
echo     ^</div^>
echo   ^);
echo }
) > components\PriceSimulator.tsx

echo Fazendo commit da reconstrucao...
git add .
git commit -m "feat: reconstrucao automatizada do modulo cozinha"

echo Pronto! O sistema esta no ponto.
pause