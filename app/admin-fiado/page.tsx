'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Monitor, 
  DollarSign,
  Calendar,
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  TrendingUp,
  AlertCircle,
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'

interface VendaFiado {
  id: string
  clienteNome: string
  clienteTelefone: string
  valor: number
  data: string
  vencimento: string
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado'
  itens: Array<{
    id: string
    nome: string
    quantidade: number
    valor: number
  }>
  dataPagamento?: string
  observacoes?: string
}

interface Estatisticas {
  totalVendas: number
  totalValor: number
  totalPendente: number
  totalPago: number
  totalVencido: number
  mediaValor: number
}

export default function AdminFiado() {
  const router = useRouter()
  const [vendas, setVendas] = useState<VendaFiado[]>([])
  const [vendasFiltradas, setVendasFiltradas] = useState<VendaFiado[]>([])
  const [estatisticas, setEstatisticas] = useState<Estatisticas>({
    totalVendas: 0,
    totalValor: 0,
    totalPendente: 0,
    totalPago: 0,
    totalVencido: 0,
    mediaValor: 0
  })
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [filtroMes, setFiltroMes] = useState<string>('')
  const [filtroAno, setFiltroAno] = useState<string>('')
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [vendaSelecionada, setVendaSelecionada] = useState<VendaFiado | null>(null)

  useEffect(() => {
    carregarVendas()
  }, [])

  useEffect(() => {
    aplicarFiltros()
  }, [vendas, busca, filtroStatus, filtroMes, filtroAno])

  const carregarVendas = () => {
    try {
      const vendasSalvas = localStorage.getItem('vendas_fiadas')
      if (vendasSalvas) {
        const listaVendas: VendaFiado[] = JSON.parse(vendasSalvas)
        setVendas(listaVendas)
        calcularEstatisticas(listaVendas)
      }
    } catch (error) {
      console.error('Erro ao carregar vendas:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularEstatisticas = (lista: VendaFiado[]) => {
    const stats = lista.reduce((acc, venda) => {
      acc.totalVendas++
      acc.totalValor += venda.valor
      
      switch (venda.status) {
        case 'pendente':
          acc.totalPendente += venda.valor
          break
        case 'pago':
          acc.totalPago += venda.valor
          break
        case 'vencido':
          acc.totalVencido += venda.valor
          break
      }
      
      return acc
    }, {
      totalVendas: 0,
      totalValor: 0,
      totalPendente: 0,
      totalPago: 0,
      totalVencido: 0,
      mediaValor: 0
    })

    stats.mediaValor = stats.totalVendas > 0 ? stats.totalValor / stats.totalVendas : 0
    setEstatisticas(stats)
  }

  const aplicarFiltros = () => {
    let filtradas = [...vendas]

    // Filtro de busca
    if (busca) {
      filtradas = filtradas.filter(venda => 
        venda.clienteNome.toLowerCase().includes(busca.toLowerCase()) ||
        venda.clienteTelefone.includes(busca) ||
        venda.id.includes(busca)
      )
    }

    // Filtro de status
    if (filtroStatus !== 'todos') {
      filtradas = filtradas.filter(venda => venda.status === filtroStatus)
    }

    // Filtro de mês
    if (filtroMes) {
      filtradas = filtradas.filter(venda => {
        const data = new Date(venda.data)
        return data.getMonth() + 1 === parseInt(filtroMes)
      })
    }

    // Filtro de ano
    if (filtroAno) {
      filtradas = filtradas.filter(venda => {
        const data = new Date(venda.data)
        return data.getFullYear() === parseInt(filtroAno)
      })
    }

    setVendasFiltradas(filtradas)
  }

  const atualizarStatusVenda = (id: string, novoStatus: VendaFiado['status']) => {
    const vendasAtualizadas = vendas.map(venda => 
      venda.id === id 
        ? { 
            ...venda, 
            status: novoStatus,
            dataPagamento: novoStatus === 'pago' ? new Date().toISOString() : undefined
          }
        : venda
    )
    
    setVendas(vendasAtualizadas)
    localStorage.setItem('vendas_fiadas', JSON.stringify(vendasAtualizadas))
    calcularEstatisticas(vendasAtualizadas)
  }

  const exportarPDF = () => {
    const dados = vendasFiltradas.map(venda => ({
      'ID': venda.id,
      'Cliente': venda.clienteNome,
      'Telefone': venda.clienteTelefone,
      'Valor': `R$ ${venda.valor.toFixed(2)}`,
      'Data': new Date(venda.data).toLocaleDateString('pt-BR'),
      'Vencimento': new Date(venda.vencimento).toLocaleDateString('pt-BR'),
      'Status': venda.status.charAt(0).toUpperCase() + venda.status.slice(1),
      'Pagamento': venda.dataPagamento ? new Date(venda.dataPagamento).toLocaleDateString('pt-BR') : '-'
    }))

    // Criar CSV simples (pode ser convertido para PDF)
    const csv = [
      Object.keys(dados[0]).join(','),
      ...dados.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `relatorio-fiado-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const imprimirRelatorio = () => {
    const conteudo = `
      <html>
        <head>
          <title>Relatório de Vendas Fiado</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
            .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            .stat-value { font-size: 24px; font-weight: bold; color: #333; }
            .stat-label { color: #666; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .status-pendente { color: #f59e0b; }
            .status-pago { color: #10b981; }
            .status-vencido { color: #ef4444; }
            .status-cancelado { color: #6b7280; }
          </style>
        </head>
        <body>
          <h1>Relatório de Vendas Fiado</h1>
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${estatisticas.totalVendas}</div>
              <div class="stat-label">Total de Vendas</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">R$ ${estatisticas.totalValor.toFixed(2)}</div>
              <div class="stat-label">Valor Total</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">R$ ${estatisticas.totalPendente.toFixed(2)}</div>
              <div class="stat-label">Pendente</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">R$ ${estatisticas.totalPago.toFixed(2)}</div>
              <div class="stat-label">Pago</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Telefone</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Vencimento</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${vendasFiltradas.map(venda => `
                <tr>
                  <td>${venda.id}</td>
                  <td>${venda.clienteNome}</td>
                  <td>${venda.clienteTelefone}</td>
                  <td>R$ ${venda.valor.toFixed(2)}</td>
                  <td>${new Date(venda.data).toLocaleDateString('pt-BR')}</td>
                  <td>${new Date(venda.vencimento).toLocaleDateString('pt-BR')}</td>
                  <td class="status-${venda.status}">${venda.status.charAt(0).toUpperCase() + venda.status.slice(1)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `

    const janela = window.open('', '_blank')
    if (janela) {
      janela.document.write(conteudo)
      janela.document.close()
      janela.print()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'text-yellow-600 bg-yellow-50'
      case 'pago': return 'text-green-600 bg-green-50'
      case 'vencido': return 'text-red-600 bg-red-50'
      case 'cancelado': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente': return <Clock className="w-4 h-4" />
      case 'pago': return <CheckCircle className="w-4 h-4" />
      case 'vencido': return <XCircle className="w-4 h-4" />
      case 'cancelado': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Monitor className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Carregando vendas fiado...</p>
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
              <Link href="/admin-loja" className="text-gray-600 hover:text-gray-900">
                <ArrowUpRight className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Vendas Fiado</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
              </button>
              <button
                onClick={exportarPDF}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
              <button
                onClick={imprimirRelatorio}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
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
                    placeholder="Cliente, telefone ou ID..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="todos">Todos</option>
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
                  <option value="vencido">Vencido</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mês</label>
                <select
                  value={filtroMes}
                  onChange={(e) => setFiltroMes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="1">Janeiro</option>
                  <option value="2">Fevereiro</option>
                  <option value="3">Março</option>
                  <option value="4">Abril</option>
                  <option value="5">Maio</option>
                  <option value="6">Junho</option>
                  <option value="7">Julho</option>
                  <option value="8">Agosto</option>
                  <option value="9">Setembro</option>
                  <option value="10">Outubro</option>
                  <option value="11">Novembro</option>
                  <option value="12">Dezembro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ano</label>
                <select
                  value={filtroAno}
                  onChange={(e) => setFiltroAno(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(ano => (
                    <option key={ano} value={ano}>{ano}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estatísticas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Vendas</p>
                <p className="text-2xl font-semibold text-gray-900">{estatisticas.totalVendas}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-semibold text-gray-900">R$ {estatisticas.totalValor.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendente</p>
                <p className="text-2xl font-semibold text-gray-900">R$ {estatisticas.totalPendente.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pago</p>
                <p className="text-2xl font-semibold text-gray-900">R$ {estatisticas.totalPago.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-lg p-3">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vencido</p>
                <p className="text-2xl font-semibold text-gray-900">R$ {estatisticas.totalVencido.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Vendas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Vendas Fiado ({vendasFiltradas.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendasFiltradas.map((venda) => (
                  <tr key={venda.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{venda.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{venda.clienteNome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{venda.clienteTelefone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">R$ {venda.valor.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(venda.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(venda.vencimento).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(venda.status)}`}>
                        {getStatusIcon(venda.status)}
                        <span className="ml-1">{venda.status.charAt(0).toUpperCase() + venda.status.slice(1)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setVendaSelecionada(venda)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {venda.status === 'pendente' && (
                          <>
                            <button
                              onClick={() => atualizarStatusVenda(venda.id, 'pago')}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => atualizarStatusVenda(venda.id, 'vencido')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {vendaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Detalhes da Venda #{vendaSelecionada.id}</h3>
              <button
                onClick={() => setVendaSelecionada(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Informações do Cliente</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">{vendaSelecionada.clienteNome}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">{vendaSelecionada.clienteTelefone}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Informações da Venda</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">R$ {vendaSelecionada.valor.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">{new Date(vendaSelecionada.data).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900">{new Date(vendaSelecionada.vencimento).toLocaleDateString('pt-BR')}</span>
                    </div>
                    {vendaSelecionada.dataPagamento && (
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-3" />
                        <span className="text-sm text-gray-900">Pago em: {new Date(vendaSelecionada.dataPagamento).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Itens da Venda</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Produto
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Quantidade
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Valor
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {vendaSelecionada.itens.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.nome}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.quantidade}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">R$ {item.valor.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
