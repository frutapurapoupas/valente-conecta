'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, MapPin, Store, TrendingDown, Eye, Clock, Zap, Navigation, TrendingUp, Minus } from 'lucide-react'

interface Oferta {
  id: number
  lojaNome: string
  lojaEndereco: string
  lojaLat: number
  lojaLng: number
  produtoNome: string
  precoAntigo: number
  precoNovo: number
  economia: number
  percentualDesconto: number
  dataAlteracao: string
  categoria: string
  distancia?: string
}

export default function OfertaPage() {
  const [ofertas, setOfertas] = useState<Oferta[]>([])
  const [filtro, setFiltro] = useState<'todas' | 'maioresDescontos' | 'maisProximas'>('todas')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    // Simular ofertas de empresas que REDUZIRAM o preço (preço novo < preço antigo)
    const mockOfertas: Oferta[] = [
      {
        id: 1,
        lojaNome: "Supermercado Valente",
        lojaEndereco: "Rua das Flores, 123 - Centro",
        lojaLat: -23.5505,
        lojaLng: -46.6333,
        produtoNome: "Arroz Integral 1kg",
        precoAntigo: 8.90,
        precoNovo: 5.90,  // REDUÇÃO: -R$3,00
        economia: 3.00,
        percentualDesconto: 33.7,
        dataAlteracao: new Date().toISOString(),
        categoria: "Alimentação"
      },
      {
        id: 2,
        lojaNome: "Padaria do Zé",
        lojaEndereco: "Av. Paulista, 1000 - Bela Vista",
        lojaLat: -23.5615,
        lojaLng: -46.6556,
        produtoNome: "Pão Francês (unidade)",
        precoAntigo: 1.20,
        precoNovo: 0.80,  // REDUÇÃO: -R$0,40
        economia: 0.40,
        percentualDesconto: 33.3,
        dataAlteracao: new Date(Date.now() - 3600000).toISOString(),
        categoria: "Padaria"
      },
      {
        id: 3,
        lojaNome: "Farmácia Saúde",
        lojaEndereco: "Rua Augusta, 500 - Consolação",
        lojaLat: -23.5550,
        lojaLng: -46.6480,
        produtoNome: "Dipirona 500mg (20 comprimidos)",
        precoAntigo: 15.90,
        precoNovo: 9.90,  // REDUÇÃO: -R$6,00
        economia: 6.00,
        percentualDesconto: 37.7,
        dataAlteracao: new Date(Date.now() - 7200000).toISOString(),
        categoria: "Farmácia"
      },
      {
        id: 4,
        lojaNome: "Açougue do João",
        lojaEndereco: "Rua da Consolação, 2000 - Cerqueira César",
        lojaLat: -23.5580,
        lojaLng: -46.6600,
        produtoNome: "Picanha (kg)",
        precoAntigo: 89.90,
        precoNovo: 69.90,  // REDUÇÃO: -R$20,00
        economia: 20.00,
        percentualDesconto: 22.2,
        dataAlteracao: new Date(Date.now() - 10800000).toISOString(),
        categoria: "Açougue"
      },
      {
        id: 5,
        lojaNome: "Hortifruti Natural",
        lojaEndereco: "Alameda Santos, 1500 - Jardins",
        lojaLat: -23.5650,
        lojaLng: -46.6680,
        produtoNome: "Banana Prata (kg)",
        precoAntigo: 6.90,
        precoNovo: 3.90,  // REDUÇÃO: -R$3,00
        economia: 3.00,
        percentualDesconto: 43.5,
        dataAlteracao: new Date(Date.now() - 14400000).toISOString(),
        categoria: "Hortifruti"
      }
    ]

    // FILTRO IMPORTANTE: Mostrar APENAS ofertas com preço novo MENOR que preço antigo
    // Se preço novo >= preço antigo, NÃO mostra
    const ofertasValidas = mockOfertas.filter(oferta => oferta.precoNovo < oferta.precoAntigo)
    
    setOfertas(ofertasValidas)

    // Obter localização do usuário
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Erro ao obter localização:', error)
        }
      )
    }
  }, [])

  // Calcular distância (fórmula de Haversine)
  const calcularDistancia = (lat1: number, lng1: number, lat2: number, lng2: number): string => {
    if (!lat1 || !lng1) return 'N/A'
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distancia = R * c
    if (distancia < 1) return `${Math.round(distancia * 1000)}m`
    return `${distancia.toFixed(1)}km`
  }

  // Filtrar e ordenar ofertas
  const ofertasFiltradas = [...ofertas]
    .map(oferta => ({
      ...oferta,
      distancia: userLocation ? calcularDistancia(userLocation.lat, userLocation.lng, oferta.lojaLat, oferta.lojaLng) : 'N/A'
    }))
    .sort((a, b) => {
      if (filtro === 'maioresDescontos') return b.percentualDesconto - a.percentualDesconto
      if (filtro === 'maisProximas' && userLocation) {
        const distA = parseFloat(a.distancia) || Infinity
        const distB = parseFloat(b.distancia) || Infinity
        return distA - distB
      }
      return new Date(b.dataAlteracao).getTime() - new Date(a.dataAlteracao).getTime()
    })

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO)
    const agora = new Date()
    const diffHoras = Math.floor((agora.getTime() - data.getTime()) / 3600000)
    
    if (diffHoras < 1) return 'Agora mesmo'
    if (diffHoras < 24) return `${diffHoras} horas atrás`
    return data.toLocaleDateString('pt-BR')
  }

  const abrirMapa = (endereco: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-red-500 text-white sticky top-0 z-20">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/" className="p-2 hover:bg-white/20 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            <span className="font-bold text-lg">Ofertas do Dia</span>
          </div>
          <div className="flex-1"></div>
          <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
            {ofertas.length} ofertas com desconto
          </div>
        </div>
      </header>

      {/* Banner explicativo */}
      <div className="bg-green-50 p-3 mx-4 mt-4 rounded-xl border border-green-200">
        <p className="text-xs text-green-700 text-center flex items-center justify-center gap-2">
          <TrendingDown className="w-4 h-4" />
          Mostrando apenas produtos com preço REDUZIDO em relação ao dia anterior
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow-sm p-3 sticky top-[57px] z-10 mt-2 mx-4 rounded-xl">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFiltro('todas')}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
              filtro === 'todas' 
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            📅 Mais Recentes
          </button>
          <button
            onClick={() => setFiltro('maioresDescontos')}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
              filtro === 'maioresDescontos' 
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            🎯 Maiores Descontos
          </button>
          <button
            onClick={() => setFiltro('maisProximas')}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
              filtro === 'maisProximas' 
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            📍 Mais Próximas
          </button>
        </div>
      </div>

      {/* Lista de Ofertas */}
      <main className="p-4 max-w-7xl mx-auto">
        {ofertasFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhuma oferta no momento</p>
            <p className="text-sm text-gray-400">Volte mais tarde para ver as novidades!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ofertasFiltradas.map((oferta) => (
              <div key={oferta.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
                {/* Badge de desconto */}
                <div className="absolute relative">
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold z-10">
                    -{oferta.percentualDesconto}%
                  </div>
                </div>

                {/* Cabeçalho da oferta */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-3 border-b">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Store className="w-4 h-4 text-orange-500" />
                        <span className="font-semibold text-gray-800">{oferta.lojaNome}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{oferta.lojaEndereco}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {oferta.distancia !== 'N/A' && (
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Navigation className="w-3 h-3" />
                          {oferta.distancia}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Conteúdo da oferta */}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-3">{oferta.produtoNome}</h3>
                  
                  {/* Preços - Mostra redução clara */}
                  <div className="flex items-baseline gap-3 mb-3 flex-wrap">
                    <span className="text-gray-400 line-through text-sm">
                      R$ {oferta.precoAntigo.toFixed(2)}
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      R$ {oferta.precoNovo.toFixed(2)}
                    </span>
                    <span className="text-sm font-semibold text-green-500 bg-green-50 px-2 py-1 rounded-full">
                      Economize R$ {oferta.economia.toFixed(2)}
                    </span>
                  </div>

                  {/* Indicador de redução */}
                  <div className="flex items-center gap-1 text-xs text-green-600 mb-3">
                    <TrendingDown className="w-3 h-3" />
                    <span>Preço reduzido! Antes R$ {oferta.precoAntigo.toFixed(2)}</span>
                  </div>

                  {/* Metadados */}
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatarData(oferta.dataAlteracao)}</span>
                    </div>
                    <div className="bg-gray-100 px-2 py-1 rounded-full">
                      {oferta.categoria}
                    </div>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => abrirMapa(oferta.lojaEndereco)}
                      className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 transition"
                    >
                      <MapPin className="w-4 h-4" />
                      Como chegar
                    </button>
                    <button className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:from-orange-600 hover:to-red-600 transition">
                      <Eye className="w-4 h-4" />
                      Ver produto
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Informação de atualização */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <p>🔄 Ofertas atualizadas em tempo real quando empresas REDUZEM seus preços</p>
          <p className="mt-1">💡 Produtos com mesmo valor do dia anterior NÃO aparecem aqui</p>
          <p className="mt-1">📍 Ative sua localização para ver ofertas próximas a você</p>
        </div>
      </main>
    </div>
  )
}