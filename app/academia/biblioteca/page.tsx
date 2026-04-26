'use client'

import { useState } from 'react'
import { Search, Filter, Play, BookOpen, Dumbbell, Heart, Target, Zap, ChevronRight } from 'lucide-react'

interface ExercicioBiblioteca {
  id: string
  nome: string
  categoria: string
  grupoMuscular: string
  nivel: 'iniciante' | 'intermediario' | 'avancado'
  equipamento: string[]
  descricao: string
  instrucoes: string[]
  dicas: string[]
  videoUrl?: string
}

const EXERCICIOS: ExercicioBiblioteca[] = [
  {
    id: '1',
    nome: 'Supino Reto com Barra',
    categoria: 'Peito',
    grupoMuscular: 'Peito',
    nivel: 'intermediario',
    equipamento: ['Barra', 'Banco'],
    descricao: 'Exercício fundamental para desenvolvimento do peitoral, ombros e tríceps.',
    instrucoes: [
      'Deite-se no banco com a barra acima do peito',
      'Segure a barra com as mãos um pouco além da largura dos ombros',
      'Desça a barra até tocar levemente o peito',
      'Empurre a barra de volta à posição inicial',
      'Mantenha os cotovelos a 45 graus durante o movimento'
    ],
    dicas: [
      'Mantenha a escápula retraída durante todo o movimento',
      'Não arqueie as costas excessivamente',
      'Respire: inspire ao descer, expire ao empurrar'
    ]
  },
  {
    id: '2',
    nome: 'Agachamento Livre',
    categoria: 'Pernas',
    grupoMuscular: 'Pernas',
    nivel: 'intermediario',
    equipamento: ['Barra', 'Rack'],
    descricao: 'O rei dos exercícios de pernas, trabalha quadríceps, glúteos e isquiotibiais.',
    instrucoes: [
      'Posicione a barra nas costas, abaixo dos ombros',
      'Afaste os pés na largura dos ombros',
      'Desça flexionando joelhos e quadris',
      'Mantenha a coluna reta e o peito erguido',
      'Suba empurrando pelos calcanhares'
    ],
    dicas: [
      'Não deixe os joelhos entrarem para dentro',
      'Descer até pelo menos paralelo ao solo',
      'Mantenha o peso nos calcanhares'
    ]
  },
  {
    id: '3',
    nome: 'Puxada Frontal',
    categoria: 'Costas',
    grupoMuscular: 'Costas',
    nivel: 'iniciante',
    equipamento: ['Polia'],
    descricao: 'Excelente para desenvolvimento da largura das costas.',
    instrucoes: [
      'Sente-se no aparelho e ajuste a almofada nas coxas',
      'Segure a barra com as mãos além da largura dos ombros',
      'Puxe a barra em direção ao peito superior',
      'Retorne lentamente à posição inicial',
      'Mantenha os cotovelos alinhados com o corpo'
    ],
    dicas: [
      'Não use impulso com o corpo',
      'Contraia as escápulas no topo do movimento',
      'Desça lentamente para máxima contração'
    ]
  },
  {
    id: '4',
    nome: 'Rosca Direta com Barra',
    categoria: 'Bíceps',
    grupoMuscular: 'Bíceps',
    nivel: 'iniciante',
    equipamento: ['Barra', 'Halteres'],
    descricao: 'Exercício clássico para hipertrofia dos bíceps.',
    instrucoes: [
      'Fique em pé com a barra na frente das coxas',
      'Segure a barra com as palmas voltadas para frente',
      'Flexione os cotovelos levando a barra aos ombros',
      'Desça lentamente à posição inicial',
      'Mantenha os cotovelos fixos ao lado do corpo'
    ],
    dicas: [
      'Não balance o corpo',
      'Mantenha a tensão nos bíceps durante a descida',
      'Use amplitude completa'
    ]
  },
  {
    id: '5',
    nome: 'Desenvolvimento Militar',
    categoria: 'Ombros',
    grupoMuscular: 'Ombros',
    nivel: 'intermediario',
    equipamento: ['Barra', 'Halteres'],
    descricao: 'Exercício completo para desenvolvimento dos ombros.',
    instrucoes: [
      'Fique em pé com a barra na altura dos ombros',
      'Empurre a barra para cima até os braços esticarem',
      'Desça a barra de volta à posição inicial',
      'Mantenha o core contraído',
      'Não arqueie as costas'
    ],
    dicas: [
      'Mantenha a barra alinhada com o centro do corpo',
      'Respire: inspire ao descer, expire ao empurrar',
      'Use carga moderada para manter a forma'
    ]
  },
  {
    id: '6',
    nome: 'Prancha Abdominal',
    categoria: 'Core',
    grupoMuscular: 'Abdômen',
    nivel: 'iniciante',
    equipamento: ['Nenhum'],
    descricao: 'Exercício isométrico para fortalecimento do core.',
    instrucoes: [
      'Apoie antebraços e pontas dos pés no chão',
      'Mantenha o corpo em linha reta',
      'Contraia o abdômen e glúteos',
      'Mantenha a posição pelo tempo desejado',
      'Não deixe os quadris cair ou subir'
    ],
    dicas: [
      'Comece com 30 segundos e aumente gradualmente',
      'Mantenha a respiração constante',
      'Olhe para o chão para manter o alinhamento'
    ]
  }
]

const CATEGORIAS = ['Todos', 'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Pernas', 'Glúteos', 'Abdômen', 'Core', 'Cardio']
const NIVEIS = ['Todos', 'Iniciante', 'Intermediário', 'Avançado']

export default function BibliotecaPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todos')
  const [nivelFiltro, setNivelFiltro] = useState('Todos')
  const [exercicioSelecionado, setExercicioSelecionado] = useState<ExercicioBiblioteca | null>(null)

  const exerciciosFiltrados = EXERCICIOS.filter(ex => {
    const matchSearch = ex.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       ex.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategoria = categoriaFiltro === 'Todos' || ex.categoria === categoriaFiltro
    const matchNivel = nivelFiltro === 'Todos' || 
                      (nivelFiltro === 'Iniciante' && ex.nivel === 'iniciante') ||
                      (nivelFiltro === 'Intermediário' && ex.nivel === 'intermediario') ||
                      (nivelFiltro === 'Avançado' && ex.nivel === 'avancado')
    return matchSearch && matchCategoria && matchNivel
  })

  const getIconeCategoria = (categoria: string) => {
    const icons: Record<string, any> = {
      'Peito': <Dumbbell className="w-5 h-5" />,
      'Costas': <Dumbbell className="w-5 h-5" />,
      'Ombros': <Dumbbell className="w-5 h-5" />,
      'Bíceps': <Dumbbell className="w-5 h-5" />,
      'Tríceps': <Dumbbell className="w-5 h-5" />,
      'Pernas': <Dumbbell className="w-5 h-5" />,
      'Glúteos': <Dumbbell className="w-5 h-5" />,
      'Abdômen': <Target className="w-5 h-5" />,
      'Core': <Target className="w-5 h-5" />,
      'Cardio': <Heart className="w-5 h-5" />
    }
    return icons[categoria] || <Dumbbell className="w-5 h-5" />
  }

  const getCorNivel = (nivel: string) => {
    const colors: Record<string, string> = {
      'iniciante': 'bg-green-100 text-green-700',
      'intermediario': 'bg-yellow-100 text-yellow-700',
      'avancado': 'bg-red-100 text-red-700'
    }
    return colors[nivel] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-black text-gray-900 mb-1">Biblioteca de Exercícios</h1>
          <p className="text-sm text-gray-500 mb-4">Exercícios, técnicas e instruções</p>
          
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar exercício..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
            />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <div className="flex-shrink-0">
            <select
              value={categoriaFiltro}
              onChange={e => setCategoriaFiltro(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-shrink-0">
            <select
              value={nivelFiltro}
              onChange={e => setNivelFiltro(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {NIVEIS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {/* Lista de exercícios */}
        <div className="space-y-3">
          {exerciciosFiltrados.map(exercicio => (
            <button
              key={exercicio.id}
              onClick={() => setExercicioSelecionado(exercicio)}
              className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-left shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                  {getIconeCategoria(exercicio.categoria)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 truncate">{exercicio.nome}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCorNivel(exercicio.nivel)}`}>
                      {exercicio.nivel.charAt(0).toUpperCase() + exercicio.nivel.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{exercicio.descricao}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-400">{exercicio.categoria}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-400">{exercicio.equipamento.join(', ')}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
              </div>
            </button>
          ))}
        </div>

        {exerciciosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Nenhum exercício encontrado</p>
            <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros ou a busca</p>
          </div>
        )}
      </main>

      {/* Modal de detalhes do exercício */}
      {exercicioSelecionado && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-2xl p-6 space-y-5 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                  {getIconeCategoria(exercicioSelecionado.categoria)}
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">{exercicioSelecionado.nome}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCorNivel(exercicioSelecionado.nivel)}`}>
                      {exercicioSelecionado.nivel.charAt(0).toUpperCase() + exercicioSelecionado.nivel.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500">{exercicioSelecionado.categoria}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setExercicioSelecionado(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <span className="text-2xl text-gray-500">×</span>
              </button>
            </div>

            <p className="text-gray-700">{exercicioSelecionado.descricao}</p>

            <div>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Play className="w-5 h-5 text-indigo-600" />
                Instruções
              </h3>
              <ol className="space-y-2">
                {exercicioSelecionado.instrucoes.map((instrucao, i) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-700">
                    <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <span>{instrucao}</span>
                  </li>
                ))}
              </ol>
            </div>

            {exercicioSelecionado.dicas.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Dicas Importantes
                </h3>
                <ul className="space-y-2">
                  {exercicioSelecionado.dicas.map((dica, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-700">
                      <span className="text-yellow-500">💡</span>
                      <span>{dica}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 className="font-bold text-gray-900 mb-2">Equipamento Necessário</h3>
              <div className="flex flex-wrap gap-2">
                {exercicioSelecionado.equipamento.map(eq => (
                  <span key={eq} className="px-3 py-1 bg-slate-100 text-gray-700 rounded-full text-sm">
                    {eq}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setExercicioSelecionado(null)}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-700 text-white rounded-2xl font-black text-lg active:scale-95 transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
