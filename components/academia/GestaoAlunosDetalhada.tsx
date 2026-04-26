'use client'

import { useState } from 'react'
import { 
  User, Scale, Ruler, Target, Activity, 
  Heart, AlertTriangle, Dumbbell, TrendingUp,
  Edit2, X, Save, Plus, ChevronDown, ChevronUp
} from 'lucide-react'
import type { AlunoAcademia } from '@/hooks/useAdminAcademia'

interface GestaoAlunosDetalhadaProps {
  alunos: AlunoAcademia[]
  onAtualizarAluno: (id: number, dados: Partial<AlunoAcademia>) => void
}

export function GestaoAlunosDetalhada({ alunos, onAtualizarAluno }: GestaoAlunosDetalhadaProps) {
  const [alunoSelecionado, setAlunoSelecionado] = useState<AlunoAcademia | null>(null)
  const [editando, setEditando] = useState(false)
  const [formDados, setFormDados] = useState<Partial<AlunoAcademia>>({})

  const OBJETIVOS = [
    { val: 'emagrecer', label: 'Emagrecer', emoji: '🔥' },
    { val: 'hipertrofia', label: 'Hipertrofia', emoji: '💪' },
    { val: 'condicionamento', label: 'Condicionamento', emoji: '⚡' },
    { val: 'saude', label: 'Saúde Geral', emoji: '💚' },
  ]

  const NIVEIS = [
    { val: 'iniciante', label: 'Iniciante' },
    { val: 'intermediario', label: 'Intermediário' },
    { val: 'avancado', label: 'Avançado' },
  ]

  const TIPOS_EXERCICIO = [
    'Musculação', 'Cardio', 'CrossFit', 'Yoga', 'Pilates', 
    'Natação', 'Corrida', 'Funcional', 'Powerlifting', 'HIIT',
    'Caminhada', 'Alongamento', 'Musculação adaptada'
  ]

  const CONDICOES_FISICAS = [
    'Nenhuma', 'Pressão alta', 'Diabetes', 'Obesidade', 
    'Lesão joelho', 'Dor lombar', 'Asma', 'Problemas cardíacos',
    'Artrite', 'Osteoporose', 'Outra'
  ]

  function abrirDetalhes(aluno: AlunoAcademia) {
    setAlunoSelecionado(aluno)
    setFormDados({ ...aluno })
    setEditando(false)
  }

  function iniciarEdicao() {
    setEditando(true)
  }

  function salvarEdicao() {
    if (alunoSelecionado && formDados) {
      onAtualizarAluno(alunoSelecionado.id, formDados)
      setAlunoSelecionado({ ...alunoSelecionado, ...formDados })
      setEditando(false)
    }
  }

  function cancelarEdicao() {
    if (alunoSelecionado) {
      setFormDados({ ...alunoSelecionado })
    }
    setEditando(false)
  }

  function toggleCondicao(condicao: string) {
    const atuais = formDados.condicoesFisicas || []
    if (atuais.includes(condicao)) {
      setFormDados({ 
        ...formDados, 
        condicoesFisicas: atuais.filter(c => c !== condicao) 
      })
    } else {
      setFormDados({ 
        ...formDados, 
        condicoesFisicas: [...atuais, condicao] 
      })
    }
  }

  function toggleExercicio(tipo: string) {
    const atuais = formDados.tipoExercicio || []
    if (atuais.includes(tipo)) {
      setFormDados({ 
        ...formDados, 
        tipoExercicio: atuais.filter(t => t !== tipo) 
      })
    } else {
      setFormDados({ 
        ...formDados, 
        tipoExercicio: [...atuais, tipo] 
      })
    }
  }

  function calcularIMC(peso: number, altura: number) {
    if (!peso || !altura) return 0
    const alturaM = altura / 100
    return (peso / (alturaM * alturaM)).toFixed(1)
  }

  function getClassificacaoIMC(imc: number) {
    if (imc < 18.5) return { label: 'Abaixo do peso', cor: 'text-blue-500' }
    if (imc < 25) return { label: 'Peso normal', cor: 'text-green-500' }
    if (imc < 30) return { label: 'Sobrepeso', cor: 'text-yellow-500' }
    return { label: 'Obesidade', cor: 'text-red-500' }
  }

  return (
    <div className="space-y-4">
      {/* Lista de alunos */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-500" />
            Alunos Cadastrados ({alunos.length})
          </h3>
        </div>
        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {alunos.map(aluno => (
            <div
              key={aluno.id}
              onClick={() => abrirDetalhes(aluno)}
              className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{aluno.nome}</p>
                    <p className="text-xs text-gray-500">{aluno.academia}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">{aluno.pesoAtual} kg</p>
                  <p className="text-xs text-gray-500">Meta: {aluno.pesoMeta} kg</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de detalhes do aluno */}
      {alunoSelecionado && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-800">{alunoSelecionado.nome}</h3>
                  <p className="text-sm text-gray-500">{alunoSelecionado.academia}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!editando && (
                  <button
                    onClick={iniciarEdicao}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5 text-gray-600" />
                  </button>
                )}
                <button
                  onClick={() => setAlunoSelecionado(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-6 space-y-6">
              {/* Dados físicos */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <Scale className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800">
                    {editando ? (
                      <input
                        type="number"
                        value={formDados.pesoAtual || ''}
                        onChange={(e) => setFormDados({ ...formDados, pesoAtual: parseFloat(e.target.value) })}
                        className="w-20 text-center bg-white border rounded px-2 py-1"
                      />
                    ) : (
                      alunoSelecionado.pesoAtual
                    )}
                  </p>
                  <p className="text-xs text-gray-500">Peso Atual (kg)</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <Target className="w-6 h-6 text-violet-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800">
                    {editando ? (
                      <input
                        type="number"
                        value={formDados.pesoMeta || ''}
                        onChange={(e) => setFormDados({ ...formDados, pesoMeta: parseFloat(e.target.value) })}
                        className="w-20 text-center bg-white border rounded px-2 py-1"
                      />
                    ) : (
                      alunoSelecionado.pesoMeta
                    )}
                  </p>
                  <p className="text-xs text-gray-500">Meta (kg)</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <Ruler className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800">
                    {editando ? (
                      <input
                        type="number"
                        value={formDados.altura || ''}
                        onChange={(e) => setFormDados({ ...formDados, altura: parseFloat(e.target.value) })}
                        className="w-20 text-center bg-white border rounded px-2 py-1"
                      />
                    ) : (
                      alunoSelecionado.altura
                    )}
                  </p>
                  <p className="text-xs text-gray-500">Altura (cm)</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <Activity className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800">
                    {editando ? (
                      <input
                        type="number"
                        value={formDados.idade || ''}
                        onChange={(e) => setFormDados({ ...formDados, idade: parseInt(e.target.value) })}
                        className="w-20 text-center bg-white border rounded px-2 py-1"
                      />
                    ) : (
                      alunoSelecionado.idade
                    )}
                  </p>
                  <p className="text-xs text-gray-500">Idade</p>
                </div>
              </div>

              {/* IMC */}
              <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Índice de Massa Corporal (IMC)</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {calcularIMC(formDados.pesoAtual || alunoSelecionado.pesoAtual, formDados.altura || alunoSelecionado.altura)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getClassificacaoIMC(parseFloat(calcularIMC(formDados.pesoAtual || alunoSelecionado.pesoAtual, formDados.altura || alunoSelecionado.altura))).cor}`}>
                      {getClassificacaoIMC(parseFloat(calcularIMC(formDados.pesoAtual || alunoSelecionado.pesoAtual, formDados.altura || alunoSelecionado.altura))).label}
                    </p>
                  </div>
                </div>
              </div>

              {/* Objetivo e Nível */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Objetivo</label>
                  {editando ? (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {OBJETIVOS.map(obj => (
                        <button
                          key={obj.val}
                          onClick={() => setFormDados({ ...formDados, objetivo: obj.val as any })}
                          className={`py-2 px-3 rounded-lg text-sm font-medium flex items-center gap-2 border-2 transition-all ${
                            formDados.objetivo === obj.val 
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                              : 'border-gray-200 text-gray-600'
                          }`}
                        >
                          <span>{obj.emoji}</span>{obj.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                      <p className="font-semibold text-gray-800">
                        {OBJETIVOS.find(o => o.val === alunoSelecionado.objetivo)?.label}
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Nível</label>
                  {editando ? (
                    <div className="flex gap-2 mt-2">
                      {NIVEIS.map(niv => (
                        <button
                          key={niv.val}
                          onClick={() => setFormDados({ ...formDados, nivel: niv.val as any })}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border-2 transition-all ${
                            formDados.nivel === niv.val 
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                              : 'border-gray-200 text-gray-600'
                          }`}
                        >
                          {niv.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                      <p className="font-semibold text-gray-800">
                        {NIVEIS.find(n => n.val === alunoSelecionado.nivel)?.label}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Frequência semanal */}
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Frequência desejada (vezes/semana)</label>
                {editando ? (
                  <div className="flex gap-2 mt-2">
                    {[2, 3, 4, 5, 6].map(n => (
                      <button
                        key={n}
                        onClick={() => setFormDados({ ...formDados, freqSemanal: n })}
                        className={`flex-1 py-2 rounded-lg text-sm font-black border-2 transition-all ${
                          formDados.freqSemanal === n 
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                            : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        {n}x
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                    <p className="font-semibold text-gray-800">{alunoSelecionado.freqSemanal}x por semana</p>
                  </div>
                )}
              </div>

              {/* Condições físicas */}
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  Condições Físicas / Restrições
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {editando ? (
                    CONDICOES_FISICAS.map(cond => (
                      <button
                        key={cond}
                        onClick={() => toggleCondicao(cond)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
                          (formDados.condicoesFisicas || []).includes(cond)
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        {cond}
                      </button>
                    ))
                  ) : (
                    alunoSelecionado.condicoesFisicas.map(cond => (
                      <span
                        key={cond}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          cond === 'Nenhuma' 
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {cond}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Tipos de exercício */}
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-indigo-500" />
                  Tipos de Exercício Preferidos
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {editando ? (
                    TIPOS_EXERCICIO.map(tipo => (
                      <button
                        key={tipo}
                        onClick={() => toggleExercicio(tipo)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
                          (formDados.tipoExercicio || []).includes(tipo)
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        {tipo}
                      </button>
                    ))
                  ) : (
                    alunoSelecionado.tipoExercicio.map(tipo => (
                      <span
                        key={tipo}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
                      >
                        {tipo}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Progresso */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-gray-800">Progresso</h4>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{alunoSelecionado.diasSeguidos}</p>
                    <p className="text-xs text-gray-500">Dias seguidos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{alunoSelecionado.treinosMes}</p>
                    <p className="text-xs text-gray-500">Treinos/mês</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">{alunoSelecionado.metaProgresso}%</p>
                    <p className="text-xs text-gray-500">Meta alcançada</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all" 
                      style={{ width: `${alunoSelecionado.metaProgresso}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Botões de ação */}
              {editando && (
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={cancelarEdicao}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={salvarEdicao}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-700 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Salvar Alterações
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
