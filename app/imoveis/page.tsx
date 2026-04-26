'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, Home, MapPin, Camera, Plus, Lock, Navigation, Search, Check } from 'lucide-react'

interface Imovel {
  id: string
  titulo: string
  tipo: 'aluguel' | 'venda'
  endereco: string
  localizador: string
  preco: number
  foto: string
  quartos: number
  banheiros: number
  area: number
  descricao: string
  userId: string
  dataCadastro: string
  dataRenovacao: string // Data da última renovação mensal
  desbloqueado: boolean
  ativo: boolean // Se o anúncio está ativo (renovado)
}

export default function ImoveisPage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'aluguel' as 'aluguel' | 'venda',
    endereco: '',
    localizador: '',
    preco: '',
    foto: '',
    quartos: '',
    banheiros: '',
    area: '',
    descricao: ''
  })
  const [capturandoLocalizacao, setCapturandoLocalizacao] = useState(false)
  const [valorDesbloqueio, setValorDesbloqueio] = useState(30) // Valor configurável pelo admin

  useEffect(() => {
    carregarImoveis()
    carregarValorDesbloqueio()
    verificarRenovacoes()
  }, [])

  const verificarRenovacoes = () => {
    const salvo = localStorage.getItem('imoveis_anuncios')
    if (salvo) {
      const imoveis: Imovel[] = JSON.parse(salvo)
      const hoje = new Date()
      
      // Verificar cada imóvel se precisa de renovação
      const imoveisAtualizados = imoveis.map(imovel => {
        if (!imovel.desbloqueado) return imovel // Não verificado se não está desbloqueado
        
        const dataRenovacao = new Date(imovel.dataRenovacao || imovel.dataCadastro)
        const diasDesdeRenovacao = Math.floor((hoje.getTime() - dataRenovacao.getTime()) / (1000 * 60 * 60 * 24))
        
        // Se passou mais de 30 dias, marca como inativo
        if (diasDesdeRenovacao > 30) {
          return { ...imovel, ativo: false }
        }
        
        return imovel
      })
      
      localStorage.setItem('imoveis_anuncios', JSON.stringify(imoveisAtualizados))
      setImoveis(imoveisAtualizados)
    }
  }

  const carregarImoveis = () => {
    const salvo = localStorage.getItem('imoveis_anuncios')
    if (salvo) {
      setImoveis(JSON.parse(salvo))
    }
  }

  const carregarValorDesbloqueio = () => {
    const salvo = localStorage.getItem('config_valor_desbloqueio_imoveis')
    if (salvo) {
      setValorDesbloqueio(parseFloat(salvo))
    }
  }

  const capturarLocalizacao = () => {
    setCapturandoLocalizacao(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setFormData(prev => ({ ...prev, localizador: `${latitude},${longitude}` }))
          setCapturandoLocalizacao(false)
        },
        (error) => {
          alert('Erro ao capturar localização. Tente novamente.')
          setCapturandoLocalizacao(false)
        }
      )
    } else {
      alert('Geolocalização não suportada pelo navegador.')
      setCapturandoLocalizacao(false)
    }
  }

  const salvarImovel = () => {
    if (!formData.titulo || !formData.endereco || !formData.preco || !formData.localizador) {
      alert('Preencha os campos obrigatórios')
      return
    }

    const novoImovel: Imovel = {
      id: Date.now().toString(),
      titulo: formData.titulo,
      tipo: formData.tipo,
      endereco: formData.endereco,
      localizador: formData.localizador,
      preco: parseFloat(formData.preco),
      foto: formData.foto,
      quartos: parseInt(formData.quartos) || 0,
      banheiros: parseInt(formData.banheiros) || 0,
      area: parseFloat(formData.area) || 0,
      descricao: formData.descricao,
      userId: 'USER123', // ID do usuário logado
      dataCadastro: new Date().toISOString(),
      dataRenovacao: new Date().toISOString(), // Data inicial de renovação
      desbloqueado: false, // Requer pagamento para desbloquear
      ativo: false // Só fica ativo após desbloqueio
    }

    const imoveisSalvos = localStorage.getItem('imoveis_anuncios')
    const todos = imoveisSalvos ? JSON.parse(imoveisSalvos) : []
    todos.push(novoImovel)
    localStorage.setItem('imoveis_anuncios', JSON.stringify(todos))

    setImoveis(todos)
    setShowModal(false)
    setFormData({
      titulo: '',
      tipo: 'aluguel',
      endereco: '',
      localizador: '',
      preco: '',
      foto: '',
      quartos: '',
      banheiros: '',
      area: '',
      descricao: ''
    })

    alert('Imóvel cadastrado com sucesso! Pague R$ ' + valorDesbloqueio + ' para desbloquear e aparecer nas buscas.')
  }

  const desbloquearImovel = (id: string) => {
    const imoveisAtualizados = imoveis.map(imovel =>
      imovel.id === id ? { ...imovel, desbloqueado: true, ativo: true, dataRenovacao: new Date().toISOString() } : imovel
    )
    setImoveis(imoveisAtualizados)
    localStorage.setItem('imoveis_anuncios', JSON.stringify(imoveisAtualizados))
    alert('Imóvel desbloqueado! Agora aparecerá nas buscas por 30 dias.')
  }

  const renovarImovel = (id: string) => {
    const imoveisAtualizados = imoveis.map(imovel =>
      imovel.id === id ? { ...imovel, ativo: true, dataRenovacao: new Date().toISOString() } : imovel
    )
    setImoveis(imoveisAtualizados)
    localStorage.setItem('imoveis_anuncios', JSON.stringify(imoveisAtualizados))
    alert('Imóvel renovado! Aparecerá nas buscas por mais 30 dias.')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="p-2 bg-zinc-800 rounded-xl">
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <h1 className="text-lg font-black text-white">Imóveis</h1>
          <button
            onClick={() => setShowModal(true)}
            className="p-2 bg-rose-600 rounded-xl"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Informações */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h3 className="font-bold text-white mb-3">Anuncie Grátis</h3>
          <p className="text-sm text-zinc-400 mb-3">
            Anuncie seu imóvel gratuitamente. Para aparecer nas buscas, pague R$ {valorDesbloqueio} para desbloquear.
          </p>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Lock className="w-4 h-4" />
            <span>Contatos desbloqueados após pagamento</span>
          </div>
        </div>

        {/* Lista de imóveis */}
        <div className="space-y-4">
          {imoveis.length === 0 ? (
            <div className="text-center py-12">
              <Home className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-500 font-medium">Nenhum imóvel cadastrado</p>
              <p className="text-sm text-zinc-400 mt-1">Clique no + para anunciar seu primeiro imóvel</p>
            </div>
          ) : (
            imoveis.map((imovel) => (
              <div
                key={imovel.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
              >
                {/* Foto */}
                <div className="h-48 bg-zinc-800 flex items-center justify-center">
                  {imovel.foto ? (
                    <img src={imovel.foto} alt={imovel.titulo} className="w-full h-full object-cover" />
                  ) : (
                    <Home className="w-16 h-16 text-zinc-600" />
                  )}
                </div>

                {/* Conteúdo */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-white">{imovel.titulo}</h4>
                      <p className="text-sm text-zinc-400 capitalize">{imovel.tipo === 'aluguel' ? 'Aluguel' : 'Venda'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-emerald-400">R$ {imovel.preco}</p>
                      {!imovel.desbloqueado && (
                        <span className="text-xs text-orange-400 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Bloqueado
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{imovel.endereco}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-zinc-400">
                    <span>{imovel.quartos} quartos</span>
                    <span>{imovel.banheiros} banheiros</span>
                    <span>{imovel.area} m²</span>
                  </div>

                  {!imovel.desbloqueado && (
                    <button
                      onClick={() => desbloquearImovel(imovel.id)}
                      className="w-full py-2 bg-rose-600 rounded-xl font-bold text-white hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Desbloquear por R$ {valorDesbloqueio}
                    </button>
                  )}
                  
                  {imovel.desbloqueado && !imovel.ativo && (
                    <button
                      onClick={() => renovarImovel(imovel.id)}
                      className="w-full py-2 bg-orange-600 rounded-xl font-bold text-white hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      Renovar por R$ {imovel.tipo === 'aluguel' ? '20' : '50'}
                    </button>
                  )}
                  
                  {imovel.desbloqueado && imovel.ativo && (
                    <div className="text-xs text-green-400 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Ativo até {new Date(imovel.dataRenovacao).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal de cadastro */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-md p-6 space-y-4 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900">Novo Anúncio</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <Lock className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Título *</label>
                <input
                  value={formData.titulo}
                  onChange={e => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Ex: Apartamento 3 quartos centro"
                  className="mt-1 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-base text-gray-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Tipo *</label>
                <select
                  value={formData.tipo}
                  onChange={e => setFormData(prev => ({ ...prev, tipo: e.target.value as 'aluguel' | 'venda' }))}
                  className="mt-1 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-base text-gray-900"
                >
                  <option value="aluguel">Aluguel</option>
                  <option value="venda">Venda</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Endereço *</label>
                <input
                  value={formData.endereco}
                  onChange={e => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                  placeholder="Rua, número, bairro"
                  className="mt-1 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-base text-gray-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Localizador *</label>
                <div className="flex gap-2 mt-1">
                  <input
                    value={formData.localizador}
                    readOnly
                    placeholder="Coordenadas GPS"
                    className="flex-1 px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-xl text-gray-600"
                  />
                  <button
                    onClick={capturarLocalizacao}
                    disabled={capturandoLocalizacao}
                    className="px-4 py-3 bg-rose-600 rounded-xl font-bold text-white hover:bg-rose-700 flex items-center gap-2"
                  >
                    <Navigation className="w-5 h-5" />
                    {capturandoLocalizacao ? '...' : 'GPS'}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Preço (R$) *</label>
                <input
                  type="number"
                  value={formData.preco}
                  onChange={e => setFormData(prev => ({ ...prev, preco: e.target.value }))}
                  placeholder="Ex: 1500"
                  className="mt-1 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-base text-gray-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Quartos</label>
                  <input
                    type="number"
                    value={formData.quartos}
                    onChange={e => setFormData(prev => ({ ...prev, quartos: e.target.value }))}
                    className="mt-1 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-base text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Banheiros</label>
                  <input
                    type="number"
                    value={formData.banheiros}
                    onChange={e => setFormData(prev => ({ ...prev, banheiros: e.target.value }))}
                    className="mt-1 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-base text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Área (m²)</label>
                  <input
                    type="number"
                    value={formData.area}
                    onChange={e => setFormData(prev => ({ ...prev, area: e.target.value }))}
                    className="mt-1 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-base text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={e => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Detalhes do imóvel"
                  rows={3}
                  className="mt-1 w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-base text-gray-900 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-800 uppercase tracking-wide">Foto</label>
                <div className="mt-1 flex items-center gap-3">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Camera className="w-10 h-10 text-gray-400" />
                  </div>
                  <button className="px-4 py-2 bg-gray-200 rounded-xl text-sm font-bold text-gray-700 flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Tirar Foto
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={salvarImovel}
              className="w-full py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Cadastrar Grátis
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
