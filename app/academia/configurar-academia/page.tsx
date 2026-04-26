'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Dumbbell, MapPin, Phone, Mail, DollarSign, User, ArrowLeft, Save, Edit, TrendingUp, BookOpen, Navigation } from 'lucide-react'

interface Academia {
  nome: string
  endereco: string
  localizador: { lat: number; lng: number }
  telefone: string
  email: string
  responsavel: string
  responsavelTelefone: string
  responsavelWhatsapp: string
  mensalidade: string
  localizadorCapturado: boolean
}

export default function ConfigurarAcademiaPage() {
  const [academia, setAcademia] = useState<Academia>({
    nome: '',
    endereco: '',
    localizador: { lat: 0, lng: 0 },
    telefone: '',
    email: '',
    responsavel: '',
    responsavelTelefone: '',
    responsavelWhatsapp: '',
    mensalidade: '',
    localizadorCapturado: false,
  })
  
  const [editando, setEditando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [capturandoLocal, setCapturandoLocal] = useState(false)

  useEffect(() => {
    const academiaSalva = localStorage.getItem('academia_dados')
    if (academiaSalva) {
      setAcademia(JSON.parse(academiaSalva))
      setSalvo(true)
    }
    
    // Carregar nome do cadastro inicial
    const nomeUsuario = localStorage.getItem('usuario_nome')
    if (nomeUsuario && !academia.responsavel) {
      setAcademia(prev => ({ ...prev, responsavel: nomeUsuario }))
    }
  }, [])

  const capturarLocalizacao = () => {
    setCapturandoLocal(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setAcademia({
            ...academia,
            localizador: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            localizadorCapturado: true,
          })
          setCapturandoLocal(false)
          alert('Localização capturada com sucesso!')
        },
        (error) => {
          setCapturandoLocal(false)
          alert('Erro ao capturar localização. Verifique as permissões.')
        }
      )
    } else {
      setCapturandoLocal(false)
      alert('Geolocalização não suportada neste navegador.')
    }
  }

  const handleSalvar = () => {
    localStorage.setItem('academia_dados', JSON.stringify(academia))
    setSalvo(true)
    setEditando(false)
    
    // Se localizador não foi capturado, mostrar alerta para capturar depois
    if (!academia.localizadorCapturado) {
      localStorage.setItem('academia_alerta_localizador', 'true')
    } else {
      localStorage.removeItem('academia_alerta_localizador')
    }
    
    alert('Academia salva com sucesso!')
  }

  const handleEditar = () => {
    setEditando(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-20">
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
        <div className="h-16 max-w-2xl mx-auto flex items-center justify-between px-4">
          <Link href="/academia/selecao" className="relative group">
            <ArrowLeft className="w-6 h-6 text-yellow-400 cursor-pointer hover:text-yellow-300 transition-colors" />
          </Link>
          
          <div className="font-black uppercase italic text-white text-sm tracking-widest">
            <span>ACADEMIA</span>
          </div>
          
          {salvo && !editando && (
            <button onClick={handleEditar} className="relative group">
              <Edit className="w-6 h-6 text-yellow-400 cursor-pointer hover:text-yellow-300 transition-colors" />
            </button>
          )}
          {!salvo && <div className="w-6" />}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-8 space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full mb-4">
            <Dumbbell className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Configurar Academia</h1>
          <p className="text-zinc-400 text-sm">Cadastre os dados da sua academia</p>
        </div>

        {salvo && !editando ? (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Dumbbell className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-xs text-zinc-400">Nome da academia</p>
                  <p className="font-bold text-white">{academia.nome}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-xs text-zinc-400">Endereço</p>
                  <p className="font-bold text-white">{academia.endereco}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Navigation className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-xs text-zinc-400">Localizador</p>
                  <p className="font-bold text-white">
                    {academia.localizador.lat !== 0 ? `${academia.localizador.lat.toFixed(6)}, ${academia.localizador.lng.toFixed(6)}` : 'Não configurado'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 space-y-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" /> Responsável
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-xs text-zinc-400">Nome</p>
                    <p className="font-bold text-white">{academia.responsavel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-xs text-zinc-400">Telefone</p>
                    <p className="font-bold text-white">{academia.responsavelTelefone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-xs text-zinc-400">WhatsApp</p>
                    <p className="font-bold text-white">{academia.responsavelWhatsapp}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-xs text-zinc-400">E-mail</p>
                    <p className="font-bold text-white">{academia.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 space-y-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-yellow-400" /> Financeiro
              </h3>
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-xs text-zinc-400">Mensalidade</p>
                  <p className="font-bold text-white">R$ {academia.mensalidade}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/academia/historico-carga"
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/20 transition-all"
              >
                <TrendingUp className="w-6 h-6 text-indigo-400" />
                <p className="font-bold text-white text-sm">Histórico de Cargas</p>
                <p className="text-xs text-zinc-400 text-center">Configure suas atividades</p>
              </Link>
              <Link
                href="/academia/biblioteca"
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/20 transition-all"
              >
                <BookOpen className="w-6 h-6 text-violet-400" />
                <p className="font-bold text-white text-sm">Biblioteca</p>
                <p className="text-xs text-zinc-400 text-center">Exercícios e técnicas</p>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Nome da academia</label>
                <input
                  type="text"
                  value={academia.nome}
                  onChange={(e) => setAcademia({ ...academia, nome: e.target.value })}
                  className="mt-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                  placeholder="Ex: Academia Fit Valente"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Endereço</label>
                <input
                  type="text"
                  value={academia.endereco}
                  onChange={(e) => setAcademia({ ...academia, endereco: e.target.value })}
                  className="mt-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                  placeholder="Rua, número, bairro"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Localizador</label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={academia.localizador.lat !== 0 ? `${academia.localizador.lat.toFixed(6)}, ${academia.localizador.lng.toFixed(6)}` : ''}
                    readOnly
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-zinc-400"
                    placeholder="Clique para capturar"
                  />
                  <button
                    onClick={capturarLocalizacao}
                    disabled={capturandoLocal}
                    className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-2 transition-all disabled:opacity-40"
                  >
                    <Navigation className="w-5 h-5" />
                    {capturandoLocal ? 'Capturando...' : 'Capturar'}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 space-y-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" /> Responsável
              </h3>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Nome</label>
                <input
                  type="text"
                  value={academia.responsavel}
                  onChange={(e) => setAcademia({ ...academia, responsavel: e.target.value })}
                  className="mt-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                  placeholder="Nome do responsável"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Telefone</label>
                <input
                  type="tel"
                  value={academia.responsavelTelefone}
                  onChange={(e) => setAcademia({ ...academia, responsavelTelefone: e.target.value })}
                  className="mt-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                  placeholder="(77) 91234-5678"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">WhatsApp</label>
                <input
                  type="tel"
                  value={academia.responsavelWhatsapp}
                  onChange={(e) => setAcademia({ ...academia, responsavelWhatsapp: e.target.value })}
                  className="mt-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                  placeholder="(77) 91234-5678"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">E-mail</label>
                <input
                  type="email"
                  value={academia.email}
                  onChange={(e) => setAcademia({ ...academia, email: e.target.value })}
                  className="mt-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                  placeholder="contato@academia.com"
                />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 space-y-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-yellow-400" /> Financeiro
              </h3>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Mensalidade (R$)</label>
                <input
                  type="number"
                  value={academia.mensalidade}
                  onChange={(e) => setAcademia({ ...academia, mensalidade: e.target.value })}
                  className="mt-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white"
                  placeholder="99,90"
                />
              </div>
            </div>

            <button
              onClick={handleSalvar}
              disabled={!academia.nome || !academia.endereco}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-2xl hover:shadow-emerald-500/25 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              Salvar Academia
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
