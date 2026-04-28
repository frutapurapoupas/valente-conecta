'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Search, Filter, Plus, Edit, Trash2, Eye, Heart,
  Car, Truck, Bike, MapPin, Calendar, DollarSign,
  ChevronRight, X, Camera, Image as ImageIcon, Star,
  Shield, Fuel, Settings, Navigation, Clock, BarChart3, ArrowLeft, PhoneCall
} from 'lucide-react'

interface Veiculo {
  id: string
  tipo: 'carro' | 'moto' | 'caminhao' | 'van'
  marca: string
  modelo: string
  ano: number
  cor: string
  placa: string
  quilometragem: number
  combustivel: 'gasolina' | 'alcool' | 'diesel' | 'flex' | 'eletrico'
  cambio: 'manual' | 'automatico'
  preco: number
  tipoAnuncio: 'venda' | 'aluguel'
  status: 'disponivel' | 'alugado' | 'vendido' | 'manutencao'
  imagens: string[]
  descricao: string
  proprietario: {
    nome: string
    telefone: string
    email: string
  }
  localizacao: {
    cidade: string
    estado: string
    bairro: string
  }
  dataCadastro: string
  visualizacoes: number
  favoritos: number
}

export default function VeiculosPage() {
  const router = useRouter()
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [veiculosFiltrados, setVeiculosFiltrados] = useState<Veiculo[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [filtroAnuncio, setFiltroAnuncio] = useState<string>('todos')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<Veiculo | null>(null)
  const [mostrarModal, setMostrarModal] = useState(false)

  useEffect(() => {
    carregarVeiculos()
  }, [])

  useEffect(() => {
    aplicarFiltros()
  }, [veiculos, busca, filtroTipo, filtroAnuncio, filtroStatus])

  const carregarVeiculos = () => {
    try {
      // Dados mockados para demonstração
      const dadosMock: Veiculo[] = [
        {
          id: '1',
          tipo: 'carro',
          marca: 'Volkswagen',
          modelo: 'Gol',
          ano: 2022,
          cor: 'Branco',
          placa: 'ABC-1234',
          quilometragem: 15000,
          combustivel: 'flex',
          cambio: 'manual',
          preco: 45000,
          tipoAnuncio: 'venda',
          status: 'disponivel',
          imagens: ['/api/placeholder/400/300'],
          descricao: 'Gol 2022 em excelente estado, único dono, revisões em dia.',
          proprietario: {
            nome: 'João Silva',
            telefone: '(75) 98765-4321',
            email: 'joao@email.com'
          },
          localizacao: {
            cidade: 'Coité',
            estado: 'BA',
            bairro: 'Centro'
          },
          dataCadastro: '2026-04-20',
          visualizacoes: 245,
          favoritos: 12
        },
        {
          id: '2',
          tipo: 'moto',
          marca: 'Honda',
          modelo: 'CG 160',
          ano: 2023,
          cor: 'Vermelha',
          placa: 'DEF-5678',
          quilometragem: 8000,
          combustivel: 'gasolina',
          cambio: 'manual',
          preco: 12000,
          tipoAnuncio: 'venda',
          status: 'disponivel',
          imagens: ['/api/placeholder/400/300'],
          descricao: 'CG 160 2023, pouca quilometragem, documentos em dia.',
          proprietario: {
            nome: 'Maria Santos',
            telefone: '(75) 91234-5678',
            email: 'maria@email.com'
          },
          localizacao: {
            cidade: 'Coité',
            estado: 'BA',
            bairro: 'São José'
          },
          dataCadastro: '2026-04-22',
          visualizacoes: 189,
          favoritos: 8
        },
        {
          id: '3',
          tipo: 'caminhao',
          marca: 'Volvo',
          modelo: 'FH 540',
          ano: 2021,
          cor: 'Azul',
          placa: 'GHI-9012',
          quilometragem: 120000,
          combustivel: 'diesel',
          cambio: 'manual',
          preco: 350000,
          tipoAnuncio: 'venda',
          status: 'disponivel',
          imagens: ['/api/placeholder/400/300'],
          descricao: 'Caminhão Volvo FH 540, ótimo para cargas pesadas, bem conservado.',
          proprietario: {
            nome: 'Transportes Ltda',
            telefone: '(75) 97654-3210',
            email: 'contato@transportes.com'
          },
          localizacao: {
            cidade: 'Coité',
            estado: 'BA',
            bairro: 'Distrito Industrial'
          },
          dataCadastro: '2026-04-18',
          visualizacoes: 156,
          favoritos: 5
        },
        {
          id: '4',
          tipo: 'carro',
          marca: 'Chevrolet',
          modelo: 'Onix',
          ano: 2023,
          cor: 'Prata',
          placa: 'JKL-3456',
          quilometragem: 20000,
          combustivel: 'flex',
          cambio: 'automatico',
          preco: 65000,
          tipoAnuncio: 'aluguel',
          status: 'disponivel',
          imagens: ['/api/placeholder/400/300'],
          descricao: 'Onix 2023 automático, ar-condicionado, direção hidráulica.',
          proprietario: {
            nome: 'Locadora Valente',
            telefone: '(75) 98876-5432',
            email: 'locadora@valente.com'
          },
          localizacao: {
            cidade: 'Coité',
            estado: 'BA',
            bairro: 'Centro'
          },
          dataCadastro: '2026-04-25',
          visualizacoes: 312,
          favoritos: 18
        },
        {
          id: '5',
          tipo: 'van',
          marca: 'Fiat',
          modelo: 'Ducato',
          ano: 2022,
          cor: 'Branca',
          placa: 'MNO-7890',
          quilometragem: 45000,
          combustivel: 'diesel',
          cambio: 'manual',
          preco: 85000,
          tipoAnuncio: 'venda',
          status: 'disponivel',
          imagens: ['/api/placeholder/400/300'],
          descricao: 'Fiat Ducato 2022, van utilitária, ideal para transporte de cargas.',
          proprietario: {
            nome: 'Empreiteiros Unidos',
            telefone: '(75) 92345-6789',
            email: 'contato@empreiteiros.com'
          },
          localizacao: {
            cidade: 'Coité',
            estado: 'BA',
            bairro: 'São Pedro'
          },
          dataCadastro: '2026-04-21',
          visualizacoes: 98,
          favoritos: 3
        }
      ]
      
      setVeiculos(dadosMock)
    } catch (error) {
      console.error('Erro ao carregar veículos:', error)
    } finally {
      setLoading(false)
    }
  }

  const aplicarFiltros = () => {
    let filtrados = [...veiculos]

    // Filtro de busca
    if (busca) {
      filtrados = filtrados.filter(veiculo => 
        veiculo.marca.toLowerCase().includes(busca.toLowerCase()) ||
        veiculo.modelo.toLowerCase().includes(busca.toLowerCase()) ||
        veiculo.placa.toLowerCase().includes(busca.toLowerCase()) ||
        veiculo.descricao.toLowerCase().includes(busca.toLowerCase())
      )
    }

    // Filtro de tipo
    if (filtroTipo !== 'todos') {
      filtrados = filtrados.filter(veiculo => veiculo.tipo === filtroTipo)
    }

    // Filtro de tipo de anúncio
    if (filtroAnuncio !== 'todos') {
      filtrados = filtrados.filter(veiculo => veiculo.tipoAnuncio === filtroAnuncio)
    }

    // Filtro de status
    if (filtroStatus !== 'todos') {
      filtrados = filtrados.filter(veiculo => veiculo.status === filtroStatus)
    }

    setVeiculosFiltrados(filtrados)
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'carro': return <Car className="w-5 h-5" />
      case 'moto': return <Bike className="w-5 h-5" />
      case 'caminhao': return <Truck className="w-5 h-5" />
      case 'van': return <Truck className="w-5 h-5" />
      default: return <Car className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponivel': return 'text-green-600 bg-green-50'
      case 'alugado': return 'text-blue-600 bg-blue-50'
      case 'vendido': return 'text-gray-600 bg-gray-50'
      case 'manutencao': return 'text-orange-600 bg-orange-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getAnuncioColor = (tipo: string) => {
    switch (tipo) {
      case 'venda': return 'text-purple-600 bg-purple-50'
      case 'aluguel': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Carregando veículos...</p>
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
              <h1 className="text-xl font-semibold text-gray-900">Veículos</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Plus className="w-4 h-4" />
                <span>Novo Anúncio</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      {mostrarFiltros && (
        <div className="bg-white border-b shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Marca, modelo, placa..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Veículo</label>
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="todos">Todos</option>
                  <option value="carro">Carro</option>
                  <option value="moto">Moto</option>
                  <option value="caminhao">Caminhão</option>
                  <option value="van">Van</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Anúncio</label>
                <select
                  value={filtroAnuncio}
                  onChange={(e) => setFiltroAnuncio(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="todos">Todos</option>
                  <option value="venda">Venda</option>
                  <option value="aluguel">Aluguel</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="todos">Todos</option>
                  <option value="disponivel">Disponível</option>
                  <option value="alugado">Alugado</option>
                  <option value="vendido">Vendido</option>
                  <option value="manutencao">Manutenção</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <Car className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Veículos</p>
                <p className="text-2xl font-semibold text-gray-900">{veiculos.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valor Médio</p>
                <p className="text-2xl font-semibold text-gray-900">
                  R$ {Math.round(veiculos.reduce((acc, v) => acc + v.preco, 0) / veiculos.length).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Visualizações</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {veiculos.reduce((acc, v) => acc + v.visualizacoes, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-lg p-3">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Favoritos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {veiculos.reduce((acc, v) => acc + v.favoritos, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Veículos */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Veículos ({veiculosFiltrados.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {veiculosFiltrados.map((veiculo) => (
              <div key={veiculo.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {/* Imagem */}
                <div className="relative h-48 bg-gray-100">
                  <img 
                    src={veiculo.imagens[0]} 
                    alt={veiculo.modelo}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAnuncioColor(veiculo.tipoAnuncio)}`}>
                      {veiculo.tipoAnuncio === 'venda' ? 'Venda' : 'Aluguel'}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(veiculo.status)}`}>
                      {veiculo.status.charAt(0).toUpperCase() + veiculo.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Informações */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {veiculo.marca} {veiculo.modelo}
                    </h3>
                    {getTipoIcon(veiculo.tipo)}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Ano:</span>
                      <span className="font-medium">{veiculo.ano}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>KM:</span>
                      <span className="font-medium">{veiculo.quilometragem.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Combustível:</span>
                      <span className="font-medium capitalize">{veiculo.combustivel}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Câmbio:</span>
                      <span className="font-medium capitalize">{veiculo.cambio}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-gray-900">
                        R$ {veiculo.preco.toLocaleString()}
                      </span>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Eye className="w-3 h-3" />
                        <span>{veiculo.visualizacoes}</span>
                        <Heart className="w-3 h-3" />
                        <span>{veiculo.favoritos}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{veiculo.localizacao.cidade}, {veiculo.localizacao.estado}</span>
                    </div>

                    <button
                      onClick={() => {
                        setVeiculoSelecionado(veiculo)
                        setMostrarModal(true)
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Detalhes</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {mostrarModal && veiculoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                {veiculoSelecionado.marca} {veiculoSelecionado.modelo}
              </h3>
              <button
                onClick={() => setMostrarModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Galeria de Imagens */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {veiculoSelecionado.imagens.map((imagem, index) => (
                    <div key={index} className="aspect-w-16 aspect-h-12">
                      <img 
                        src={imagem} 
                        alt={`${veiculoSelecionado.modelo} ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Informações Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Informações do Veículo</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo:</span>
                      <span className="font-medium capitalize">{veiculoSelecionado.tipo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Marca/Modelo:</span>
                      <span className="font-medium">{veiculoSelecionado.marca} {veiculoSelecionado.modelo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ano:</span>
                      <span className="font-medium">{veiculoSelecionado.ano}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cor:</span>
                      <span className="font-medium">{veiculoSelecionado.cor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Placa:</span>
                      <span className="font-medium">{veiculoSelecionado.placa}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quilometragem:</span>
                      <span className="font-medium">{veiculoSelecionado.quilometragem.toLocaleString()} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Combustível:</span>
                      <span className="font-medium capitalize">{veiculoSelecionado.combustivel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Câmbio:</span>
                      <span className="font-medium capitalize">{veiculoSelecionado.cambio}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Informações do Anúncio</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAnuncioColor(veiculoSelecionado.tipoAnuncio)}`}>
                        {veiculoSelecionado.tipoAnuncio === 'venda' ? 'Venda' : 'Aluguel'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(veiculoSelecionado.status)}`}>
                        {veiculoSelecionado.status.charAt(0).toUpperCase() + veiculoSelecionado.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Preço:</span>
                      <span className="text-xl font-bold text-gray-900">
                        R$ {veiculoSelecionado.preco.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Visualizações:</span>
                      <span className="font-medium">{veiculoSelecionado.visualizacoes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Favoritos:</span>
                      <span className="font-medium">{veiculoSelecionado.favoritos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data Cadastro:</span>
                      <span className="font-medium">
                        {new Date(veiculoSelecionado.dataCadastro).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Descrição</h4>
                <p className="text-gray-600">{veiculoSelecionado.descricao}</p>
              </div>

              {/* Localização */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Localização</h4>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>
                    {veiculoSelecionado.localizacao.bairro}, {veiculoSelecionado.localizacao.cidade} - {veiculoSelecionado.localizacao.estado}
                  </span>
                </div>
              </div>

              {/* Proprietário */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Contato do Proprietário</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium mr-2">Nome:</span>
                    <span>{veiculoSelecionado.proprietario.nome}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium mr-2">Telefone:</span>
                    <span>{veiculoSelecionado.proprietario.telefone}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium mr-2">Email:</span>
                    <span>{veiculoSelecionado.proprietario.email}</span>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex space-x-4">
                <button className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <PhoneCall className="w-4 h-4" />
                  <span>Entrar em Contato</span>
                </button>
                <button className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Heart className="w-4 h-4" />
                  <span>Favoritar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
