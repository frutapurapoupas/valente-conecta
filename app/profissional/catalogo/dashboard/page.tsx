'use client'

import { Suspense } from 'react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Building2, Briefcase, Mail, Phone, MapPin, FileText, Edit2, Plus, Trash2, Package } from 'lucide-react'

function DashboardContent() {
  const searchParams = useSearchParams()
  const tipo = searchParams.get('tipo') || 'profissional'
  const [dados, setDados] = useState<any>(null)
  const [itens, setItens] = useState<any[]>([])

  useEffect(() => {
    const saved = localStorage.getItem(`profissional_dados_${tipo}`)
    if (saved) {
      const parsed = JSON.parse(saved)
      setDados(parsed.dados)
      setItens(parsed.itens || [])
    }
  }, [tipo])

  if (!dados) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <Package className="w-16 h-16 text-yellow-400 mb-4 animate-pulse" />
        <h2 className="text-xl font-bold text-white mb-2">Nenhum cadastro encontrado</h2>
        <Link href="/profissional/catalogo" className="px-6 py-3 bg-yellow-500 text-black rounded-xl font-bold">Fazer Cadastro</Link>
      </div>
    )
  }

  const isEmpresa = tipo === 'empresa'

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/profissional/catalogo" className="p-2 bg-zinc-800 rounded-xl">
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <h1 className="text-lg font-black text-white">Meu Catálogo</h1>
          <Link href={`/profissional/catalogo/cadastro?tipo=${tipo}`} className="p-2 bg-zinc-800 rounded-xl">
            <Edit2 className="w-5 h-5 text-zinc-400" />
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              {isEmpresa ? <Building2 className="w-8 h-8 text-white" /> : <Briefcase className="w-8 h-8 text-white" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-white">{isEmpresa ? dados.nomeFantasia : dados.nome}</h2>
              <p className="text-yellow-400 text-sm">{isEmpresa ? 'Empresa' : 'Profissional Liberal'}</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-white mb-2">Contato</h3>
          <p className="text-zinc-400 text-sm flex items-center gap-2"><Mail className="w-4 h-4" />{dados.email}</p>
          <p className="text-zinc-400 text-sm flex items-center gap-2"><Phone className="w-4 h-4" />{dados.telefone}</p>
          <p className="text-zinc-400 text-sm flex items-center gap-2"><MapPin className="w-4 h-4" />{dados.endereco}, {dados.cidade} - {dados.bairro}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">Meu Catálogo</h3>
            <Link href={`/profissional/catalogo/cadastro?tipo=${tipo}`} className="text-yellow-400 text-sm flex items-center gap-1">
              <Plus className="w-4 h-4" /> Gerenciar
            </Link>
          </div>
          
          {itens.length === 0 ? (
            <p className="text-center text-zinc-500 py-8">Nenhum item cadastrado.</p>
          ) : (
            <div className="space-y-3">
              {itens.map(item => (
                <div key={item.id} className="bg-zinc-800/50 rounded-xl p-3">
                  <div className="flex gap-3">
                    {item.foto && <img src={item.foto} className="w-12 h-12 rounded-lg object-cover" />}
                    <div className="flex-1">
                      <h4 className="font-bold text-white">{item.nome}</h4>
                      <p className="text-xs text-zinc-400">{item.descricao}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-zinc-500">Unidade: {item.unidade}</span>
                        <span className="text-yellow-400 font-bold">R$ {item.preco.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 flex items-center justify-center">Carregando...</div>}>
      <DashboardContent />
    </Suspense>
  )
}