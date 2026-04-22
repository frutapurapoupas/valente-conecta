'use client'

import { useState, useEffect } from 'react'
import { MapPin, Navigation, Clock, Bell } from 'lucide-react'

export default function LocalizadorAcademia() {
  const [localizacao, setLocalizacao] = useState<{ lat: number; lng: number } | null>(null)
  const [tempoNaAcademia, setTempoNaAcademia] = useState(0)
  const [timerAtivo, setTimerAtivo] = useState(false)

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocalizacao({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      })
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timerAtivo) {
      interval = setInterval(() => {
        setTempoNaAcademia(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerAtivo])

  const formatarTempo = (segundos: number) => {
    const horas = Math.floor(segundos / 3600)
    const minutos = Math.floor((segundos % 3600) / 60)
    const segs = segundos % 60
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
      <h3 className="font-bold text-white flex items-center gap-2">
        <MapPin className="w-4 h-4 text-yellow-400" />
        Localização
      </h3>

      {localizacao ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-zinc-400 bg-zinc-800/30 rounded-xl p-3">
            <Navigation className="w-4 h-4 text-green-400" />
            <span>Localização detectada</span>
          </div>

          <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
            <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-3xl font-mono font-black text-white">{formatarTempo(tempoNaAcademia)}</p>
            <p className="text-xs text-zinc-500">Tempo na academia</p>
          </div>

          <div className="flex gap-3">
            {!timerAtivo ? (
              <button onClick={() => setTimerAtivo(true)} className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold">
                Check-in
              </button>
            ) : (
              <button onClick={() => setTimerAtivo(false)} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold">
                Check-out
              </button>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-zinc-500">Ativando localização...</p>
      )}
    </div>
  )
}