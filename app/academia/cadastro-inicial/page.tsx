'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User, Ruler, Scale, Activity, Target, Heart, ArrowLeft, Save, Edit } from 'lucide-react'

interface PerfilUsuario {
  nome: string
  altura: string
  peso: string
  idade: string
  condicaoFisica: string
  nivelVida: string
  objetivos: string[]
  condicoesMedicas: string[]
  metaPeso: string
  metaTempo: string
}

export default function CadastroInicialPage() {
  const [perfil, setPerfil] = useState<PerfilUsuario>({
    nome: '',
    altura: '',
    peso: '',
    idade: '',
    condicaoFisica: '',
    nivelVida: '',
    objetivos: [],
    condicoesMedicas: [],
    metaPeso: '',
    metaTempo: '',
  })
  
  const [editando, setEditando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  // Carregar nome do cadastro inicial do app
  useEffect(() => {
    const nomeSalvo = localStorage.getItem('usuario_nome')
    if (nomeSalvo) {
      setPerfil(prev => ({ ...prev, nome: nomeSalvo }))
    }
    
    // Verificar se já tem perfil salvo
    const perfilSalvo = localStorage.getItem('academia_perfil_inicial')
    if (perfilSalvo) {
      setPerfil(JSON.parse(perfilSalvo))
      setSalvo(true)
    }
  }, [])

  const objetivosOpcoes = [
    'Emagrecimento',
    'Ganho de massa muscular',
    'Condicionamento físico',
    'Saúde geral',
    'Força',
    'Flexibilidade',
    'Resistência',
    'Estresse/Ansiedade',
  ]

  const condicoesOpcoes = [
    'Diabetes',
    'Hipertensão',
    'Problemas cardíacos',
    'Asma',
    'Lesões anteriores',
    'Dores nas articulações',
    'Nenhuma',
  ]

  const condicaoFisicaOpcoes = [
    'Sedentário',
    'Levemente ativo',
    'Moderadamente ativo',
    'Muito ativo',
    'Atleta',
  ]

  const nivelVidaOpcoes = [
    'Trabalho sentado',
    'Trabalho em pé',
    'Trabalho físico leve',
    'Trabalho físico pesado',
    'Estudante',
  ]

  const toggleObjetivo = (objetivo: string) => {
    setPerfil(prev => ({
      ...prev,
      objetivos: prev.objetivos.includes(objetivo)
        ? prev.objetivos.filter(o => o !== objetivo)
        : [...prev.objetivos, objetivo]
    }))
  }

  const toggleCondicao = (condicao: string) => {
    setPerfil(prev => ({
      ...prev,
      condicoesMedicas: prev.condicoesMedicas.includes(condicao)
        ? prev.condicoesMedicas.filter(c => c !== condicao)
        : [...prev.condicoesMedicas, condicao]
    }))
  }

  const handleSalvar = () => {
    localStorage.setItem('academia_perfil_inicial', JSON.stringify(perfil))
    // Salvar nome para uso em outras partes do app
    localStorage.setItem('usuario_nome', perfil.nome)
    setSalvo(true)
    setEditando(false)
    alert('Perfil salvo com sucesso!')
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
            <span>CADASTRO INICIAL</span>
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mb-4">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Seu Perfil Físico</h1>
          <p className="text-zinc-400 text-sm">Configure suas características e metas</p>
        </div>

        {salvo && !editando ? (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className="text-xs text-zinc-400">Nome</p>
                  <p className="font-bold text-white">{perfil.nome}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-xs text-zinc-400">Altura</p>
                    <p className="font-bold text-white">{perfil.altura} cm</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-xs text-zinc-400">Peso</p>
                    <p className="font-bold text-white">{perfil.peso} kg</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-pink-400" />
                  <div>
                    <p className="text-xs text-zinc-400">Idade</p>
                    <p className="font-bold text-white">{perfil.idade} anos</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 space-y-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" /> Condição Física
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-zinc-400 mb-1">Nível de atividade</p>
                  <p className="font-bold text-white">{perfil.condicaoFisica}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400 mb-1">Nível de vida</p>
                  <p className="font-bold text-white">{perfil.nivelVida}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 space-y-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" /> Objetivos
              </h3>
              <div className="flex flex-wrap gap-2">
                {perfil.objetivos.map((obj, idx) => (
                  <span key={idx} className="px-3 py-1 bg-purple-500/30 text-purple-300 rounded-full text-sm">
                    {obj}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 space-y-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400" /> Condições Médicas
              </h3>
              <div className="flex flex-wrap gap-2">
                {perfil.condicoesMedicas.length > 0 ? (
                  perfil.condicoesMedicas.map((cond, idx) => (
                    <span key={idx} className="px-3 py-1 bg-red-500/30 text-red-300 rounded-full text-sm">
                      {cond}
                    </span>
                  ))
                ) : (
                  <span className="text-zinc-400">Nenhuma condição informada</span>
                )}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 space-y-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" /> Metas
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-400 mb-1">Meta de peso</p>
                  <p className="font-bold text-white">{perfil.metaPeso} kg</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400 mb-1">Tempo estimado</p>
                  <p className="font-bold text-white">{perfil.metaTempo}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Nome</label>
                <input
                  type="text"
                  value={perfil.nome}
                  onChange={(e) => setPerfil({ ...perfil, nome: e.target.value })}
                  className="mt-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                  placeholder="Seu nome"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Altura (cm)</label>
                  <input
                    type="number"
                    value={perfil.altura}
                    onChange={(e) => setPerfil({ ...perfil, altura: e.target.value })}
                    className="mt-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    placeholder="175"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Peso (kg)</label>
                  <input
                    type="number"
                    value={perfil.peso}
                    onChange={(e) => setPerfil({ ...perfil, peso: e.target.value })}
                    className="mt-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    placeholder="75"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Idade</label>
                  <input
                    type="number"
                    value={perfil.idade}
                    onChange={(e) => setPerfil({ ...perfil, idade: e.target.value })}
                    className="mt-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    placeholder="30"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 space-y-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" /> Condição Física
              </h3>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Nível de atividade</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {condicaoFisicaOpcoes.map((opcao) => (
                    <button
                      key={opcao}
                      onClick={() => setPerfil({ ...perfil, condicaoFisica: opcao })}
                      className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                        perfil.condicaoFisica === opcao
                          ? 'border-indigo-500 bg-indigo-500/30 text-indigo-300'
                          : 'border-white/20 text-zinc-400 hover:border-white/40'
                      }`}
                    >
                      {opcao}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Nível de vida</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {nivelVidaOpcoes.map((opcao) => (
                    <button
                      key={opcao}
                      onClick={() => setPerfil({ ...perfil, nivelVida: opcao })}
                      className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                        perfil.nivelVida === opcao
                          ? 'border-indigo-500 bg-indigo-500/30 text-indigo-300'
                          : 'border-white/20 text-zinc-400 hover:border-white/40'
                      }`}
                    >
                      {opcao}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 space-y-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" /> Objetivos (selecione múltiplos)
              </h3>
              <div className="flex flex-wrap gap-2">
                {objetivosOpcoes.map((objetivo) => (
                  <button
                    key={objetivo}
                    onClick={() => toggleObjetivo(objetivo)}
                    className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${
                      perfil.objetivos.includes(objetivo)
                        ? 'border-purple-500 bg-purple-500/30 text-purple-300'
                        : 'border-white/20 text-zinc-400 hover:border-white/40'
                    }`}
                  >
                    {objetivo}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 space-y-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400" /> Condições Médicas (se houver)
              </h3>
              <div className="flex flex-wrap gap-2">
                {condicoesOpcoes.map((condicao) => (
                  <button
                    key={condicao}
                    onClick={() => toggleCondicao(condicao)}
                    className={`px-4 py-2 rounded-full text-sm font-bold border-2 transition-all ${
                      perfil.condicoesMedicas.includes(condicao)
                        ? 'border-red-500 bg-red-500/30 text-red-300'
                        : 'border-white/20 text-zinc-400 hover:border-white/40'
                    }`}
                  >
                    {condicao}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 space-y-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" /> Metas
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Meta de peso (kg)</label>
                  <input
                    type="number"
                    value={perfil.metaPeso}
                    onChange={(e) => setPerfil({ ...perfil, metaPeso: e.target.value })}
                    className="mt-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    placeholder="70"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Tempo estimado</label>
                  <input
                    type="text"
                    value={perfil.metaTempo}
                    onChange={(e) => setPerfil({ ...perfil, metaTempo: e.target.value })}
                    className="mt-1 w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                    placeholder="3 meses"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSalvar}
              disabled={!perfil.nome || !perfil.altura || !perfil.peso || !perfil.idade}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-2xl hover:shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              Salvar Perfil
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
