'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Briefcase, UserPlus, Users, Search, Filter,
  Plus, Calendar, MapPin, DollarSign, Clock, Star,
  FileText, Download, Upload, Check, X, CreditCard,
  Building, GraduationCap, Award, Target, TrendingUp, Edit2
} from 'lucide-react'

interface Curriculo {
  id: string
  nome: string
  email: string
  telefone: string
  cpf: string
  dataNascimento: string
  endereco: {
    rua: string
    bairro: string
    cidade: string
    estado: string
    cep: string
  }
  formacao: {
    nivel: string
    curso: string
    instituicao: string
    conclusao: string
  }
  experiencia: Array<{
    empresa: string
    cargo: string
    periodo: string
    descricao: string
  }>
  habilidades: string[]
  pretensaoSalarial: string
  areaInteresse: string
  disponibilidade: string
  status: 'pendente' | 'aprovado' | 'rejeitado'
  dataCadastro: string
}

interface Vaga {
  id: string
  titulo: string
  empresa: string
  descricao: string
  requisitos: string[]
  beneficios: string[]
  salario: string
  tipo: 'presencial' | 'remoto' | 'hibrido'
  cargaHoraria: string
  localizacao: string
  area: string
  status: 'ativa' | 'pausada' | 'encerrada'
  dataCadastro: string
  dataLimite: string
  candidaturas: number
}

export default function EmpregosPage() {
  const router = useRouter()
  const [abaAtiva, setAbaAtiva] = useState<'curriculos' | 'vagas' | 'disponiveis' | 'candidatos'>('curriculos')
  const [curriculos, setCurriculos] = useState<Curriculo[]>([])
  const [vagas, setVagas] = useState<Vaga[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarFormularioCurriculo, setMostrarFormularioCurriculo] = useState(false)
  const [mostrarFormularioVaga, setMostrarFormularioVaga] = useState(false)
  const [mostrarPagamento, setMostrarPagamento] = useState<'curriculo' | 'vaga' | null>(null)
  const [loadingPagamento, setLoadingPagamento] = useState(false)
  const [curriculoCadastrado, setCurriculoCadastrado] = useState(false)
  const [vagaCadastrada, setVagaCadastrada] = useState(false)
  const [editandoCurriculo, setEditandoCurriculo] = useState(false)
  const [experiencias, setExperiencias] = useState([{ empresa: '', cargo: '', periodo: '', descricao: '' }])
  const [habilidades, setHabilidades] = useState([''])
  const [mostrarComprovante, setMostrarComprovante] = useState(false)
  const [comprovanteFile, setComprovanteFile] = useState<File | null>(null)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = () => {
    try {
      // Dados mockados para demonstração
      const curriculosMock: Curriculo[] = [
        {
          id: '1',
          nome: 'João Silva',
          email: 'joao@email.com',
          telefone: '(75) 98765-4321',
          cpf: '123.456.789-00',
          dataNascimento: '1990-05-15',
          endereco: {
            rua: 'Rua Principal, 123',
            bairro: 'Centro',
            cidade: 'Coité',
            estado: 'BA',
            cep: '48730-000'
          },
          formacao: {
            nivel: 'Superior Completo',
            curso: 'Administração',
            instituicao: 'UNEB',
            conclusao: '2015'
          },
          experiencia: [
            {
              empresa: 'Empresa A',
              cargo: 'Auxiliar Administrativo',
              periodo: '2016-2020',
              descricao: 'Responsável pelo controle de documentos e atendimento ao cliente.'
            }
          ],
          habilidades: ['Microsoft Office', 'Atendimento ao Cliente', 'Organização'],
          pretensaoSalarial: 'R$ 1.500,00',
          areaInteresse: 'Administrativo',
          disponibilidade: 'Integral',
          status: 'pendente',
          dataCadastro: '2026-04-20'
        }
      ]

      const vagasMock: Vaga[] = [
        {
          id: '1',
          titulo: 'Auxiliar Administrativo',
          empresa: 'Empresa Local Ltda',
          descricao: 'Buscamos profissional para auxiliar nas tarefas administrativas do escritório.',
          requisitos: ['Ensino Médio Completo', 'Conhecimento em Office', 'Boa comunicação'],
          beneficios: ['Vale Transporte', 'Vale Refeição', 'Plano de Saúde'],
          salario: 'R$ 1.200,00 - R$ 1.800,00',
          tipo: 'presencial',
          cargaHoraria: '40h semanais',
          localizacao: 'Coité, BA',
          area: 'Administrativo',
          status: 'ativa',
          dataCadastro: '2026-04-22',
          dataLimite: '2026-05-22',
          candidaturas: 5
        }
      ]

      setCurriculos(curriculosMock)
      setVagas(vagasMock)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCadastroCurriculo = () => {
    setMostrarFormularioCurriculo(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCadastroVaga = () => {
    setMostrarPagamento('vaga')
  }

  const handleConfirmarPagamento = async (tipo: 'curriculo' | 'vaga') => {
    setLoadingPagamento(true)
    try {
      const price = tipo === 'curriculo' ? 10.00 : 20.00
      const title = tipo === 'curriculo' ? 'Cadastro de Currículo' : 'Cadastro de Vaga'
      
      const dados = tipo === 'curriculo' 
        ? { nome: 'Usuário Teste', email: 'teste@email.com' }
        : { titulo: 'Vaga Teste', empresa: 'Empresa Teste' }
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          price,
          quantity: 1,
          tipo,
          dados
        })
      })

      const data = await response.json()

      if (data.pagamento) {
        // Salva pagamento pendente no localStorage
        const pagamentosSalvos = localStorage.getItem('pagamentos_pendentes')
        const pagamentos = pagamentosSalvos ? JSON.parse(pagamentosSalvos) : []
        pagamentos.push(data.pagamento)
        localStorage.setItem('pagamentos_pendentes', JSON.stringify(pagamentos))
      }

      if (data.init_point) {
        window.location.href = data.init_point
      } else {
        alert('Erro ao processar pagamento')
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error)
      alert('Erro ao processar pagamento')
    } finally {
      setLoadingPagamento(false)
    }
  }

  const handleCopiarPix = () => {
    const pixKey = 'df79fd53-2ce0-4013-b906-44f8076e28a1'
    navigator.clipboard.writeText(pixKey)
    alert('Chave PIX copiada para a área de transferência!')
  }

  const handleSalvarCurriculo = () => {
    setCurriculoCadastrado(true)
    setEditandoCurriculo(true)
    setMostrarFormularioCurriculo(false)
  }

  const handleEditarCurriculo = () => {
    setMostrarFormularioCurriculo(true)
  }

  const handleAdicionarExperiencia = () => {
    setExperiencias([...experiencias, { empresa: '', cargo: '', periodo: '', descricao: '' }])
  }

  const handleRemoverExperiencia = (index: number) => {
    setExperiencias(experiencias.filter((_, i) => i !== index))
  }

  const handleAtualizarExperiencia = (index: number, field: string, value: string) => {
    const novasExperiencias = [...experiencias]
    novasExperiencias[index] = { ...novasExperiencias[index], [field]: value }
    setExperiencias(novasExperiencias)
  }

  const handleAdicionarHabilidade = () => {
    setHabilidades([...habilidades, ''])
  }

  const handleRemoverHabilidade = (index: number) => {
    setHabilidades(habilidades.filter((_, i) => i !== index))
  }

  const handleAtualizarHabilidade = (index: number, value: string) => {
    const novasHabilidades = [...habilidades]
    novasHabilidades[index] = value
    setHabilidades(novasHabilidades)
  }

  const handleUploadComprovante = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setComprovanteFile(e.target.files[0])
    }
  }

  const handleEnviarComprovante = () => {
    if (comprovanteFile) {
      alert('Comprovante enviado com sucesso! Aguardando validação.')
      setMostrarComprovante(false)
      setComprovanteFile(null)
    } else {
      alert('Por favor, selecione um arquivo de comprovante.')
    }
  }

  const renderCardCadastro = (titulo: string, descricao: string, preco: string, tipo: 'curriculo' | 'vaga') => {
    const isGerenciar = titulo.includes('Gerenciar')
    const isCadastrar = titulo.includes('Cadastrar')
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
          {tipo === 'curriculo' ? <FileText className="w-6 h-6 text-blue-500" /> : <Briefcase className="w-6 h-6 text-green-500" />}
        </div>
        <p className="text-gray-600 mb-4">{descricao}</p>
        <div className="space-y-3">
          {isCadastrar && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Taxa de cadastro:</span>
              <span className="text-xl font-bold text-gray-900">{preco}/mês</span>
            </div>
          )}
          {isGerenciar ? (
            <button
              onClick={() => tipo === 'curriculo' ? handleCadastroCurriculo() : handleCadastroVaga()}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              <span>Realize o pagamento aqui</span>
            </button>
          ) : (
            <button
              onClick={() => tipo === 'curriculo' ? handleCadastroCurriculo() : handleCadastroVaga()}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar {tipo === 'curriculo' ? 'Currículo' : 'Vaga'}</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  const renderListaCurriculos = () => (
    <div className="space-y-4">
      {curriculos.map((curriculo) => (
        <div key={curriculo.id} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{curriculo.nome}</h3>
              <p className="text-gray-600">{curriculo.email} • {curriculo.telefone}</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  <span>{curriculo.formacao.curso} • {curriculo.formacao.nivel}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Target className="w-4 h-4 mr-2" />
                  <span>Área: {curriculo.areaInteresse}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span>Pretensão: {curriculo.pretensaoSalarial}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                curriculo.status === 'aprovado' ? 'bg-green-100 text-green-800' :
                curriculo.status === 'rejeitado' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {curriculo.status.charAt(0).toUpperCase() + curriculo.status.slice(1)}
              </span>
              <button className="text-blue-600 hover:text-blue-800 text-sm">
                Ver detalhes
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderListaVagas = () => (
    <div className="space-y-4">
      {vagas.map((vaga) => (
        <div key={vaga.id} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{vaga.titulo}</h3>
              <p className="text-gray-600">{vaga.empresa} • {vaga.localizacao}</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span>{vaga.salario}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{vaga.cargaHoraria} • {vaga.tipo}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span>{vaga.candidaturas} candidaturas</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                vaga.status === 'ativa' ? 'bg-green-100 text-green-800' :
                vaga.status === 'pausada' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {vaga.status.charAt(0).toUpperCase() + vaga.status.slice(1)}
              </span>
              <button className="text-blue-600 hover:text-blue-800 text-sm">
                Ver detalhes
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Empregos e Oportunidades</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Abas */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'curriculos', label: 'Cadastro de Currículo', icon: FileText },
                { id: 'vagas', label: 'Cadastro de Vagas', icon: Briefcase },
                { id: 'disponiveis', label: 'Vagas Disponíveis', icon: Search },
                { id: 'candidatos', label: 'Candidatos Disponíveis', icon: Users }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAbaAtiva(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    abaAtiva === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Conteúdo das Abas */}
        {abaAtiva === 'curriculos' && (
          <div className="space-y-6">
            {!mostrarFormularioCurriculo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderCardCadastro(
                  'Cadastrar Currículo',
                  'Destaque seu perfil para empresas da região. Cadastre suas informações profissionais e seja encontrado.',
                  'R$ 10,00',
                  'curriculo'
                )}
                {renderCardCadastro(
                  'Gerenciar Currículos',
                  'Visualize e edite seus currículos cadastrados. Acompanhe o status das suas candidaturas.',
                  '',
                  'curriculo'
                )}
              </div>
            )}
            
            {/* Formulário de Currículo na página */}
            {mostrarFormularioCurriculo && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Cadastro de Currículo</h3>
                  <button
                    onClick={() => setMostrarFormularioCurriculo(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Dados Pessoais */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Dados Pessoais</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                        <input type="tel" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                        <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                      </div>
                    </div>
                  </div>

                  {/* Endereço */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Endereço</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rua</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                      </div>
                    </div>
                  </div>

                  {/* Formação */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Formação Acadêmica</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Formação</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900">
                          <option>Ensino Fundamental</option>
                          <option>Ensino Médio</option>
                          <option>Superior Incompleto</option>
                          <option>Superior Completo</option>
                          <option>Pós-graduação</option>
                          <option>Mestrado</option>
                          <option>Doutorado</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Instituição</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ano de Conclusão</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                      </div>
                    </div>
                  </div>

                  {/* Experiência Profissional */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">Experiência Profissional</h4>
                      <button
                        onClick={handleAdicionarExperiencia}
                        className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Adicionar Experiência</span>
                      </button>
                    </div>
                    <div className="space-y-4">
                      {experiencias.map((exp, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                          {experiencias.length > 1 && (
                            <button
                              onClick={() => handleRemoverExperiencia(index)}
                              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                              <input
                                type="text"
                                value={exp.empresa}
                                onChange={(e) => handleAtualizarExperiencia(index, 'empresa', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                              <input
                                type="text"
                                value={exp.cargo}
                                onChange={(e) => handleAtualizarExperiencia(index, 'cargo', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                              <input
                                type="text"
                                placeholder="Ex: 2018-2022"
                                value={exp.periodo}
                                onChange={(e) => handleAtualizarExperiencia(index, 'periodo', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                              />
                            </div>
                          </div>
                          <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição das Atividades</label>
                            <textarea
                              rows={3}
                              value={exp.descricao}
                              onChange={(e) => handleAtualizarExperiencia(index, 'descricao', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Habilidades e Preferências */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900">Habilidades e Preferências</h4>
                      <button
                        onClick={handleAdicionarHabilidade}
                        className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Adicionar Habilidade</span>
                      </button>
                    </div>
                    <div className="space-y-2 mb-4">
                      {habilidades.map((habilidade, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={habilidade}
                            onChange={(e) => handleAtualizarHabilidade(index, e.target.value)}
                            placeholder="Ex: Microsoft Office"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          />
                          {habilidades.length > 1 && (
                            <button
                              onClick={() => handleRemoverHabilidade(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Área de Interesse</label>
                        <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pretensão Salarial</label>
                        <input type="text" placeholder="Ex: R$ 1.500,00" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidade</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900">
                          <option>Integral</option>
                          <option>Meio Período</option>
                          <option>Período Noturno</option>
                          <option>Fim de Semana</option>
                          <option>Flexível</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setMostrarFormularioCurriculo(false)}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSalvarCurriculo}
                      className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>{editandoCurriculo ? 'Editar Currículo' : 'Salvar Currículo'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Seção após salvar currículo */}
            {curriculoCadastrado && !mostrarFormularioCurriculo && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Currículo Salvo</h3>
                  <button
                    onClick={() => setCurriculoCadastrado(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-green-800">
                      <Check className="w-5 h-5" />
                      <span className="font-medium">Currículo salvo com sucesso!</span>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={handleEditarCurriculo}
                      className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Editar Currículo</span>
                    </button>
                    
                    <button
                      onClick={() => setMostrarPagamento('curriculo')}
                      className="flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Realize o pagamento para seu currículo ser exibido</span>
                    </button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Chave PIX para Pagamento</h4>
                    <div className="flex items-center justify-between">
                      <code className="text-sm text-blue-800 bg-blue-100 px-3 py-2 rounded">
                        df79fd53-2ce0-4013-b906-44f8076e28a1
                      </code>
                      <button
                        onClick={handleCopiarPix}
                        className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 mb-2">Enviar Comprovante</h4>
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleUploadComprovante}
                        className="w-full px-3 py-2 border border-yellow-300 rounded-lg"
                      />
                      <button
                        onClick={handleEnviarComprovante}
                        className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                      >
                        Enviar Comprovante
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {abaAtiva === 'vagas' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderCardCadastro(
              'Cadastrar Vaga',
              'Divulgue oportunidades de emprego para a comunidade local. Alcance os melhores talentos.',
              'R$ 20,00',
              'vaga'
            )}
            {renderCardCadastro(
              'Gerenciar Vagas',
              'Acompanhe suas vagas ativas, visualize candidaturas e gerencie o processo seletivo.',
              '',
              'vaga'
            )}
          </div>
        )}

        {abaAtiva === 'disponiveis' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Vagas Disponíveis</h2>
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  <Filter className="w-4 h-4" />
                  <span>Filtrar</span>
                </button>
              </div>
            </div>
            {renderListaVagas()}
          </div>
        )}

        {abaAtiva === 'candidatos' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Candidatos Disponíveis</h2>
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  <Filter className="w-4 h-4" />
                  <span>Filtrar</span>
                </button>
              </div>
            </div>
            {renderListaCurriculos()}
          </div>
        )}
      </div>

      {/* Modal de Pagamento */}
      {mostrarPagamento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirmar Pagamento
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {mostrarPagamento === 'curriculo' ? 'Cadastro de Currículo' : 'Cadastro de Vaga'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {mostrarPagamento === 'curriculo' ? 'R$ 10,00' : 'R$ 20,00'}
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Pagamento via Mercado Pago</h4>
                  <p className="text-sm text-blue-800 mb-4">
                    Você será redirecionado para o checkout seguro do Mercado Pago.
                  </p>
                  <div className="bg-blue-100 rounded-lg p-3 text-xs text-blue-700">
                    <p><strong>Usuário de teste:</strong> TESTUSER6931588286126056461</p>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setMostrarPagamento(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleConfirmarPagamento(mostrarPagamento)}
                    disabled={loadingPagamento}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingPagamento ? 'Processando...' : 'Pagar com Mercado Pago'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Formulário de Vaga */}
      {mostrarFormularioVaga && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Cadastro de Vaga</h3>
                <button
                  onClick={() => setMostrarFormularioVaga(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Informações Básicas */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Informações da Vaga</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Título da Vaga</label>
                      <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                      <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option>Administrativo</option>
                        <option>Vendas</option>
                        <option>Tecnologia</option>
                        <option>Saúde</option>
                        <option>Educação</option>
                        <option>Construção Civil</option>
                        <option>Comércio</option>
                        <option>Serviços Gerais</option>
                        <option>Outros</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Contrato</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option>CLT</option>
                        <option>PJ</option>
                        <option>Estágio</option>
                        <option>Temporário</option>
                        <option>Freelancer</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição da Vaga</label>
                  <textarea rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>

                {/* Requisitos e Benefícios */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Requisitos (separados por vírgula)</label>
                    <textarea rows={3} placeholder="Ex: Ensino Médio, Experiência anterior, Boa comunicação" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Benefícios (separados por vírgula)</label>
                    <textarea rows={3} placeholder="Ex: Vale Transporte, Vale Refeição, Plano de Saúde" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>

                {/* Condições */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Faixa Salarial</label>
                    <input type="text" placeholder="Ex: R$ 1.200,00 - R$ 1.800,00" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Carga Horária</label>
                    <input type="text" placeholder="Ex: 40h semanais" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Trabalho</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>Presencial</option>
                      <option>Remoto</option>
                      <option>Híbrido</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                    <input type="text" placeholder="Ex: Coité, BA" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Limite para Candidaturas</label>
                    <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                  </div>
                </div>

                {/* Botões */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => setMostrarFormularioVaga(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      // Salvar vaga
                      alert('Vaga cadastrada com sucesso!')
                      setMostrarFormularioVaga(false)
                    }}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Salvar Vaga
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
