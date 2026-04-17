// app/explorar/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Store, Package, Globe, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { SmartSearchBar } from '@/components/ui/SmartSearchBar';

interface SearchResult {
  id: string;
  name: string;
  type: 'local' | 'catalog' | 'web';
  description: string;
  image?: string;
  location?: string;
  relevance: number;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'local' | 'catalog' | 'web'>('all');

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (term: string) => {
    setLoading(true);
    
    // Simula busca hierárquica (prioridade local)
    // Em produção, isso seria uma chamada à API
    setTimeout(() => {
      const mockResults: SearchResult[] = [];
      
      // Prioridade 1: Estabelecimentos de Valente-BA
      if (term.toLowerCase().includes('restaurante') || term.toLowerCase().includes('comida')) {
        mockResults.push({
          id: '1',
          name: 'Restaurante do João',
          type: 'local',
          description: 'Comida caseira e self-service em Valente-BA',
          location: 'Centro, Valente-BA',
          relevance: 95
        });
      }
      
      if (term.toLowerCase().includes('mercado') || term.toLowerCase().includes('supermercado')) {
        mockResults.push({
          id: '2',
          name: 'Supermercado Bom Preço',
          type: 'local',
          description: 'Mercado completo com entregas em Valente',
          location: 'Av. Principal, Valente-BA',
          relevance: 92
        });
      }
      
      // Prioridade 2: Catálogos internos
      if (term.toLowerCase().includes('celular') || term.toLowerCase().includes('iphone')) {
        mockResults.push({
          id: '3',
          name: 'Smartphone XYZ',
          type: 'catalog',
          description: 'Celular disponível na loja TechValente',
          relevance: 85
        });
      }
      
      // Prioridade 3: Busca web (apenas se necessário)
      if (mockResults.length === 0) {
        mockResults.push({
          id: 'web1',
          name: `Resultados da Web para "${term}"`,
          type: 'web',
          description: 'Buscar na internet resultados mais amplos',
          relevance: 50
        });
      }
      
      setResults(mockResults);
      setLoading(false);
    }, 800);
  };

  const filteredResults = results.filter(result => {
    if (activeTab === 'all') return true;
    return result.type === activeTab;
  });

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'local': return <Store className="w-5 h-5 text-green-400" />;
      case 'catalog': return <Package className="w-5 h-5 text-blue-400" />;
      case 'web': return <Globe className="w-5 h-5 text-purple-400" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header com Busca */}
      <div className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </Link>
            <div className="flex-1">
              <SmartSearchBar placeholder="Buscar em Valente..." />
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Título da Busca */}
        {query && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">
              Resultados para: <span className="text-blue-400">"{query}"</span>
            </h1>
            <p className="text-zinc-400 mt-2">
              Priorizando resultados locais de Valente-BA
            </p>
          </div>
        )}

        {/* Tabs de Filtro */}
        <div className="flex gap-2 mb-8 border-b border-zinc-800">
          {[
            { id: 'all', label: 'Todos', count: results.length },
            { id: 'local', label: '📍 Valente-BA', count: results.filter(r => r.type === 'local').length },
            { id: 'catalog', label: '📦 Catálogos', count: results.filter(r => r.type === 'catalog').length },
            { id: 'web', label: '🌐 Web', count: results.filter(r => r.type === 'web').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                px-6 py-3 font-medium transition-all relative
                ${activeTab === tab.id 
                  ? 'text-blue-400' 
                  : 'text-zinc-400 hover:text-zinc-300'
                }
              `}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 text-sm px-2 py-0.5 bg-zinc-800 rounded-full">
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Resultados */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-zinc-900 rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-zinc-800 rounded w-1/3 mb-3" />
                <div className="h-4 bg-zinc-800 rounded w-2/3 mb-2" />
                <div className="h-4 bg-zinc-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="space-y-4">
            {filteredResults.map((result) => (
              <div
                key={result.id}
                className="bg-zinc-900 hover:bg-zinc-800 rounded-2xl p-6 transition-all cursor-pointer border border-zinc-800 hover:border-zinc-700"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-zinc-800/50 rounded-xl">
                    {getTypeIcon(result.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {result.name}
                      </h3>
                      <span className="text-xs px-2 py-1 bg-zinc-800 rounded-full text-zinc-400">
                        {result.type === 'local' ? 'Local' : result.type === 'catalog' ? 'Catálogo' : 'Web'}
                      </span>
                    </div>
                    <p className="text-zinc-300 mb-2">{result.description}</p>
                    {result.location && (
                      <p className="text-sm text-zinc-400">📍 {result.location}</p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="text-xs text-blue-400">
                        Relevância: {result.relevance}%
                      </div>
                      <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-400 rounded-full"
                          style={{ width: `${result.relevance}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum resultado encontrado
            </h3>
            <p className="text-zinc-400">
              Tente buscar por termos diferentes ou verifique nossa busca na web
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExplorarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}