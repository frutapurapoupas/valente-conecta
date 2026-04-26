'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User, Mail, Phone, MapPin, Edit2, Save, X, Package, Heart, ChevronLeft, Dumbbell, Navigation } from 'lucide-react'

export default function PerfilPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    nome: 'João Silva',
    email: 'joao.silva@email.com',
    telefone: '(75) 9 8888-7777',
    endereco: 'Rua Principal, 123 - Centro, Valente-BA'
  })
  const [tempData, setTempData] = useState(formData)
  const [academiaDados, setAcademiaDados] = useState<any>(null)
  const [esportesDados, setEsportesDados] = useState<any[]>([])

  const stats = { compras: 47, economias: 156.90, avaliacoes: 12, favoritos: 8 }

  useEffect(() => {
    // Carregar dados da academia
    const academiaSalva = localStorage.getItem('academia_dados')
    if (academiaSalva) {
      setAcademiaDados(JSON.parse(academiaSalva))
    }

    // Carregar dados dos esportes
    const esportesSalvos = localStorage.getItem('academia_esportes')
    if (esportesSalvos) {
      setEsportesDados(JSON.parse(esportesSalvos))
    }
  }, [])

  const handleSave = () => {
    setFormData(tempData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempData(formData)
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <header className="sticky top-0 z-30 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="p-2 bg-zinc-800 rounded-xl">
            <ChevronLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <h1 className="text-lg font-black text-white">Meu Perfil</h1>
          <button onClick={() => setIsEditing(!isEditing)} className="p-2 bg-zinc-800 rounded-xl">
            {isEditing ? <Save className="w-5 h-5 text-emerald-400" onClick={handleSave} /> : <Edit2 className="w-5 h-5 text-yellow-400" />}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Foto e Nome */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-4xl">
            <User className="w-12 h-12 text-white" />
          </div>
          {isEditing ? (
            <input type="text" value={tempData.nome} onChange={(e) => setTempData({ ...tempData, nome: e.target.value })} className="mt-3 text-xl font-bold text-center bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-yellow-500" />
          ) : (
            <h2 className="mt-3 text-xl font-bold text-white">{formData.nome}</h2>
          )}
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-zinc-900 rounded-xl p-3 text-center"><Package className="w-5 h-5 text-yellow-400 mx-auto mb-1" /><p className="text-xl font-black text-white">{stats.compras}</p><p className="text-[10px] text-zinc-500">Compras</p></div>
          <div className="bg-zinc-900 rounded-xl p-3 text-center"><Package className="w-5 h-5 text-emerald-400 mx-auto mb-1" /><p className="text-xl font-black text-white">R$ {stats.economias.toFixed(0)}</p><p className="text-[10px] text-zinc-500">Economia</p></div>
          <div className="bg-zinc-900 rounded-xl p-3 text-center"><Heart className="w-5 h-5 text-red-400 mx-auto mb-1" /><p className="text-xl font-black text-white">{stats.favoritos}</p><p className="text-[10px] text-zinc-500">Favoritos</p></div>
        </div>

        {/* Informações */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-white flex items-center gap-2"><User className="w-4 h-4 text-yellow-400" />Informações</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-zinc-400"><Mail className="w-4 h-4" />{isEditing ? <input type="email" value={tempData.email} onChange={(e) => setTempData({ ...tempData, email: e.target.value })} className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500" /> : <span className="text-sm">{formData.email}</span>}</div>
            <div className="flex items-center gap-3 text-zinc-400"><Phone className="w-4 h-4" />{isEditing ? <input type="tel" value={tempData.telefone} onChange={(e) => setTempData({ ...tempData, telefone: e.target.value })} className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500" /> : <span className="text-sm">{formData.telefone}</span>}</div>
            <div className="flex items-center gap-3 text-zinc-400"><MapPin className="w-4 h-4" />{isEditing ? <input type="text" value={tempData.endereco} onChange={(e) => setTempData({ ...tempData, endereco: e.target.value })} className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500" /> : <span className="text-sm">{formData.endereco}</span>}</div>
          </div>
          {isEditing && (
            <div className="flex gap-3 pt-2">
              <button onClick={handleCancel} className="flex-1 py-2 bg-zinc-800 rounded-xl text-sm font-bold text-zinc-400">Cancelar</button>
              <button onClick={handleSave} className="flex-1 py-2 bg-yellow-500 rounded-xl text-sm font-bold text-black">Salvar</button>
            </div>
          )}
        </div>

        {/* Academia e Esportes */}
        {(academiaDados || esportesDados.length > 0) && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2"><Dumbbell className="w-4 h-4 text-cyan-400" />Academia e Esportes</h3>
            
            {academiaDados && (
              <div className="bg-zinc-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white">{academiaDados.nome}</h4>
                  <Link href="/academia/configurar-academia" className="text-xs text-cyan-400 hover:text-cyan-300">Editar</Link>
                </div>
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{academiaDados.endereco}</span>
                </div>
                {academiaDados.localizadorCapturado && (
                  <div className="flex items-center gap-2 text-emerald-400 text-xs">
                    <Navigation className="w-3 h-3" />
                    <span>Localização capturada</span>
                  </div>
                )}
              </div>
            )}

            {esportesDados.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Esportes Cadastrados</p>
                {esportesDados.map((esporte) => (
                  <div key={esporte.id} className="bg-zinc-800 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-sm">{esporte.nome || esporte.tipo}</p>
                      <p className="text-zinc-400 text-xs">{esporte.diaSemana} · {esporte.horario}</p>
                    </div>
                    {esporte.localizadorCapturado ? (
                      <Navigation className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="text-center py-4"><p className="text-xs text-zinc-600">Valente Conecta v2.0.0</p></div>
      </main>
    </div>
  )
}