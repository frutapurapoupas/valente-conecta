import { NextRequest, NextResponse } from 'next/server'

interface Store {
  id: string
  name: string
  distance: number
  address: string
  category: string
  rating?: number
  isOpen?: boolean
}

interface NearbyStoresResponse {
  stores: Store[]
  total: number
  userLocation: {
    lat: number
    lng: number
  }
}

// Banco de dados simulado de lojas
const mockStores: Store[] = [
  {
    id: 'store1',
    name: 'Supermercado Central',
    distance: 0.5,
    address: 'Rua Principal, 123 - Centro, Valente-BA',
    category: 'supermercado',
    rating: 4.5,
    isOpen: true
  },
  {
    id: 'store2',
    name: 'Mercado Popular',
    distance: 1.2,
    address: 'Avenida Brasil, 456 - Centro, Valente-BA',
    category: 'supermercado',
    rating: 4.2,
    isOpen: true
  },
  {
    id: 'store3',
    name: 'Atacadão de Valente',
    distance: 2.8,
    address: 'BR-116, Km 123 - Zona Rural, Valente-BA',
    category: 'atacado',
    rating: 4.0,
    isOpen: true
  },
  {
    id: 'store4',
    name: 'Farmácia Central',
    distance: 0.8,
    address: 'Rua da Praça, 78 - Centro, Valente-BA',
    category: 'farmácia',
    rating: 4.7,
    isOpen: true
  },
  {
    id: 'store5',
    name: 'Mercadinho da Esquina',
    distance: 1.5,
    address: 'Rua das Flores, 200 - Centro, Valente-BA',
    category: 'supermercado',
    rating: 4.3,
    isOpen: true
  }
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = parseFloat(searchParams.get('lat') || '0')
  const lng = parseFloat(searchParams.get('lng') || '0')
  const limit = parseInt(searchParams.get('limit') || '3')

  try {
    // Calcular distâncias e ordenar por proximidade
    const storesWithDistance = mockStores.map(store => {
      const distance = calculateDistance(lat, lng, -11.3217, -41.8655) // Centro de Valente como referência
      return {
        ...store,
        distance
      }
    }).sort((a, b) => a.distance - b.distance)

    const nearbyStores = storesWithDistance.slice(0, limit)

    const response: NearbyStoresResponse = {
      stores: nearbyStores,
      total: nearbyStores.length,
      userLocation: { lat, lng }
    }

    // Adicionar headers de cache
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=600', // Cache de 10 minutos para localização
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })

  } catch (error) {
    console.error('Erro ao buscar lojas próximas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar lojas próximas' },
      { status: 500 }
    )
  }
}

// Função de cálculo de distância (Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLon / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a * a), Math.sqrt(1 - a))
  const distance = R * c
  return Math.round(distance * 100) / 100 // Arredondar para 2 casas decimais
}
