'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function BuscaPage() {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function buscar() {
      if (!query) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const url = '/api/busca?q=' + encodeURIComponent(query);
        const response = await fetch(url);
        const data = await response.json();
        setResultados(data);
      } catch (error) {
        console.error('Erro na busca:', error);
        setResultados([]);
      } finally {
        setLoading(false);
      }
    }

    buscar();
  }, [query]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Resultados da Busca</h1>
      
      {query && (
        <p className="text-gray-600 mb-4">
          Resultados para: <span className="font-semibold">{query}</span>
        </p>
      )}

      {resultados.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          {query ? 'Nenhum resultado encontrado' : 'Digite um termo para buscar'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resultados.map((item: any) => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow border border-gray-100">
              <h3 className="font-semibold text-lg">{item.nome || item.title}</h3>
              <p className="text-gray-600 text-sm">{item.descricao || item.description}</p>
              {item.preco && (
                <p className="text-blue-600 font-bold mt-2">R$ {item.preco.toFixed(2)}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

