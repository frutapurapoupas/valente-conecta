'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Phone, Calendar, Weight, Ruler, Heart, AlertCircle, Target, Dumbbell, Utensils, Camera, ChevronRight, MapPin, Building, Activity, Zap, Award, Clock } from 'lucide-react'

export default function CadastroAcademiaPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Informações pessoais
    nome: '',
    telefone: '',
    idade: '',
    sexo: '',
    altura: '',
    pesoAtual: '',
    
    // Saúde
    doencas: '',
    lesoes: '',
    medicamentos: '',
    cirurgiaRecente: false,
    liberacaoMedica: false,
    frequenciaCardio: '',
    lesoesEspecificas: '',
    medicamentosContinuos: '',
    alergias: '',
    
    // Endereço da Academia
    academiaNome: '',
    academiaEndereco: '',
    academiaLat: null as number | null,
    academiaLng: null as number | null,
    
    // Objetivos
    objetivoPrincipal: '',
    metaPeso: '',
    prazo: '',
    areasFoco: [] as string[],
    metaPesoFinal: '',
    metaData: '',
    
    // Experiência
    nivelExperiencia: '',
    diasPorSemana: '',
    tempoPorTreino: '',
    horariosDisponiveis: '',
    estiloTreino: '',
    intensidadePreferida: '',
    
    // Alimentação
    fazDieta: false,
    refeicoesPorDia: '',
    consumoAgua: '',
    consumoAcucar: '',
    consumoAlcool: '',
    querAcompanhamento: false,
    
    // Medidas iniciais
    cintura: '',
    quadril: '',
    peito: '',
    braco: '',
    perna: '',
    
    // Motivação
    motivacaoPrincipal: '',
    nivelComprometimento: 3,
    jaTentouAntes: false,
    historicoTreino: '',
    melhorResultadoAnterior: '',
    porqueParou: '',
    
    // Metas
    metaSemanal: 3,
    metaMensal: 12,
    
    // Notificações
    notificacoesPush: true,
    notificacoesWhatsApp: false,
    frequenciaNotificacoes: 'diario'
  })

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleAreaFoco = (area: string) => {
    const areas = [...formData.areasFoco]
    if (areas.includes(area)) {
      const index = areas.indexOf(area)
      areas.splice(index, 1)
    } else {
      areas.push(area)
    }
    setFormData({ ...formData, areasFoco: areas })
  }

  const buscarEndereco = () => {
    if (!formData.academiaEndereco) {
      alert('Digite o endereço primeiro')
      return
    }
    alert('📍 Em produção, aqui buscaríamos as coordenadas do endereço automaticamente')
    setFormData({
      ...formData,
      academiaLat: -23.5505,
      academiaLng: -46.6333
    })
  }

  const usarLocalizacaoAtual = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            academiaLat: position.coords.latitude,
            academiaLng: position.coords.longitude
          })
          alert('📍 Localização da academia capturada com sucesso! Check-in automático disponível.')
        },
        (error) => {
          alert('❌ Não foi possível obter sua localização. Verifique as permissões.')
        }
      )
    } else {
      alert('❌ Seu navegador não suporta geolocalização')
    }
  }

  const handleSubmit = () => {
    // Salvar dados do aluno
    localStorage.setItem('academia_cadastro', JSON.stringify(formData))
    localStorage.setItem('academia_cadastro_completo', 'true')
    
    // Criar plano de treino inicial baseado no nível e objetivos
    const plano = gerarPlanoTreino()
    localStorage.setItem('academia_plano', JSON.stringify(plano))
    
    // Criar metas iniciais
    const metas = gerarMetasIniciais()
    localStorage.setItem('academia_metas', JSON.stringify(metas))
    
    router.push('/academia')
  }

  const gerarPlanoTreino = () => {
    const treinos = []
    const nivel = formData.nivelExperiencia
    const objetivo = formData.objetivoPrincipal
    const intensidade = formData.intensidadePreferida || 'media'
    
    if (nivel === 'iniciante') {
      treinos.push({ 
        nome: 'Treino A - Superiores', 
        intensidade: intensidade,
        exercicios: [
          { nome: 'Supino Reto', series: 3, repeticoes: 12, carga: 'leve', completado: false },
          { nome: 'Puxada Frontal', series: 3, repeticoes: 12, carga: 'leve', completado: false },
          { nome: 'Desenvolvimento', series: 3, repeticoes: 12, carga: 'leve', completado: false },
          { nome: 'Rosca Direta', series: 3, repeticoes: 12, carga: 'leve', completado: false },
          { nome: 'Tríceps Corda', series: 3, repeticoes: 12, carga: 'leve', completado: false }
        ]
      })
      treinos.push({ 
        nome: 'Treino B - Inferiores', 
        intensidade: intensidade,
        exercicios: [
          { nome: 'Agachamento', series: 3, repeticoes: 12, carga: 'leve', completado: false },
          { nome: 'Leg Press', series: 3, repeticoes: 12, carga: 'leve', completado: false },
          { nome: 'Cadeira Extensora', series: 3, repeticoes: 12, carga: 'leve', completado: false },
          { nome: 'Mesa Flexora', series: 3, repeticoes: 12, carga: 'leve', completado: false },
          { nome: 'Panturrilha', series: 3, repeticoes: 15, carga: 'leve', completado: false }
        ]
      })
    } else if (nivel === 'intermediario') {
      treinos.push({ 
        nome: 'Treino A - Peito e Tríceps', 
        intensidade: intensidade,
        exercicios: [
          { nome: 'Supino Reto', series: 4, repeticoes: 10, carga: 'media', completado: false },
          { nome: 'Supino Inclinado', series: 4, repeticoes: 10, carga: 'media', completado: false },
          { nome: 'Crucifixo', series: 4, repeticoes: 12, carga: 'media', completado: false },
          { nome: 'Tríceps Corda', series: 4, repeticoes: 12, carga: 'media', completado: false },
          { nome: 'Tríceps Testa', series: 4, repeticoes: 10, carga: 'media', completado: false }
        ]
      })
      treinos.push({ 
        nome: 'Treino B - Costas e Bíceps', 
        intensidade: intensidade,
        exercicios: [
          { nome: 'Puxada Frontal', series: 4, repeticoes: 10, carga: 'media', completado: false },
          { nome: 'Remada Curvada', series: 4, repeticoes: 10, carga: 'media', completado: false },
          { nome: 'Pullover', series: 4, repeticoes: 12, carga: 'media', completado: false },
          { nome: 'Rosca Direta', series: 4, repeticoes: 12, carga: 'media', completado: false },
          { nome: 'Rosca Martelo', series: 4, repeticoes: 12, carga: 'media', completado: false }
        ]
      })
      treinos.push({ 
        nome: 'Treino C - Pernas', 
        intensidade: intensidade,
        exercicios: [
          { nome: 'Agachamento Livre', series: 4, repeticoes: 10, carga: 'media', completado: false },
          { nome: 'Leg Press', series: 4, repeticoes: 12, carga: 'media', completado: false },
          { nome: 'Cadeira Extensora', series: 4, repeticoes: 12, carga: 'media', completado: false },
          { nome: 'Mesa Flexora', series: 4, repeticoes: 12, carga: 'media', completado: false },
          { nome: 'Panturrilha em Pé', series: 4, repeticoes: 15, carga: 'media', completado: false }
        ]
      })
    } else {
      treinos.push({ 
        nome: 'Treino Avançado - Push', 
        intensidade: intensidade,
        exercicios: [
          { nome: 'Supino Reto', series: 5, repeticoes: 8, carga: 'pesada', completado: false },
          { nome: 'Supino Inclinado', series: 5, repeticoes: 8, carga: 'pesada', completado: false },
          { nome: 'Desenvolvimento', series: 5, repeticoes: 8, carga: 'pesada', completado: false },
          { nome: 'Tríceps Francês', series: 5, repeticoes: 10, carga: 'pesada', completado: false }
        ]
      })
      treinos.push({ 
        nome: 'Treino Avançado - Pull', 
        intensidade: intensidade,
        exercicios: [
          { nome: 'Barra Fixa', series: 5, repeticoes: 8, carga: 'pesada', completado: false },
          { nome: 'Remada Serrote', series: 5, repeticoes: 8, carga: 'pesada', completado: false },
          { nome: 'Rosca Alternada', series: 5, repeticoes: 10, carga: 'pesada', completado: false },
          { nome: 'Rosca Scott', series: 5, repeticoes: 10, carga: 'pesada', completado: false }
        ]
      })
      treinos.push({ 
        nome: 'Treino Avançado - Legs', 
        intensidade: intensidade,
        exercicios: [
          { nome: 'Agachamento Livre', series: 5, repeticoes: 8, carga: 'pesada', completado: false },
          { nome: 'Stiff', series: 5, repeticoes: 8, carga: 'pesada', completado: false },
          { nome: 'Leg Press 45°', series: 5, repeticoes: 10, carga: 'pesada', completado: false },
          { nome: 'Panturrilha', series: 5, repeticoes: 15, carga: 'pesada', completado: false }
        ]
      })
    }
    
    return treinos
  }

  const gerarMetasIniciais = () => {
    const metas = [
      {
        id: '1',
        titulo: `Treinar ${formData.metaSemanal}x por semana`,
        descricao: 'Manter consistência nos treinos',
        tipo: 'semanal',
        meta: formData.metaSemanal,
        atual: 0,
        unidade: 'treinos',
        prazo: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
        conquistada: false
      },
      {
        id: '2',
        titulo: formData.objetivoPrincipal === 'emagrecimento' ? 'Perder peso' : 'Ganhar massa muscular',
        descricao: `Meta de ${formData.objetivoPrincipal === 'emagrecimento' ? 'peso' : 'massa'}`,
        tipo: 'especifica',
        meta: parseFloat(formData.metaPeso) || 5,
        atual: 0,
        unidade: formData.objetivoPrincipal === 'emagrecimento' ? 'kg' : 'cm',
        prazo: formData.prazo ? new Date(new Date().setMonth(new Date().getMonth() + parseInt(formData.prazo))).toISOString().split('T')[0] : new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
        conquistada: false
      }
    ]
    return metas
  }

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center mb-4">📋 Dados Pessoais</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">Nome completo</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Digite seu nome"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Telefone (WhatsApp)</label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => handleChange('telefone', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="(00) 00000-0000"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Idade</label>
                <input
                  type="number"
                  value={formData.idade}
                  onChange={(e) => handleChange('idade', e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl"
                  placeholder="Anos"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sexo</label>
                <select
                  value={formData.sexo}
                  onChange={(e) => handleChange('sexo', e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl"
                >
                  <option value="">Selecione</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Altura (cm)</label>
                <input
                  type="number"
                  value={formData.altura}
                  onChange={(e) => handleChange('altura', e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl"
                  placeholder="cm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Peso atual (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.pesoAtual}
                  onChange={(e) => handleChange('pesoAtual', e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl"
                  placeholder="kg"
                />
              </div>
            </div>
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center mb-4">🏥 Saúde</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">Possui alguma doença?</label>
              <textarea
                value={formData.doencas}
                onChange={(e) => handleChange('doencas', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl"
                rows={2}
                placeholder="Descreva se possui alguma doença"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Lesões ou limitações físicas?</label>
              <textarea
                value={formData.lesoes}
                onChange={(e) => handleChange('lesoes', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl"
                rows={2}
                placeholder="Descreva se possui lesões"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Usa algum medicamento?</label>
              <textarea
                value={formData.medicamentos}
                onChange={(e) => handleChange('medicamentos', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl"
                rows={2}
                placeholder="Descreva medicamentos"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Frequência de atividade cardiovascular</label>
              <select
                value={formData.frequenciaCardio}
                onChange={(e) => handleChange('frequenciaCardio', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl"
              >
                <option value="">Selecione</option>
                <option value="nenhuma">Nenhuma</option>
                <option value="1-2">1-2 vezes por semana</option>
                <option value="3-4">3-4 vezes por semana</option>
                <option value="5+">5+ vezes por semana</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.cirurgiaRecente}
                  onChange={(e) => handleChange('cirurgiaRecente', e.target.checked)}
                  className="w-5 h-5"
                />
                <span>Já fez cirurgia recente?</span>
              </label>
              
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.liberacaoMedica}
                  onChange={(e) => handleChange('liberacaoMedica', e.target.checked)}
                  className="w-5 h-5"
                />
                <span>Possui liberação médica para atividade física?</span>
              </label>
            </div>
          </div>
        )
      
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center mb-4">🏢 Sua Academia</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">Nome da Academia</label>
              <input
                type="text"
                value={formData.academiaNome}
                onChange={(e) => handleChange('academiaNome', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl"
                placeholder="Ex: Smart Fit, Bluefit, Academia do Zé"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Endereço completo</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.academiaEndereco}
                  onChange={(e) => handleChange('academiaEndereco', e.target.value)}
                  className="flex-1 px-4 py-3 border rounded-xl"
                  placeholder="Rua, número, bairro, cidade"
                />
                <button
                  onClick={buscarEndereco}
                  className="px-4 bg-purple-500 text-white rounded-xl"
                >
                  Buscar
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-purple-800 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                📍 Geolocalização da Academia
              </p>
              <button
                onClick={usarLocalizacaoAtual}
                className="w-full py-2 bg-purple-500 text-white rounded-lg text-sm"
              >
                Usar localização atual da academia
              </button>
              {formData.academiaLat && (
                <p className="text-xs text-green-600 mt-2">
                  ✅ Localização capturada! Check-in automático disponível.
                </p>
              )}
            </div>
          </div>
        )
      
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center mb-4">🎯 Objetivos e Metas</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">Objetivo principal</label>
              <select
                value={formData.objetivoPrincipal}
                onChange={(e) => handleChange('objetivoPrincipal', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl"
              >
                <option value="">Selecione</option>
                <option value="emagrecimento">Emagrecimento (perda de gordura)</option>
                <option value="ganho_massa">Ganho de massa muscular</option>
                <option value="condicionamento">Condicionamento físico</option>
                <option value="definicao">Definição corporal</option>
                <option value="reabilitacao">Reabilitação</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Meta de peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.metaPeso}
                  onChange={(e) => handleChange('metaPeso', e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl"
                  placeholder="Ex: perder 8kg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Prazo (meses)</label>
                <input
                  type="number"
                  value={formData.prazo}
                  onChange={(e) => handleChange('prazo', e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl"
                  placeholder="Ex: 3 meses"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Áreas de foco</label>
              <div className="grid grid-cols-2 gap-2">
                {['Abdômen', 'Pernas', 'Braços', 'Corpo todo', 'Glúteos', 'Costas', 'Peito', 'Ombro'].map(area => (
                  <label key={area} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.areasFoco.includes(area)}
                      onChange={() => handleAreaFoco(area)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{area}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Meta semanal (dias)</label>
                <select
                  value={formData.metaSemanal}
                  onChange={(e) => handleChange('metaSemanal', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border rounded-xl"
                >
                  <option value="2">2 dias por semana</option>
                  <option value="3">3 dias por semana</option>
                  <option value="4">4 dias por semana</option>
                  <option value="5">5 dias por semana</option>
                  <option value="6">6 dias por semana</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Meta mensal (treinos)</label>
                <input
                  type="number"
                  value={formData.metaMensal}
                  onChange={(e) => handleChange('metaMensal', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border rounded-xl"
                  placeholder="Ex: 12"
                />
              </div>
            </div>
          </div>
        )
      
      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center mb-4">💪 Estilo e Intensidade</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">Nível de experiência</label>
              <select
                value={formData.nivelExperiencia}
                onChange={(e) => handleChange('nivelExperiencia', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl"
              >
                <option value="">Selecione</option>
                <option value="iniciante">Iniciante (nunca treinou)</option>
                <option value="intermediario">Intermediário (1-2 anos)</option>
                <option value="avancado">Avançado (3+ anos)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Estilo de treino preferido</label>
              <select
                value={formData.estiloTreino}
                onChange={(e) => handleChange('estiloTreino', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl"
              >
                <option value="">Selecione</option>
                <option value="musculacao">Musculação tradicional</option>
                <option value="funcional">Treino funcional</option>
                <option value="crossfit">Crossfit</option>
                <option value="calistenia">Calistenia</option>
                <option value="mix">Misto</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Intensidade preferida</label>
              <div className="grid grid-cols-3 gap-2">
                {['leve', 'media', 'alta'].map(intensidade => (
                  <button
                    key={intensidade}
                    onClick={() => handleChange('intensidadePreferida', intensidade)}
                    className={`p-3 rounded-xl text-center transition ${
                      formData.intensidadePreferida === intensidade 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {intensidade === 'leve' && '🟢 Leve'}
                    {intensidade === 'media' && '🟡 Média'}
                    {intensidade === 'alta' && '🔴 Alta'}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Dias por semana pode treinar</label>
              <select
                value={formData.diasPorSemana}
                onChange={(e) => handleChange('diasPorSemana', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl"
              >
                <option value="">Selecione</option>
                <option value="2">2 dias</option>
                <option value="3">3 dias</option>
                <option value="4">4 dias</option>
                <option value="5">5 dias</option>
                <option value="6">6 dias</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Tempo por treino</label>
              <select
                value={formData.tempoPorTreino}
                onChange={(e) => handleChange('tempoPorTreino', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl"
              >
                <option value="">Selecione</option>
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">1 hora</option>
                <option value="90">1 hora e 30</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Horários disponíveis</label>
              <input
                type="text"
                value={formData.horariosDisponiveis}
                onChange={(e) => handleChange('horariosDisponiveis', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl"
                placeholder="Ex: manhã 8-10h ou noite 19-21h"
              />
            </div>
          </div>
        )
      
      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center mb-4">🍎 Alimentação</h2>
            
            <div>
              <label className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  checked={formData.fazDieta}
                  onChange={(e) => handleChange('fazDieta', e.target.checked)}
                  className="w-5 h-5"
                />
                <span>Faz dieta atualmente?</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Quantas refeições por dia</label>
              <input
                type="number"
                value={formData.refeicoesPorDia}
                onChange={(e) => handleChange('refeicoesPorDia', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl"
                placeholder="Ex: 4"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Consumo de água (litros/dia)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.consumoAgua}
                  onChange={(e) => handleChange('consumoAgua', e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl"
                  placeholder="Ex: 2.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Consumo de açúcar</label>
                <select
                  value={formData.consumoAcucar}
                  onChange={(e) => handleChange('consumoAcucar', e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl"
                >
                  <option value="">Selecione</option>
                  <option value="baixo">Baixo</option>
                  <option value="moderado">Moderado</option>
                  <option value="alto">Alto</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Consumo de álcool</label>
              <select
                value={formData.consumoAlcool}
                onChange={(e) => handleChange('consumoAlcool', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl"
              >
                <option value="">Selecione</option>
                <option value="nao">Não consumo</option>
                <option value="social">Socialmente</option>
                <option value="frequente">Frequentemente</option>
              </select>
            </div>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.querAcompanhamento}
                onChange={(e) => handleChange('querAcompanhamento', e.target.checked)}
                className="w-5 h-5"
              />
              <span>Quer acompanhamento alimentar?</span>
            </label>
          </div>
        )
      
      case 7:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center mb-4">📏 Medidas Iniciais</h2>
            <p className="text-sm text-gray-500 text-center mb-4">Vamos registrar suas medidas para acompanhar a evolução</p>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Cintura (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.cintura}
                  onChange={(e) => handleChange('cintura', e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quadril (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.quadril}
                  onChange={(e) => handleChange('quadril', e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Peito (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.peito}
                  onChange={(e) => handleChange('peito', e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Braço (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.braco}
                  onChange={(e) => handleChange('braco', e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Perna (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.perna}
                  onChange={(e) => handleChange('perna', e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl"
                />
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-purple-800 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Dica: Tire fotos de evolução na página de Evolução
              </p>
            </div>
          </div>
        )
      
      case 8:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center mb-4">🧠 Motivação e Histórico</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">Motivação principal</label>
              <select
                value={formData.motivacaoPrincipal}
                onChange={(e) => handleChange('motivacaoPrincipal', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl"
              >
                <option value="">Selecione</option>
                <option value="saude">Saúde</option>
                <option value="estetica">Estética</option>
                <option value="autoestima">Autoestima</option>
                <option value="performance">Performance</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Nível de comprometimento (1 a 5)</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(num => (
                  <button
                    key={num}
                    onClick={() => handleChange('nivelComprometimento', num)}
                    className={`flex-1 py-2 rounded-lg font-bold ${
                      formData.nivelComprometimento === num 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Histórico de treino</label>
              <textarea
                value={formData.historicoTreino}
                onChange={(e) => handleChange('historicoTreino', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl"
                rows={2}
                placeholder="Conte sobre sua experiência anterior com treinos"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Melhor resultado que já teve</label>
              <input
                type="text"
                value={formData.melhorResultadoAnterior}
                onChange={(e) => handleChange('melhorResultadoAnterior', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl"
                placeholder="Ex: Perdi 10kg em 3 meses"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Por que parou antes?</label>
              <textarea
                value={formData.porqueParou}
                onChange={(e) => handleChange('porqueParou', e.target.value)}
                className="w-full px-4 py-3 border rounded-xl"
                rows={2}
                placeholder="Se já tentou antes, o que fez parar?"
              />
            </div>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.jaTentouAntes}
                onChange={(e) => handleChange('jaTentouAntes', e.target.checked)}
                className="w-5 h-5"
              />
              <span>Já tentou treinar antes?</span>
            </label>
            
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-3">🔔 Prefere receber notificações por:</h3>
              <label className="flex items-center gap-3 mb-2">
                <input
                  type="checkbox"
                  checked={formData.notificacoesPush}
                  onChange={(e) => handleChange('notificacoesPush', e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Push (notificações no app)</span>
              </label>
              <label className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  checked={formData.notificacoesWhatsApp}
                  onChange={(e) => handleChange('notificacoesWhatsApp', e.target.checked)}
                  className="w-4 h-4"
                />
                <span>WhatsApp</span>
              </label>
              
              <select
                value={formData.frequenciaNotificacoes}
                onChange={(e) => handleChange('frequenciaNotificacoes', e.target.value)}
                className="w-full px-4 py-2 border rounded-xl"
              >
                <option value="diario">Diário</option>
                <option value="semanal">Semanal</option>
              </select>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-gradient-to-r from-purple-500 to-pink-500 text-white sticky top-0 z-20">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href="/academia" className="p-2 hover:bg-white/20 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-lg">Cadastro Academia</span>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto">
        {/* Progresso */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Passo {step} de 8</span>
            <span>{Math.round((step/8)*100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full h-2 transition-all"
              style={{ width: `${(step/8)*100}%` }}
            />
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {renderStep()}
          
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 py-3 bg-gray-200 rounded-xl font-semibold"
              >
                Voltar
              </button>
            )}
            {step < 8 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold"
              >
                Próximo
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <ChevronRight className="w-5 h-5" />
                Finalizar Cadastro
              </button>
            )}
          </div>
        </div>

        {/* Dica */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-800">
            💡 Todas as informações são seguras e usadas apenas para personalizar seu treino e acompanhar sua evolução.
          </p>
        </div>
      </main>
    </div>
  )
}