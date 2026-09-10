'use client';

// Caminho: C:\valente_conecta\app\admin-master\pdv-catalogo\buscar\page.tsx
//
// Conferência do catálogo colaborativo do PDV (Open Food Facts, Bluesoft
// Cosmos, cadastro manual) — busca por nome, EAN ou SKU, mostrando foto.
// Só leitura, feita pra fase de testes: não existia nenhuma tela pra
// simplesmente OLHAR o que já foi importado.

import { useEffect, useState, useCallback } from 'react';
import { Search, PackageSearch, ImageOff } from 'lucide-react';

interface Produto {
  id: string;
  ean: string | null;
  sku: string;
  nome: string;
  segmento: string;
  categoria: string | null;
  foto_url: string | null;
  created_at: string;
}

export default function BuscarCatalogoPage() {
  const [termo, setTermo] = useState('');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);

  const buscar = useCallback(async (q: string) => {
    setCarregando(true);
    const resp = await fetch(`/api/admin-master/pdv-catalogo/buscar?q=${encodeURIComponent(q)}`);
    const d = await resp.json();
    if (d.success) { setProdutos(d.data); setTotal(d.total); }
    setCarregando(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => buscar(termo), 350);
    return () => clearTimeout(t);
  }, [termo, buscar]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2"><PackageSearch size={22} />Catálogo colaborativo do PDV</h1>
      <p className="text-gray-500 mb-6">Confira o que já foi importado — busque por nome, EAN ou SKU. {total !== null && !termo && `${total.toLocaleString('pt-BR')} produtos no total.`}</p>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Ex: nescau, ou 7891000412855"
          className="w-full border rounded-xl pl-10 pr-4 py-3 text-sm"
          autoFocus
        />
      </div>

      {carregando ? (
        <p className="text-center text-gray-400 py-10">Buscando...</p>
      ) : produtos.length === 0 ? (
        <p className="text-center text-gray-400 py-10">Nenhum produto encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {produtos.map((p) => (
            <div key={p.id} className="bg-white border rounded-2xl p-3 flex gap-3">
              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                {p.foto_url ? (
                  <img src={p.foto_url} alt={p.nome} className="w-full h-full object-cover" />
                ) : (
                  <ImageOff size={22} className="text-gray-300" />
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{p.nome}</p>
                <p className="text-sm text-gray-500 mt-1">EAN: {p.ean || '—'}</p>
                <p className="text-sm text-gray-400">SKU: {p.sku}</p>
                <span className="inline-block mt-1 text-sm bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{p.segmento}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
