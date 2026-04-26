'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Save, X, TrendingUp, Search, ChevronDown } from 'lucide-react'

interface AtividadeCarga {
  id: string
  nome: string
  grupoMuscular: string
  cargaAtual: number
  metaCarga: number
  dataUltimoTreino?: string
  observacoes?: string
}

const GRUPOS_MUSCULARES = [
  'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 
  'Pernas', 'Glúteos', 'Abdômen', 'Core', 'Cardio'
]

const EXERCICIOS_POR_GRUPO: Record<string, string[]> = {
  'Peito': ['Supino Reto', 'Supino Inclinado', 'Supino Declinado', 'Crucifixo', 'Fly', 'Cross Over', 'Peck Deck', 'Flexão de Braço'],
  'Costas': ['Barra Fixa', 'Remada Curvada', 'Puxada Alta', 'Puxada Frontal', 'Remada Cavalinho', 'Deadlift', 'Hyperextension'],
  'Ombros': ['Desenvolvimento', 'Elevação Lateral', 'Elevação Frontal', 'Encolhimento', 'Arnold Press', 'Crucifixo Inverso'],
  'Bíceps': ['Rosca Direta', 'Rosca Martelo', 'Rosca Scott', 'Rosca Concentrada', 'Rosca Inversa', 'Rosca com Barra W'],
  'Tríceps': ['Tríceps Pulley', 'Tríceps Testa', 'Tríceps Francês', 'Tríceps Corda', 'Dip', 'Kickback'],
  'Pernas': ['Agachamento', 'Leg Press', 'Cadeira Extensora', 'Mesa Flexora', 'Avanço', 'Afundo', 'Stiff', 'Hack Squat'],
  'Glúteos': ['Glúteo na Máquina', 'Glúteo no Solo', 'Agachamento Sumô', 'Elevação de Quadril', 'Cadeira Abdutora'],
  'Abdômen': ['Crunch', 'Prancha', 'Abdominal Infra', 'Leg Raise', 'Russian Twist', 'Bicycle Crunch'],
  'Core': ['Prancha', 'Side Plank', 'Dead Bug', 'Bird Dog', 'Mountain Climber'],
  'Cardio': ['Corrida', 'Caminhada', 'Bicicleta', 'Esteira', 'Elíptico', 'Pular Corda']
}

export default function HistoricoCargaPage() {
  const [atividades, setAtividades] = useState<AtividadeCarga[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<string | null>(null)
  const [showExercicioDropdown, setShowExercicioDropdown] = useState(false)
  const [showGrupoDropdown, setShowGrupoDropdown] = useState(false)
  const [exercicioFiltro, setExercicioFiltro] = useState('')
  const [showAddExercicio, setShowAddExercicio] = useState(false)
  const [novoExercicio, setNovoExercicio] = useState('')
  const [formData, setFormData] = useState({
    nome: '',
    grupoMuscular: 'Peito',
    cargaAtual: '',
    metaCarga: '',
    observacoes: ''
  })

  useEffect(() => {
    carregarAtividades()
    carregarExerciciosPersonalizados()
  }, [])

  const carregarAtividades = () => {
    const salvo = localStorage.getItem('historico_carga_atividades')
    if (salvo) {
      setAtividades(JSON.parse(salvo))
    }
  }

  const carregarExerciciosPersonalizados = () => {
    const salvo = localStorage.getItem('exercicios_personalizados')
    if (salvo) {
      const exerciciosPersonalizados = JSON.parse(salvo)
      Object.entries(exerciciosPersonalizados).forEach(([grupo, exercicios]) => {
        if (EXERCICIOS_POR_GRUPO[grupo]) {
          EXERCICIOS_POR_GRUPO[grupo] = [...EXERCICIOS_POR_GRUPO[grupo], ...(exercicios as string[])]
        }
      })
    }
  }

  const salvarExercicioPersonalizado = (grupo: string, exercicio: string) => {
    const salvo = localStorage.getItem('exercicios_personalizados')
    const exerciciosPersonalizados = salvo ? JSON.parse(salvo) : {}
    
    if (!exerciciosPersonalizados[grupo]) {
      exerciciosPersonalizados[grupo] = []
    }
    
    if (!exerciciosPersonalizados[grupo].includes(exercicio)) {
      exerciciosPersonalizados[grupo].push(exercicio)
      localStorage.setItem('exercicios_personalizados', JSON.stringify(exerciciosPersonalizados))
      EXERCICIOS_POR_GRUPO[grupo] = [...EXERCICIOS_POR_GRUPO[grupo], exercicio]
    }
  }

  const salvarAtividades = (novasAtividades: AtividadeCarga[]) => {
    setAtividades(novasAtividades)
    localStorage.setItem('historico_carga_atividades', JSON.stringify(novasAtividades))
  }

  const handleSalvar = () => {
    if (!formData.nome || !formData.cargaAtual || !formData.metaCarga) {
      alert('Preencha os campos obrigatórios')
      return
    }

    const novaAtividade: AtividadeCarga = {
      id: editando || Date.now().toString(),
      nome: formData.nome,
      grupoMuscular: formData.grupoMuscular,
      cargaAtual: parseFloat(formData.cargaAtual),
      metaCarga: parseFloat(formData.metaCarga),
      observacoes: formData.observacoes,
      dataUltimoTreino: editando ? atividades.find(a => a.id === editando)?.dataUltimoTreino : undefined
    }

    let novasAtividades: AtividadeCarga[]
    if (editando) {
      novasAtividades = atividades.map(a => a.id === editando ? novaAtividade : a)
    } else {
      novasAtividades = [...atividades, novaAtividade]
    }

    salvarAtividades(novasAtividades)
    
    // Reset form but keep modal open for adding more
    setFormData({
      nome: '',
      grupoMuscular: 'Peito',
      cargaAtual: '',
      metaCarga: '',
      observacoes: ''
    })
    setExercicioFiltro('')
    setShowExercicioDropdown(false)
    
    alert('Atividade salva com sucesso! Você pode adicionar mais atividades.')
  }

  const handleEditar = (atividade: AtividadeCarga) => {
    setEditando(atividade.id)
    setFormData({
      nome: atividade.nome,
      grupoMuscular: atividade.grupoMuscular,
      cargaAtual: atividade.cargaAtual.toString(),
      metaCarga: atividade.metaCarga.toString(),
      observacoes: atividade.observacoes || ''
    })
    setShowModal(true)
  }

  const handleExcluir = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta atividade?')) {
      salvarAtividades(atividades.filter(a => a.id !== id))
    }
  }

  const atualizarCarga = (id: string, novaCarga: number) => {
    const novasAtividades = atividades.map(a => 
      a.id === id 
        ? { ...a, cargaAtual: novaCarga, dataUltimoTreino: new Date().toISOString() }
        : a
    )
    salvarAtividades(novasAtividades)
  }

  const fecharModal = () => {
    setShowModal(false)
    setEditando(null)
    setFormData({
      nome: '',
      grupoMuscular: 'Peito',
      cargaAtual: '',
      metaCarga: '',
      observacoes: ''
    })
    setExercicioFiltro('')
    setShowExercicioDropdown(false)
    setShowGrupoDropdown(false)
    setShowAddExercicio(false)
    setNovoExercicio('')
  }

  const handleAdicionarNovoExercicio = () => {
    if (novoExercicio.trim()) {
      salvarExercicioPersonalizado(formData.grupoMuscular, novoExercicio.trim())
      setFormData(f => ({ ...f, nome: novoExercicio.trim() }))
      setNovoExercicio('')
      setShowAddExercicio(false)
    }
  }

  const exerciciosFiltrados = EXERCICIOS_POR_GRUPO[formData.grupoMuscular]?.filter(e => 
    e.toLowerCase().includes(exercicioFiltro.toLowerCase())
  ) || []

  const agruparPorGrupo = () => {
    const grupos: Record<string, AtividadeCarga[]> = {}
    atividades.forEach(a => {
      if (!grupos[a.grupoMuscular]) grupos[a.grupoMuscular] = []
      grupos[a.grupoMuscular].push(a)
    })
    return grupos
  }

  const grupos = agruparPorGrupo()

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Histórico de Cargas</h1>
            <p className="text-sm text-gray-500">Configure suas atividades e cargas</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white p-3 rounded-xl active:scale-95 transition-all"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Resumo */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-6 h-6" />
            <h2 className="font-black text-lg">Resumo</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-black">{atividades.length}</p>
              <p className="text-xs opacity-80">Atividades</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-black">{Object.keys(grupos).length}</p>
              <p className="text-xs opacity-80">Grupos</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-2xl font-black">
                {atividades.filter(a => a.cargaAtual >= a.metaCarga).length}
              </p>
              <p className="text-xs opacity-80">Metas atingidas</p>
            </div>
          </div>
        </div>

        {/* Lista de atividades por grupo */}
        {Object.entries(grupos).map(([grupo, atividadesGrupo]) => (
          <div key={grupo} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-black text-lg text-gray-900 mb-4">{grupo}</h3>
            <div className="space-y-3">
              {atividadesGrupo.map(atividade => {
                const pctMeta = Math.min(100, Math.round((atividade.cargaAtual / atividade.metaCarga) * 100))
                return (
                  <div key={atividade.id} className="border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{atividade.nome}</h4>
                        {atividade.observacoes && (
                          <p className="text-xs text-gray-500 mt-1">{atividade.observacoes}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditar(atividade)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExcluir(atividade.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-semibold text-gray-700">Carga atual</span>
                          <span className="font-black text-gray-900">{atividade.cargaAtual} kg</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-600 rounded-full transition-all" 
                            style={{ width: `${pctMeta}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Meta: {atividade.metaCarga} kg ({pctMeta}%)</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => atualizarCarga(atividade.id, atividade.cargaAtual + 2.5)}
                          className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center active:scale-90 transition-all"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => atualizarCarga(atividade.id, Math.max(0, atividade.cargaAtual - 2.5))}
                          className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center active:scale-90 transition-all"
                        >
                          <span className="text-gray-600 font-bold text-sm">-</span>
                        </button>
                      </div>
                    </div>
                    {atividade.dataUltimoTreino && (
                      <p className="text-xs text-gray-400">
                        Último treino: {new Date(atividade.dataUltimoTreino).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {atividades.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Nenhuma atividade cadastrada</p>
            <p className="text-sm text-gray-400 mt-1">Clique no + para adicionar sua primeira atividade</p>
          </div>
        )}
      </main>

      {/* Modal de cadastro/edição */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-md p-6 space-y-4 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900">
                {editando ? 'Editar Atividade' : 'Nova Atividade'}
              </h2>
              <button onClick={fecharModal} className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Nome do exercício</label>
                <div className="relative mt-1">
                  <input
                    value={formData.nome}
                    onChange={e => {
                      setFormData(f => ({ ...f, nome: e.target.value }))
                      setExercicioFiltro(e.target.value)
                      setShowExercicioDropdown(true)
                    }}
                    onFocus={() => setShowExercicioDropdown(true)}
                    placeholder="Ex: Supino Reto"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base text-gray-900 font-medium bg-white pr-10"
                  />
                  <button
                    onClick={() => setShowExercicioDropdown(!showExercicioDropdown)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
                {showExercicioDropdown && exerciciosFiltrados.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {exerciciosFiltrados.map((exercicio) => (
                      <button
                        key={exercicio}
                        onClick={() => {
                          setFormData(f => ({ ...f, nome: exercicio }))
                          setShowExercicioDropdown(false)
                          setExercicioFiltro('')
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-indigo-50 text-gray-900 font-medium transition-colors"
                      >
                        {exercicio}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => setShowAddExercicio(!showAddExercicio)}
                  className="mt-2 text-xs text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Adicionar novo exercício
                </button>
                {showAddExercicio && (
                  <div className="mt-2 flex gap-2">
                    <input
                      value={novoExercicio}
                      onChange={e => setNovoExercicio(e.target.value)}
                      placeholder="Nome do novo exercício"
                      className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                    <button
                      onClick={handleAdicionarNovoExercicio}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700"
                    >
                      Adicionar
                    </button>
                  </div>
                )}
              </div>
              <div className="relative">
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Grupo muscular</label>
                <div className="relative mt-1">
                  <input
                    value={formData.grupoMuscular}
                    onChange={e => {
                      setFormData(f => ({ ...f, grupoMuscular: e.target.value }))
                    }}
                    onFocus={() => setShowGrupoDropdown(true)}
                    placeholder="Selecione um grupo"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base text-gray-900 font-medium bg-white pr-10"
                  />
                  <button
                    onClick={() => setShowGrupoDropdown(!showGrupoDropdown)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
                {showGrupoDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {GRUPOS_MUSCULARES.map((grupo) => (
                      <button
                        key={grupo}
                        onClick={() => {
                          setFormData(f => ({ ...f, grupoMuscular: grupo, nome: '' }))
                          setShowGrupoDropdown(false)
                          setExercicioFiltro('')
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-indigo-50 text-gray-900 font-medium transition-colors"
                      >
                        {grupo}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Carga atual (kg)</label>
                  <input
                    type="number"
                    value={formData.cargaAtual}
                    onChange={e => setFormData(f => ({ ...f, cargaAtual: e.target.value }))}
                    placeholder="Ex: 60"
                    className="mt-1 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base text-gray-900 font-medium bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Meta de carga (kg)</label>
                  <input
                    type="number"
                    value={formData.metaCarga}
                    onChange={e => setFormData(f => ({ ...f, metaCarga: e.target.value }))}
                    placeholder="Ex: 80"
                    className="mt-1 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base text-gray-900 font-medium bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Observações (opcional)</label>
                <textarea
                  value={formData.observacoes}
                  onChange={e => setFormData(f => ({ ...f, observacoes: e.target.value }))}
                  placeholder="Ex: 4 séries de 12 reps"
                  rows={2}
                  className="mt-1 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base text-gray-900 font-medium bg-white resize-none"
                />
              </div>
            </div>
            <button
              onClick={handleSalvar}
              disabled={!formData.nome || !formData.cargaAtual || !formData.metaCarga}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-700 text-white rounded-2xl font-black text-lg active:scale-95 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {editando ? 'Salvar Alterações' : 'Adicionar Atividade'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
