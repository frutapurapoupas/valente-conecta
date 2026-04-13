'use client'

import { useState } from 'react'
import { useAdminUsuarios } from '@/hooks/useAdminUsuarios'
import { Users, Search, ShieldCheck, Building2, User, Loader2, CheckCircle2, Ban } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const ROLE_LABEL: Record<string, string> = {
  admin_master: 'Admin',
  company:      'Empresa',
  user:         'Usuário',
}
const ROLE_COR: Record<string, string> = {
  admin_master: 'bg-yellow-500/15 text-yellow-400',
  company:      'bg-indigo-500/15 text-indigo-400',
  user:         'bg-zinc-700 text-zinc-400',
}
const STATUS_COR: Record<string, string> = {
  active:  'bg-emerald-500',
  blocked: 'bg-red-500',
  pending: 'bg-amber-500',
}

export default function UsuariosPage() {
  const { users, loading } = useAdminUsuarios()
  const [filtro, setFiltro] = useState('')
  const [acao, setAcao] = useState<string | null>(null)

  // Estado de execução em tempo real
  const [executando, setExecutando] = useState(false)


  const filtrados = users.filter(u => {
    if (!filtro.trim()) return true
    const q = filtro.toLowerCase()
    return (u.name ?? '').toLowerCase().includes(q) ||
           (u.email ?? '').toLowerCase().includes(q) ||
           (u.role ?? '').toLowerCase().includes(q)
  })

  // Função para gerar link único
  function gerarLinkIndicacao(userId: string) {
    // Altere a URL base conforme necessário
    return `https://valenteconecta.com/indicacao/${userId}`
  }

  // Função para gerar QR code (usando a lib qrcode)
  async function gerarQRCode(link: string) {
    const QRCode = (await import('qrcode')).default
    return await QRCode.toDataURL(link)
  }

  const [qrUserId, setQrUserId] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)

  async function handleShowQr(userId: string) {
    setExecutando(true)
    try {
      const link = gerarLinkIndicacao(userId)
      const url = await gerarQRCode(link)
      setQrUserId(userId)
      setQrCodeUrl(url)
    } finally {
      setExecutando(false)
    }
  }

  function handleCloseQr() {
    setQrUserId(null)
    setQrCodeUrl(null)
  }

  async function toggleBloquear(id: string, bloqueado: boolean) {
    setAcao(id)
    setExecutando(true)
    await supabase.from('users').update({ status: bloqueado ? 'active' : 'blocked' }).eq('id', id)
    setAcao(null)
    setExecutando(false)
    window.location.reload()
  }

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Banner de execução em tempo real */}
      {executando && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white text-center py-2 font-bold animate-pulse shadow-lg">
          Executando ação em tempo real...
        </div>
      )}
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <div>
            <h1 className="text-2xl font-black uppercase italic text-white leading-none">Usuários</h1>
            <p className="text-sm text-zinc-600 font-bold uppercase tracking-widest">{users.length} cadastrados</p>
          </div>
        </div>
        <div className="flex gap-2 text-sm font-bold">
          <span className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-zinc-400">{users.filter(u => u.role === 'company').length} <span className="text-zinc-600">empresas</span></span>
          <span className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-zinc-400">{users.filter(u => !u.role || u.role === 'user').length} <span className="text-zinc-600">usuários</span></span>
          <span className="bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-1.5 text-red-400">{users.filter(u => u.status === 'blocked').length} <span className="text-red-600">bloqueados</span></span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-4 pb-20">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            placeholder="Buscar por nome, email ou tipo..."
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-3 text-base text-white placeholder:text-zinc-600 focus:border-indigo-500/50 outline-none"
          />
        </div>

        {/* Lista */}
        <section className="space-y-2">
          {filtrados.length === 0 && (
            <p className="text-center text-zinc-600 text-base py-12">Nenhum usuário encontrado</p>
          )}
          {filtrados.map(u => {
            const role = u.role ?? 'user'
            const bloqueado = u.status === 'blocked'
            const linkIndicacao = gerarLinkIndicacao(u.id)
            return (
              <div
                key={u.id}
                className={`bg-zinc-900 border rounded-2xl p-3 flex items-center gap-3 ${bloqueado ? 'border-red-500/20 opacity-60' : 'border-zinc-800'}`}
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  {role === 'admin_master' ? <ShieldCheck className="w-5 h-5 text-yellow-400" />
                   : role === 'company'    ? <Building2   className="w-5 h-5 text-indigo-400" />
                   :                        <User         className="w-5 h-5 text-zinc-500" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-black text-lg text-white truncate">{u.name ?? 'Sem nome'}</p>
                    <span className={`text-sm font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${ROLE_COR[role] ?? ROLE_COR.user}`}>
                      {ROLE_LABEL[role] ?? role}
                    </span>
                  </div>
                  <p className="text-base text-zinc-500 truncate">{u.email ?? '—'}</p>
                  {/* Exibir o ID do usuário */}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-zinc-400 select-all">ID:</span>
                    <span className="text-xs text-zinc-400 font-mono select-all break-all">{u.id}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_COR[u.status ?? 'active'] ?? 'bg-zinc-600'}`} />
                    <span className="text-base text-zinc-600 capitalize">{u.status ?? 'active'}</span>
                    {u.saldo_conecta != null && (
                      <span className="text-base text-yellow-500 font-bold">{Number(u.saldo_conecta).toFixed(0)} {'\u2726'}</span>
                    )}
                  </div>
                  {/* Link de indicação */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-blue-400 font-bold select-all break-all">{linkIndicacao}</span>
                    <button
                      className="text-xs text-blue-400 underline hover:text-blue-300"
                      onClick={() => handleShowQr(u.id)}
                    >QR Code</button>
                  </div>
                </div>

                {/* Ação */}
                {role !== 'admin_master' && (
                  <button
                    onClick={() => toggleBloquear(u.id, bloqueado)}
                    disabled={acao === u.id}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-black uppercase transition-all disabled:opacity-50 ${
                      bloqueado
                        ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                        : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                    }`}
                  >
                    {acao === u.id
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : bloqueado
                        ? <><CheckCircle2 className="w-3 h-3" /> Ativar</>
                        : <><Ban className="w-3 h-3" /> Bloquear</>
                    }
                  </button>
                )}
              </div>
            )
          })}
          {/* Modal QR Code */}
          {qrUserId && qrCodeUrl && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center gap-4 relative">
                <button onClick={handleCloseQr} className="absolute top-2 right-2 text-zinc-400 hover:text-white">×</button>
                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                <p className="text-xs text-blue-400 font-bold break-all select-all">{gerarLinkIndicacao(qrUserId)}</p>
                <button onClick={handleCloseQr} className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold">Fechar</button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
