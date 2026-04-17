'use client'

import { useState, useCallback } from 'react'

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  address?: string
}

interface LocationError {
  code: number
  message: string
}

export function useLocationService() {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<LocationError | null>(null)

  // Obter localização atual
  const getCurrentLocation = useCallback(async (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({ code: 0, message: 'Geolocalização não suportada pelo navegador' })
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
          resolve(locationData)
        },
        (error) => {
          reject({
            code: error.code,
            message: getErrorMessage(error.code)
          })
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    })
  }, [])

  // Converter coordenadas para endereço (geocoding reversa)
  const reverseGeocode = useCallback(async (latitude: number, longitude: number): Promise<string> => {
    try {
      // Usar Nominatim (OpenStreetMap) - gratuito e não requer API key
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ValenteConecta/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Erro ao buscar endereço')
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      // Construir endereço formatado
      const address = data.display_name || formatAddress(data.address)
      return address
    } catch (error) {
      console.error('Erro no geocoding reverso:', error)
      throw error
    }
  }, [])

  // Formatar endereço do OpenStreetMap
  const formatAddress = (address: any): string => {
    const parts = []
    
    if (address.road) parts.push(address.road)
    if (address.house_number) parts.push(address.house_number)
    if (address.suburb) parts.push(address.suburb)
    if (address.city || address.town || address.village) parts.push(address.city || address.town || address.village)
    if (address.state) parts.push(address.state)
    if (address.postcode) parts.push(address.postcode)

    return parts.join(', ') || 'Endereço não encontrado'
  }

  // Capturar localização completa
  const captureLocation = useCallback(async (): Promise<LocationData & { address: string }> => {
    setLoading(true)
    setError(null)

    try {
      // Obter coordenadas
      const locationData = await getCurrentLocation()
      
      // Obter endereço
      const address = await reverseGeocode(locationData.latitude, locationData.longitude)
      
      const completeLocation = {
        ...locationData,
        address
      }

      setLocation(completeLocation)
      return completeLocation
    } catch (err: any) {
      const locationError: LocationError = {
        code: err.code || 0,
        message: err.message || 'Erro ao obter localização'
      }
      setError(locationError)
      throw locationError
    } finally {
      setLoading(false)
    }
  }, [getCurrentLocation, reverseGeocode])

  // Obter mensagem de erro baseada no código
  const getErrorMessage = (code: number): string => {
    switch (code) {
      case 1:
        return 'Permissão negada. Clique no ícone de cadeado (HTTPS) e permita localização, ou digite o endereço manualmente.'
      case 2:
        return 'Posição não disponível. Verifique se o GPS está ativado.'
      case 3:
        return 'Timeout. Tente novamente.'
      default:
        return 'Erro desconhecido ao obter localização.'
    }
  }

  // Verificar se é HTTPS (necessário para geolocalização em produção)
  const isSecureContext = useCallback((): boolean => {
    return window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost'
  }, [])

  // Verificar se localização está disponível
  const isLocationAvailable = useCallback((): boolean => {
    return 'geolocation' in navigator
  }, [])

  return {
    location,
    loading,
    error,
    captureLocation,
    getCurrentLocation,
    reverseGeocode,
    isLocationAvailable,
    isSecureContext
  }
}
