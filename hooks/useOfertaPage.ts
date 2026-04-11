'use client'

import { useState, useEffect } from 'react'

export type Oferta = {
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

export type FiltroOfertas = 'todas' | 'maioresDescontos' | 'maisProximas'

type UserLocation = { lat: number; lng: number } | null

const MOCK_OFERTAS: Oferta[] = [
  {
    id: 1,
    lojaNome: 'Supermercado Valente',
    lojaEndereco: 'Rua das Flores, 123 - Centro',
    lojaLat: -23.5505,
    lojaLng: -46.6333,
    produtoNome: 'Arroz Integral 1kg',
    precoAntigo: 8.90,
    precoNovo: 5.90,
    economia: 3.00,
    percentualDesconto: 33.7,
    dataAlteracao: new Date().toISOString(),
    categoria: 'Alimentação',
  },
  {
    id: 2,
    lojaNome: 'Padaria do Zé',
    lojaEndereco: 'Av. Paulista, 1000 - Bela Vista',
    lojaLat: -23.5615,
    lojaLng: -46.6556,
    produtoNome: 'Pão Francês (unidade)',
    precoAntigo: 1.20,
    precoNovo: 0.80,
    economia: 0.40,
    percentualDesconto: 33.3,
    dataAlteracao: new Date(Date.now() - 3600000).toISOString(),
    categoria: 'Padaria',
  },
  {
    id: 3,
    lojaNome: 'Farmácia Saúde',
    lojaEndereco: 'Rua Augusta, 500 - Consolação',
    lojaLat: -23.5550,
    lojaLng: -46.6480,
    produtoNome: 'Dipirona 500mg (20 comprimidos)',
    precoAntigo: 15.90,
    precoNovo: 9.90,
    economia: 6.00,
    percentualDesconto: 37.7,
    dataAlteracao: new Date(Date.now() - 7200000).toISOString(),
    categoria: 'Farmácia',
  },
  {
    id: 4,
    lojaNome: 'Açougue do João',
    lojaEndereco: 'Rua da Consolação, 2000 - Cerqueira César',
    lojaLat: -23.5580,
    lojaLng: -46.6600,
    produtoNome: 'Picanha (kg)',
    precoAntigo: 89.90,
    precoNovo: 69.90,
    economia: 20.00,
    percentualDesconto: 22.2,
    dataAlteracao: new Date(Date.now() - 10800000).toISOString(),
    categoria: 'Açougue',
  },
  {
    id: 5,
    lojaNome: 'Hortifruti Natural',
    lojaEndereco: 'Alameda Santos, 1500 - Jardins',
    lojaLat: -23.5650,
    lojaLng: -46.6680,
    produtoNome: 'Banana Prata (kg)',
    precoAntigo: 6.90,
    precoNovo: 3.90,
    economia: 3.00,
    percentualDesconto: 43.5,
    dataAlteracao: new Date(Date.now() - 14400000).toISOString(),
    categoria: 'Hortifruti',
  },
]

function calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): string {
  if (!lat1 || !lng1) return 'N/A'
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distancia = R * c
  if (distancia < 1) return `${Math.round(distancia * 1000)}m`
  return `${distancia.toFixed(1)}km`
}

export function formatarData(dataISO: string): string {
  const data = new Date(dataISO)
  const agora = new Date()
  const diffHoras = Math.floor((agora.getTime() - data.getTime()) / 3600000)
  if (diffHoras < 1) return 'Agora mesmo'
  if (diffHoras < 24) return `${diffHoras} horas atrás`
  return data.toLocaleDateString('pt-BR')
}

export function useOfertaPage() {
  const [ofertas, setOfertas] = useState<Oferta[]>([])
  const [filtro, setFiltro] = useState<FiltroOfertas>('todas')
  const [userLocation, setUserLocation] = useState<UserLocation>(null)

  useEffect(() => {
    const ofertasValidas = MOCK_OFERTAS.filter(o => o.precoNovo < o.precoAntigo)
    setOfertas(ofertasValidas)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude })
        },
        () => {} // silencia erro de permissão
      )
    }
  }, [])

  const ofertasFiltradas = [...ofertas]
    .map(oferta => ({
      ...oferta,
      distancia: userLocation
        ? calcularDistancia(userLocation.lat, userLocation.lng, oferta.lojaLat, oferta.lojaLng)
        : 'N/A',
    }))
    .sort((a, b) => {
      if (filtro === 'maioresDescontos') return b.percentualDesconto - a.percentualDesconto
      if (filtro === 'maisProximas' && userLocation) {
        const distA = parseFloat(a.distancia ?? '') || Infinity
        const distB = parseFloat(b.distancia ?? '') || Infinity
        return distA - distB
      }
      return new Date(b.dataAlteracao).getTime() - new Date(a.dataAlteracao).getTime()
    })

  const abrirMapa = (endereco: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`, '_blank')
  }

  return {
    ofertas,
    ofertasFiltradas,
    filtro,
    setFiltro,
    abrirMapa,
  }
}
