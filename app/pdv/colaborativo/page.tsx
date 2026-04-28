'use client'

import Link from 'next/link'
import { ChevronRight, ArrowLeft, Zap, Building, MapPin, Phone, Mail, User, Edit2, Save, X } from 'lucide-react'
import { usePDVColaborativo } from '@/hooks/usePDVColaborativo'
import { useState, useEffect } from 'react'

interface DadosLoja {
  nomeLoja: string
  cnpj: string
  endereco: {
    rua: string
    bairro: string
    cidade: string
    estado: string
    cep: string
  }
  responsavel: string
  whatsapp: string
  localizador: string
  plano: string
}

export default function PDVColaborativoPage() {
  const { menus } = usePDVColaborativo()
  const [mostrarFormularioPerfil, setMostrarFormularioPerfil] = useState(false)
  const [dadosLoja, setDadosLoja] = useState<DadosLoja>({
    nomeLoja: '',
    cnpj: '',
    endereco: {
      rua: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    },
    responsavel: '',
    whatsapp: '',
    localizador: '',
    plano: ''
  })
  const [editando, setEditando] = useState(false)

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('dados_loja')
    if (dadosSalvos) {
      setDadosLoja(JSON.parse(dadosSalvos))
    }
  }, [])

  const handleSalvarDados = () => {
    localStorage.setItem('dados_loja', JSON.stringify(dadosLoja))
    setMostrarFormularioPerfil(false)
    setEditando(true)
    alert('Dados da loja salvos com sucesso!')
  }

  const handleEditarDados = () => {
    setMostrarFormularioPerfil(true)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      <header className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/" className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl">
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <div>
            <h1 className="text-lg font-black">PDV Colaborativo</h1>
            <p className="text-xs text-zinc-500">GestÃ£o completa da sua loja fÃ­sica</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 space-y-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-3xl">🏪</span>
          <div className="flex-1">
            <p className="font-bold text-sm text-white">Bem-vindo ao seu painel de loja</p>
            <p className="text-xs text-zinc-500 mt-0.5">Vendas, estoque, perfil e plano num só lugar.</p>
          </div>
          <Link href="/start" className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-medium">Integração</span>
          </Link>
        </div>

        <div className="space-y-2">
          {menus.map((item) => (
            item.id === 'perfil' ? (
              <button
                key={item.id}
                onClick={editando ? handleEditarDados : () => setMostrarFormularioPerfil(true)}
                className="w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 flex items-center gap-4 active:scale-[0.99] transition-all"
              >
                <span className="text-3xl flex-shrink-0">{item.emoji}</span>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-black text-white text-base">{item.label}</p>
                  <p className="text-sm text-zinc-500">{item.descricao}</p>
                </div>
                {editando ? <Edit2 className="w-5 h-5 text-zinc-600 flex-shrink-0" /> : <ChevronRight className="w-5 h-5 text-zinc-600 flex-shrink-0" />}
              </button>
            ) : (
              <Link key={item.id} href={item.href}>
                <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 flex items-center gap-4 active:scale-[0.99] transition-all">
                  <span className="text-3xl flex-shrink-0">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white text-base">{item.label}</p>
                    <p className="text-sm text-zinc-500">{item.descricao}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-600 flex-shrink-0" />
                </div>
              </Link>
            )
          ))}
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
          <p className="text-xs text-amber-300">
            ðŸ’¡ <strong>Dica:</strong> para vender na rua ou em feiras, use o <strong>PDV MÃ³vel</strong> na tela inicial â€” entrada direta no leitor de produtos.
          </p>
        </div>
      </main>

      {/* Modal de Formulário de Perfil */}
      {mostrarFormularioPerfil && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Cadastro da Loja</h3>
              <button
                onClick={() => setMostrarFormularioPerfil(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Dados Básicos */}
              <div>
                <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Dados da Loja
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Nome da Loja</label>
                    <input
                      type="text"
                      value={dadosLoja.nomeLoja}
                      onChange={(e) => setDadosLoja({...dadosLoja, nomeLoja: e.target.value})}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nome fantasia"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">CNPJ</label>
                    <input
                      type="text"
                      value={dadosLoja.cnpj}
                      onChange={(e) => setDadosLoja({...dadosLoja, cnpj: e.target.value})}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div>
                <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Endereço
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Rua</label>
                    <input
                      type="text"
                      value={dadosLoja.endereco.rua}
                      onChange={(e) => setDadosLoja({...dadosLoja, endereco: {...dadosLoja.endereco, rua: e.target.value}})}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Rua, número"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Bairro</label>
                    <input
                      type="text"
                      value={dadosLoja.endereco.bairro}
                      onChange={(e) => setDadosLoja({...dadosLoja, endereco: {...dadosLoja.endereco, bairro: e.target.value}})}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Bairro"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">CEP</label>
                    <input
                      type="text"
                      value={dadosLoja.endereco.cep}
                      onChange={(e) => setDadosLoja({...dadosLoja, endereco: {...dadosLoja.endereco, cep: e.target.value}})}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="00000-000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Cidade</label>
                    <input
                      type="text"
                      value={dadosLoja.endereco.cidade}
                      onChange={(e) => setDadosLoja({...dadosLoja, endereco: {...dadosLoja.endereco, cidade: e.target.value}})}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Cidade"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Estado</label>
                    <input
                      type="text"
                      value={dadosLoja.endereco.estado}
                      onChange={(e) => setDadosLoja({...dadosLoja, endereco: {...dadosLoja.endereco, estado: e.target.value}})}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="BA"
                    />
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div>
                <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Responsável e Contato
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Nome do Responsável</label>
                    <input
                      type="text"
                      value={dadosLoja.responsavel}
                      onChange={(e) => setDadosLoja({...dadosLoja, responsavel: e.target.value})}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">WhatsApp</label>
                    <input
                      type="tel"
                      value={dadosLoja.whatsapp}
                      onChange={(e) => setDadosLoja({...dadosLoja, whatsapp: e.target.value})}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="(75) 98765-4321"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Localizador</label>
                    <input
                      type="text"
                      value={dadosLoja.localizador}
                      onChange={(e) => setDadosLoja({...dadosLoja, localizador: e.target.value})}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Código identificador"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Plano</label>
                    <select
                      value={dadosLoja.plano}
                      onChange={(e) => setDadosLoja({...dadosLoja, plano: e.target.value})}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione um plano</option>
                      <option value="gratuito">Grátis</option>
                      <option value="basico">Básico - R$ 29,90/mês</option>
                      <option value="premium">Premium - R$ 49,90/mês</option>
                      <option value="fisco">Fisco - R$ 99,90/mês</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setMostrarFormularioPerfil(false)}
                  className="flex-1 px-6 py-3 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvarDados}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Dados</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
