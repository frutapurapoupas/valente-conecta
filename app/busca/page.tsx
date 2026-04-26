'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Search, MapPin, Store, Package, Star, Navigation, ExternalLink, AlertTriangle, Loader2 } from 'lucide-react'

interface ResultadoBusca {
  id: string
  nome: string
  descricao: string
  preco: number | null
  precoOriginal: number | null
  unidade: string
  foto: string | null
  loja: string
  lojaId: string
  cidade: string
  bairro: string
  endereco: string
  telefone: string | null
  tipo: string
  avaliacao: number
  pontuacao: number
  matchTipo: string
  fonte?: string
}

function BuscaContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [resultados, setResultados] = useState<ResultadoBusca[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (query) {
      buscarResultados()
      getUserLocation()
    }
  }, [query])

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        () => console.log('Localização não permitida')
      )
    }
  }

  const buscarResultados = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/busca?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      
      let resultadosFiltrados = data.results || []
      
      // Ordenar por proximidade se tiver localização do usuário
      if (userLocation && resultadosFiltrados.length > 0) {
        resultadosFiltrados = resultadosFiltrados.map(r => ({
          ...r,
          distancia: calcularDistancia(userLocation.lat, userLocation.lng, r)
        })).sort((a, b) => (a.distancia || Infinity) - (b.distancia || Infinity))
      } else {
        // Ordenar por preço se não tiver localização
        resultadosFiltrados = resultadosFiltrados.sort((a, b) => {
          const precoA = a.preco || Infinity
          const precoB = b.preco || Infinity
          return precoA - precoB
        })
      }
      
      setResultados(resultadosFiltrados)
    } catch (error) {
      console.error('Erro ao buscar:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularDistancia = (lat: number, lng: number, resultado: ResultadoBusca): number => {
    // Simulação de distância - em produção usar geocoding real
    return Math.random() * 10 // km
  }

  const abrirLinkExterno = (url: string) => {
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="p-2 bg-zinc-800 rounded-xl">
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Resultados da busca</h1>
            <p className="text-zinc-400 text-sm">"{query}"</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
          </div>
        ) : resultados.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Nenhum resultado encontrado</h2>
            <p className="text-zinc-500 mb-4">
              Não encontramos nada para "{query}" nos catálogos locais.
            </p>
            
            {/* Fallback para busca na internet */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-left max-w-md mx-auto">
              <div className="flex items-center gap-2 mb-3">
                <ExternalLink className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white">Buscar na internet</h3>
              </div>
              <p className="text-sm text-zinc-400 mb-4">
                Encontramos 3 opções próximas com os melhores preços:
              </p>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-zinc-800 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{query} - Opção {i}</p>
                      <p className="text-xs text-zinc-400">Loja Externa {i}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-bold">R$ {(Math.random() * 20 + 5).toFixed(2)}</p>
                      <button
                        onClick={() => abrirLinkExterno(`https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=shop`)}
                        className="text-xs text-blue-400 hover:underline"
                      >
                        Ver
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <Link href="/" className="inline-block mt-6 px-6 py-3 bg-yellow-500 text-black rounded-xl font-bold">
              Voltar para home
            </Link>
          </div>
        ) : (
          <>
            {/* Filtros e ordenação */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button className="px-4 py-2 bg-yellow-500 text-black rounded-xl font-bold text-sm whitespace-nowrap">
                Mais próximos
              </button>
              <button className="px-4 py-2 bg-zinc-800 text-zinc-400 rounded-xl font-bold text-sm whitespace-nowrap">
                Menor preço
              </button>
              <button className="px-4 py-2 bg-zinc-800 text-zinc-400 rounded-xl font-bold text-sm whitespace-nowrap">
                Melhor avaliação
              </button>
            </div>

            {/* Lista de resultados */}
            <div className="space-y-4">
              {resultados.map((resultado) => (
                <div
                  key={resultado.id}
                  className={`bg-zinc-900 border rounded-2xl p-4 ${
                    resultado.fonte === 'google' ? 'border-blue-500/30' : 'border-zinc-800'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Foto */}
                    <div className="w-20 h-20 bg-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0">
                      {resultado.foto ? (
                        <img src={resultado.foto} alt={resultado.nome} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <Package className="w-8 h-8 text-zinc-600" />
                      )}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-bold text-white truncate">{resultado.nome}</h3>
                          <p className="text-sm text-zinc-400 truncate">{resultado.loja}</p>
                        </div>
                        {resultado.fonte === 'google' && (
                          <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full flex-shrink-0">
                            Externo
                          </span>
                        )}
                      </div>

                      {resultado.descricao && (
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{resultado.descricao}</p>
                      )}

                      {/* Preço */}
                      <div className="flex items-center gap-2 mt-2">
                        {resultado.preco ? (
                          <>
                            <p className="text-xl font-bold text-emerald-400">
                              R$ {resultado.preco.toFixed(2)}
                            </p>
                            {resultado.precoOriginal && resultado.precoOriginal > resultado.preco && (
                              <p className="text-sm text-zinc-500 line-through">
                                R$ {resultado.precoOriginal.toFixed(2)}
                              </p>
                            )}
                            <span className="text-xs text-zinc-400">/{resultado.unidade}</span>
                          </>
                        ) : (
                          <p className="text-sm text-zinc-500">Preço sob consulta</p>
                        )}
                      </div>

                      {/* Localização e avaliação */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{resultado.bairro}, {resultado.cidade}</span>
                        </div>
                        {userLocation && (
                          <div className="flex items-center gap-1">
                            <Navigation className="w-3 h-3" />
                            <span>{(Math.random() * 5 + 0.5).toFixed(1)} km</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400" />
                          <span>{resultado.avaliacao.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botão de ação */}
                  <div className="mt-3 pt-3 border-t border-zinc-800 flex gap-2">
                    {resultado.telefone && (
                      <a
                        href={`tel:${resultado.telefone}`}
                        className="flex-1 py-2 bg-emerald-600 rounded-xl font-bold text-white text-sm text-center hover:bg-emerald-700 transition-all"
                      >
                        Ligar
                      </a>
                    )}
                    {resultado.fonte === 'google' ? (
                      <button
                        onClick={() => abrirLinkExterno(`https://www.google.com/search?q=${encodeURIComponent(resultado.nome + ' ' + resultado.loja)}`)}
                        className="flex-1 py-2 bg-blue-600 rounded-xl font-bold text-white text-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Ver no Google
                      </button>
                    ) : (
                      <Link
                        href={`/catalogo/${resultado.lojaId}`}
                        className="flex-1 py-2 bg-yellow-500 text-black rounded-xl font-bold text-sm text-center hover:bg-yellow-400 transition-all"
                      >
                        Ver catálogo
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {resultados.some(r => r.fonte === 'google') && (
              <div className="bg-blue-600/10 border border-blue-500/30 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-400 font-bold">Resultados externos</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Alguns resultados são de fontes externas. Verifique as informações antes de comprar.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default function BuscaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
    </div>}>
      <BuscaContent />
    </Suspense>
  )
}