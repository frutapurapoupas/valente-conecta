'use client'
import { useState } from 'react';

export function useScanner() {
  const [lastScan, setLastScan] = useState<string | null>(null);

  const processScan = (ean: string) => {
    console.log(`Buscando EAN: ${ean} no banco de 2.000 itens...`);
    setLastScan(ean);
    // Aqui entra a lógica de busca no JSON de produtos master
  };

  return { processScan, lastScan };
}