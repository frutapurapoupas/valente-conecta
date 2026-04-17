import { NextRequest, NextResponse } from 'next/server'

interface GooglePlacesResult {
  place_id: string
  formatted_address: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  name: string
  types: string[]
  address_components?: {
    long_name: string
    short_name: string
    types: string[]
  }[]
}

interface DistanceMatrixResult {
  status: string
  duration?: {
    text: string
    value: number
  }
  distance?: {
    text: string
    value: number
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  
  try {
    switch (action) {
      case 'autocomplete':
        return handleAutocomplete(searchParams)
      case 'geocode':
        return handleGeocode(searchParams)
      case 'distancematrix':
        return handleDistanceMatrix(searchParams)
      case 'nearby':
        return handleNearbySearch(searchParams)
      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    }
  } catch (error) {
    console.error('Erro na API Google Maps:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function handleAutocomplete(searchParams: URLSearchParams) {
  const input = searchParams.get('input')
  const location = searchParams.get('location') // lat,lng
  const radius = searchParams.get('radius') || '50000' // 50km
  
  if (!input) {
    return NextResponse.json({ error: 'Input é obrigatório' }, { status: 400 })
  }

  // Em produção, use uma chave de API real
  const API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'demo_key'
  
  let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json`
  url += `?input=${encodeURIComponent(input)}`
  url += `&key=${API_KEY}`
  url += `&components=country:BR`
  url += `&types=address`
  
  if (location) {
    url += `&location=${location}`
    url += `&radius=${radius}`
  }

  const response = await fetch(url)
  const data = await response.json()
  
  return NextResponse.json(data)
}

async function handleGeocode(searchParams: URLSearchParams) {
  const address = searchParams.get('address')
  
  if (!address) {
    return NextResponse.json({ error: 'Endereço é obrigatório' }, { status: 400 })
  }

  const API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'demo_key'
  
  const url = `https://maps.googleapis.com/maps/api/geocode/json`
  url += `?address=${encodeURIComponent(address)}`
  url += `&key=${API_KEY}`
  url += `&components=country:BR`

  const response = await fetch(url)
  const data = await response.json()
  
  return NextResponse.json(data)
}

async function handleDistanceMatrix(searchParams: URLSearchParams) {
  const origins = searchParams.get('origins') // lat,lng
  const destinations = searchParams.get('destinations') // lat,lng
  
  if (!origins || !destinations) {
    return NextResponse.json({ error: 'Origens e destinos são obrigatórios' }, { status: 400 })
  }

  const API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'demo_key'
  
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json`
  url += `?origins=${encodeURIComponent(origins)}`
  url += `&destinations=${encodeURIComponent(destinations)}`
  url += `&key=${API_KEY}`
  url += `&language=pt-BR`
  url += `&units=metric`

  const response = await fetch(url)
  const data = await response.json()
  
  return NextResponse.json(data)
}

async function handleNearbySearch(searchParams: URLSearchParams) {
  const location = searchParams.get('location') // lat,lng
  const radius = searchParams.get('radius') || '50000' // 50km
  const type = searchParams.get('type') || 'store'
  const keyword = searchParams.get('keyword') || ''
  
  if (!location) {
    return NextResponse.json({ error: 'Localização é obrigatória' }, { status: 400 })
  }

  const API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'demo_key'
  
  let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`
  url += `?location=${encodeURIComponent(location)}`
  url += `&radius=${radius}`
  url += `&type=${type}`
  url += `&key=${API_KEY}`
  url += `&language=pt-BR`
  
  if (keyword) {
    url += `&keyword=${encodeURIComponent(keyword)}`
  }

  const response = await fetch(url)
  const data = await response.json()
  
  return NextResponse.json(data)
}
