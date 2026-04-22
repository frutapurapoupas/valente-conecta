'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, MapPin, Star, Briefcase, Building2, ChevronLeft, Filter, X } from 'lucide-react'

interface ProfissionalCatalogo {
  id: string
  tipo: 'empresa' | 'profissional'
  nome: string
  nomeFantasia?: string
  documento: string
  cidade: string
  bairro: string
  telefone: string
  descricao: string
  itens: any[]
  avaliacao?: number
}

export default function CatalogoPublicoPage() {
  const [profissionais, setProfissionais] = useState<ProfissionalCatalogo[]>([])
  const [filtrados, setFiltrados] = useState<ProfissionalCatalogo[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [cidadeSelecionada, setCidadeSelecionada] = useState('todas')
  const [loading, setLoading] = useState(true)

  // Carregar todos os catálogos cadastrados
  useEffect(() => {
    const carregarCatalogos = () => {
      const todos: ProfissionalCatalogo[] = []
      
      // Carregar empresas
      const empresasData = localStorage.getItem('profissional_dados_empresa')
      if (empresasData) {
        const empresa = JSON.parse(empresasData)
        todos.push({
          id: 'empresa_' + Date.now(),
          tipo: 'empresa',
          nome: empresa.dados.nome,
          nomeFantasia: empresa.dados.nomeFantasia,
          documento: empresa.dados.cpfCnpj,
          cidade: empresa.dados.cidade,
          bairro: empresa.dados.bairro,
          telefone: empresa.dados.telefone,
          descricao: empresa.dados.descricao,
          itens: empresa.itens || [],
          avaliacao: 4.5 + Math.random() * 0.5
        })
      }
      
      // Carregar profissionais liberais
      const profissionaisData = localStorage.getItem('profissional_dados_profissional')
      if (profissionaisData) {
        const profissional = JSON.parse(profissionaisData)
        todos.push({
          id: 'profissional_' + Date.now(),
          tipo: 'profissional',
          nome: profissional.dados.nome,
          documento: profissional.dados.cpfCnpj,
          cidade: profissional.dados.cidade,
          bairro: profissional.dados.bairro,
          telefone: profissional.dados.telefone,
          descricao: profissional.dados.descricao,
          itens: profissional.itens || [],
          avaliacao: 4.7 + Math.random() * 0.3
        })
      }
      
      setProfissionais(todos)
      setFiltrados(todos)
      setLoading(false)
    }
    
    carregarCatalogos()
    
    // Escutar mudanças no localStorage
    window.addEventListener('storage', carregarCatalogos)
    return () => window.removeEventListener('storage', carregarCatalogos)
  }, [])

  // Filtrar
  useEffect(() => {
    let resultados = profissionais
    
    if (searchTerm) {
      resultados = resultados.filter(p => 
        (p.nomeFantasia || p.nome).toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.itens.some(i => i.nome.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    if (cidadeSelecionada !== 'todas') {
      resultados = resultados.filter(p => p.cidade === cidadeSelecionada)
    }
    
    setFiltrados(resultados)
  }, [searchTerm, cidadeSelecionada, profissionais])

  const cidades = ['todas', ...new Set(profissionais.map(p => p.cidade).filter(Boolean))]

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="p-2 bg-zinc-800 rounded-xl">
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <h1 className="text-lg font-black text-white">Catálogos de Profissionais</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por profissional, serviço ou produto..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500"
          />
        </div>

        {/* Filtro de cidade */}
        {cidades.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {cidades.map(cidade => (
              <button
                key={cidade}
                onClick={() => setCidadeSelecionada(cidade)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  cidadeSelecionada === cidade ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {cidade === 'todas' ? 'Todas as cidades' : cidade}
              </button>
            ))}
          </div>
        )}

        {/* Resultados */}
        <div className="space-y-3">
          <p className="text-sm text-zinc-500">{filtrados.length} profissionais encontrados</p>
          
          {filtrados.map(prof => (
            <Link href={`/catalogo-publico/${prof.id}`} key={prof.id}>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-yellow-500/50 transition-all">
                <div className="flex gap-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    {prof.tipo === 'empresa' ? <Building2 className="w-8 h-8 text-yellow-400" /> : <Briefcase className="w-8 h-8 text-yellow-400" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-white">{prof.nomeFantasia || prof.nome}</h3>
                        <p className="text-xs text-zinc-500">{prof.tipo === 'empresa' ? 'CNPJ: ' + prof.documento : 'CPF: ' + prof.documento}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-zinc-400">{prof.avaliacao?.toFixed(1) || '4.5'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500">
                      <MapPin className="w-3 h-3" />
                      <span>{prof.cidade}, {prof.bairro}</span>
                    </div>
                    
                    <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{prof.descricao}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {prof.itens.slice(0, 3).map(item => (
                        <span key={item.id} className="text-xs bg-zinc-800 px-2 py-1 rounded-full text-zinc-400">
                          {item.nome}
                        </span>
                      ))}
                      {prof.itens.length > 3 && (
                        <span className="text-xs text-zinc-600">+{prof.itens.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          
          {filtrados.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500">Nenhum profissional encontrado</p>
              <p className="text-sm text-zinc-600 mt-2">Seja o primeiro a se cadastrar!</p>
              <Link href="/profissional/catalogo" className="inline-block mt-4 px-6 py-2 bg-yellow-500 text-black rounded-xl font-bold text-sm">
                Cadastrar agora
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}