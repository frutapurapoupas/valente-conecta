'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, Bluetooth, WifiOff, Loader2, Scan, Smartphone } from 'lucide-react'

interface LeitorCodigoProps {
  onCodigoLido: (codigo: string) => void
  onFallback: () => void
  modoExterno: boolean
  setModoExterno: (valor: boolean) => void
}

export default function LeitorCodigo({ onCodigoLido, onFallback, modoExterno, setModoExterno }: LeitorCodigoProps) {
  const [scanning, setScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [leitorConectado, setLeitorConectado] = useState(false)
  const scannerRef = useRef<any>(null)
  const inputExternoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const leitorSalvo = localStorage.getItem('leitor_externo_conectado')
    if (leitorSalvo === 'true') {
      setLeitorConectado(true)
    }
    return () => {
      if (scannerRef.current) {
        pararCamera()
      }
    }
  }, [])

  const iniciarCamera = async () => {
    setLoading(true)
    setMensagem('📷 Solicitando permissão da câmera...')
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Navegador não suporta câmera')
      }
      
      const { Html5Qrcode } = await import('html5-qrcode')
      
      if (scannerRef.current) await pararCamera()
      
      scannerRef.current = new Html5Qrcode('reader')
      
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          onCodigoLido(decodedText)
          setMensagem(`✅ Código lido: ${decodedText}`)
          setTimeout(() => pararCamera(), 1500)
        },
        () => {}
      )
      
      setScanning(true)
      setMensagem('✅ Câmera ativa. Aponte para o código')
    } catch (err: any) {
      console.error(err)
      setMensagem('❌ Erro ao iniciar câmera. Ativando busca manual...')
      setTimeout(() => onFallback(), 2000)
    } finally {
      setLoading(false)
    }
  }

  const pararCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch (err) {}
      scannerRef.current = null
    }
    setScanning(false)
  }

  const toggleLeitorExterno = () => {
    if (!modoExterno) {
      setModoExterno(true)
      setMensagem('🔍 Modo leitor externo ativado. Escaneie o código...')
      setTimeout(() => {
        setLeitorConectado(true)
        localStorage.setItem('leitor_externo_conectado', 'true')
        setMensagem('✅ Leitor externo conectado! Escaneie o código.')
        if (inputExternoRef.current) inputExternoRef.current.focus()
      }, 1500)
    } else {
      setModoExterno(false)
      setLeitorConectado(false)
      localStorage.setItem('leitor_externo_conectado', 'false')
      setMensagem('📱 Modo manual ativado')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const codigo = e.currentTarget.value.trim()
      if (codigo) {
        onCodigoLido(codigo)
        e.currentTarget.value = ''
      }
    }
  }

  if (modoExterno) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="text-center mb-4">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${leitorConectado ? 'bg-green-100' : 'bg-yellow-100'}`}>
            {leitorConectado ? <Bluetooth className="w-8 h-8 text-green-600" /> : <WifiOff className="w-8 h-8 text-yellow-600" />}
          </div>
          <h3 className="text-lg font-bold">Leitor Externo</h3>
          <p className="text-sm text-gray-500 mt-1">{mensagem || 'Conecte o leitor via USB/Bluetooth'}</p>
        </div>
        
        {leitorConectado && (
          <div className="relative">
            <input
              ref={inputExternoRef}
              type="text"
              onKeyPress={handleKeyPress}
              placeholder="Escaneie o código de barras..."
              className="w-full px-4 py-3 border-2 rounded-xl text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <Scan className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        )}
        
        <button
          onClick={toggleLeitorExterno}
          className="w-full mt-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm"
        >
          Desativar Leitor Externo
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <div className="text-center mb-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <Camera className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold">Leitor de Código</h3>
        <p className="text-sm text-gray-500 mt-1">{mensagem || 'Use a câmera para escanear'}</p>
      </div>

      {!scanning ? (
        <button
          onClick={iniciarCamera}
          disabled={loading}
          className="w-full py-3 bg-blue-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
          {loading ? 'Iniciando...' : 'Iniciar Câmera'}
        </button>
      ) : (
        <>
          <div id="reader" className="w-full rounded-xl overflow-hidden mb-3" style={{ minHeight: '250px' }}></div>
          <button onClick={pararCamera} className="w-full py-2 bg-red-500 text-white rounded-lg font-semibold">
            Parar Câmera
          </button>
        </>
      )}

      <button
        onClick={toggleLeitorExterno}
        className="w-full mt-3 py-2 border border-blue-500 text-blue-500 rounded-lg text-sm flex items-center justify-center gap-2"
      >
        <Bluetooth className="w-4 h-4" />
        Usar Leitor Externo
      </button>
    </div>
  )
}