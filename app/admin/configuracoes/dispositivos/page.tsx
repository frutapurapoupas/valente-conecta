'use client'

import { useState, useEffect } from 'react'
import { Smartphone, Laptop, Tablet, Monitor, Trash2, Ban, CheckCircle, Plus, RefreshCw, Copy, Shield, Clock, MapPin, Wifi } from 'lucide-react'

interface Dispositivo {
  id: string
  nome: string
  tipo: 'notebook' | 'celular' | 'tablet' | 'desktop'
  sistema: string
  navegador: string
  modelo: string
  ip: string
  ipv6: string
  user_agent: string
  ativo: boolean
  criado_em: string
  ultimo_acesso: string
}

export default function DispositivosPage() {
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([])
  const [showModal, setShowModal] = useState(false)
  const [codigoPareamento, setCodigoPareamento] = useState('')
  const [codigoGerado, setCodigoGerado] = useState('')
  const [tempoRestante, setTempoRestante] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    carregarDispositivos()
  }, [])

  const carregarDispositivos = () => {
    const saved = localStorage.getItem('admin_dispositivos')
    if (saved) {
      setDispositivos(JSON.parse(saved))
    } else {
      // Dispositivos padrão
      const dispositivosPadrao: Dispositivo[] = [
        {
          id: '1',
          nome: 'Notebook Principal',
          tipo: 'notebook',
          sistema: 'Windows 10',
          navegador: 'Chrome 146',
          modelo: 'Desktop',
          ip: '186.195.6.230',
          ipv6: '2804:5780:311f:9510:b142:773a:3284:7aef',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ativo: true,
          criado_em: new Date().toISOString(),
          ultimo_acesso: new Date().toISOString()
        },
        {
          id: '2',
          nome: 'Celular Pessoal',
          tipo: 'celular',
          sistema: 'Android 14',
          navegador: 'Samsung Internet 29',
          modelo: 'Samsung SM-A145M',
          ip: '186.195.6.230',
          ipv6: '2804:5780:311f:9510:cb97:f3b1:fdc1:2b9f',
          user_agent: 'Mozilla/5.0 (Linux; Android 14; SM-A145M) AppleWebKit/537.36',
          ativo: true,
          criado_em: new Date().toISOString(),
          ultimo_acesso: new Date().toISOString()
        },
        {
          id: '3',
          nome: 'Tablet Trabalho',
          tipo: 'tablet',
          sistema: 'Android 16',
          navegador: 'Chrome 146',
          modelo: 'Samsung SM-X110',
          ip: '186.195.6.230',
          ipv6: '2804:5780:311f:9510:500a:f026:f904:83db',
          user_agent: 'Mozilla/5.0 (Linux; Android 16; SM-X110) AppleWebKit/537.36',
          ativo: true,
          criado_em: new Date().toISOString(),
          ultimo_acesso: new Date().toISOString()
        }
      ]
      setDispositivos(dispositivosPadrao)
      localStorage.setItem('admin_dispositivos', JSON.stringify(dispositivosPadrao))
    }
  }

  const gerarCodigoPareamento = () => {
    const codigo = Math.floor(100000 + Math.random() * 900000).toString()
    setCodigoGerado(codigo)
    setTempoRestante(300) // 5 minutos
    
    const interval = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setCodigoGerado('')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    alert(`Código de pareamento: ${codigo}\nVálido por 5 minutos`)
  }

  const formatarTempo = (segundos: number) => {
    const minutos = Math.floor(segundos / 60)
    const segs = segundos % 60
    return `${minutos}:${segs.toString().padStart(2, '0')}`
  }

  const alternarStatus = (id: string) => {
    const novosDispositivos = dispositivos.map(d => 
      d.id === id ? { ...d, ativo: !d.ativo } : d
    )
    setDispositivos(novosDispositivos)
    localStorage.setItem('admin_dispositivos', JSON.stringify(novosDispositivos))
  }

  const removerDispositivo = (id: string) => {
    if (confirm('Tem certeza que deseja remover este dispositivo?')) {
      const novosDispositivos = dispositivos.filter(d => d.id !== id)
      setDispositivos(novosDispositivos)
      localStorage.setItem('admin_dispositivos', JSON.stringify(novosDispositivos))
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch(tipo) {
      case 'notebook': return <Laptop className="w-6 h-6 text-blue-500" />
      case 'celular': return <Smartphone className="w-6 h-6 text-green-500" />
      case 'tablet': return <Tablet className="w-6 h-6 text-purple-500" />
      default: return <Monitor className="w-6 h-6 text-gray-500" />
    }
  }

  const dispositivosFiltrados = dispositivos.filter(d => 
    d.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.modelo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dispositivos Autorizados</h1>
          <p className="text-gray-500 text-base mt-1">Gerencie dispositivos com acesso ao painel admin</p>
        </div>
        <button
          onClick={gerarCodigoPareamento}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Novo Dispositivo
        </button>
      </div>

      {/* Código de pareamento ativo */}
      {codigoGerado && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-2xl mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm opacity-90">Código de pareamento (válido por 5 minutos)</p>
              <p className="text-4xl font-bold tracking-widest my-2">{codigoGerado}</p>
              <p className="text-sm opacity-90">Expira em: {formatarTempo(tempoRestante)}</p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(codigoGerado)}
              className="bg-white/20 p-3 rounded-xl hover:bg-white/30 transition"
            >
              <Copy className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Busca */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar dispositivos..."
            className="w-full pl-4 pr-4 py-3 border rounded-xl text-base"
          />
        </div>
      </div>

      {/* Lista de dispositivos */}
      <div className="space-y-4">
        {dispositivosFiltrados.map(dispositivo => (
          <div key={dispositivo.id} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  {getTipoIcon(dispositivo.tipo)}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-lg">{dispositivo.nome}</h3>
                    {dispositivo.ativo ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Autorizado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs flex items-center gap-1">
                        <Ban className="w-3 h-3" /> Bloqueado
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-500">
                    <p>{dispositivo.sistema} • {dispositivo.navegador}</p>
                    <p>Modelo: {dispositivo.modelo}</p>
                    <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> IP: {dispositivo.ip}</p>
                    <p className="flex items-center gap-1"><Clock className="w-3 h-3" /> Último acesso: {new Date(dispositivo.ultimo_acesso).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => alternarStatus(dispositivo.id)}
                  className={`p-2 rounded-lg transition ${
                    dispositivo.ativo ? 'text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'
                  }`}
                >
                  {dispositivo.ativo ? <Ban className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => removerDispositivo(dispositivo.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estatísticas */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 text-center">
          <Shield className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{dispositivos.filter(d => d.ativo).length}</p>
          <p className="text-sm text-gray-500">Dispositivos ativos</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center">
          <Ban className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{dispositivos.filter(d => !d.ativo).length}</p>
          <p className="text-sm text-gray-500">Dispositivos bloqueados</p>
        </div>
        <div className="bg-white rounded-xl p-4 text-center">
          <Smartphone className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">{dispositivos.length}</p>
          <p className="text-sm text-gray-500">Total de dispositivos</p>
        </div>
      </div>
    </div>
  )
}