'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, QrCode, Copy, CheckCircle2, ExternalLink,
  Download, Smartphone, Building2, User, Users, ShieldCheck,
  RefreshCw,
} from 'lucide-react'

const PERFIS = [
  {
    id: 'usuario',
    label: 'Usuário Geral',
    desc: 'Busca, carteira, ofertas',
    path: '/',
    color: 'text-blue-400',
    badge: 'bg-blue-600',
  },
  {
    id: 'empresa',
    label: 'Empresa / Loja',
    desc: 'PDV, estoque, catálogo',
    path: '/pdv/colaborativo',
    color: 'text-emerald-400',
    badge: 'bg-emerald-600',
  },
  {
    id: 'ambulante',
    label: 'Ambulante',
    desc: 'Vendas rápidas, catálogo móvel',
    path: '/ambulantes',
    color: 'text-amber-400',
    badge: 'bg-amber-500',
  },
  {
    id: 'profissional',
    label: 'Profissional Liberal',
    desc: 'Perfil, catálogo, planos',
    path: '/profissional/catalogo',
    color: 'text-violet-400',
    badge: 'bg-violet-600',
  },
  {
    id: 'admin',
    label: 'Admin Master',
    desc: 'Painel completo de gestão',
    path: '/admin/master',
    color: 'text-red-400',
    badge: 'bg-red-600',
  },
]

function QRCodeImg({ url, size = 180 }: { url: string; size?: number }) {
  const encoded = encodeURIComponent(url)
  return (
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=18181b&color=ffffff&qzone=1`}
      alt={`QR Code: ${url}`}
      width={size}
      height={size}
      className="rounded-xl"
    />
  )
}

export default function InstaladorAdminPage() {
  const [origem, setOrigem] = useState('')
  const [copiado, setCopiado] = useState<string | null>(null)

  useEffect(() => {
    setOrigem(window.location.origin)
  }, [])

  async function copiar(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopiado(url)
      setTimeout(() => setCopiado(null), 2000)
    } catch {}
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans pb-24">

      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 px-4 py-3 flex items-center gap-3">
        <Link href="/admin/master" className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-all flex-shrink-0">
          <ArrowLeft className="w-4 h-4 text-zinc-400" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-white leading-none">Instalador PWA</h1>
          <p className="text-sm text-zinc-500">QR codes para cada perfil</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm text-zinc-500">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          {origem ? new URL(origem).hostname : '...'}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-5 space-y-5">

        {/* ATALHOS RÁPIDOS */}
        <div className="space-y-3">
          <h2 className="text-base font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
            <QrCode className="w-5 h-5 text-yellow-400" /> Atalhos Rápidos
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Admin Master */}
            <div className="bg-zinc-900 border border-red-500/30 rounded-2xl p-4 flex flex-col items-center gap-3">
              <div className="text-center">
                <span className="text-xs font-black uppercase text-white bg-red-600 px-2.5 py-1 rounded-full">Admin</span>
              </div>
              <div className="p-2 bg-zinc-800 rounded-xl border border-zinc-700">
                {origem
                  ? <QRCodeImg url={`${origem}/admin/master`} size={130} />
                  : <div className="w-[130px] h-[130px] bg-zinc-700 rounded-xl flex items-center justify-center"><RefreshCw className="w-5 h-5 text-zinc-500 animate-spin" /></div>
                }
              </div>
              <p className="text-xs font-bold text-red-400 text-center leading-tight">Admin Master</p>
              <div className="flex gap-2 w-full">
                <a href={`${origem}/admin/master`} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold text-zinc-300 transition-all">
                  <ExternalLink className="w-3 h-3" /> Abrir
                </a>
                <button onClick={() => copiar(`${origem}/admin/master`)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold text-zinc-300 transition-all">
                  {copiado === `${origem}/admin/master`
                    ? <><CheckCircle2 className="w-3 h-3 text-emerald-400" /> OK!</>
                    : <><Copy className="w-3 h-3" /> Copiar</>
                  }
                </button>
              </div>
            </div>

            {/* Demo Geral */}
            <div className="bg-zinc-900 border border-blue-500/30 rounded-2xl p-4 flex flex-col items-center gap-3">
              <div className="text-center">
                <span className="text-xs font-black uppercase text-white bg-blue-600 px-2.5 py-1 rounded-full">Demo</span>
              </div>
              <div className="p-2 bg-zinc-800 rounded-xl border border-zinc-700">
                {origem
                  ? <QRCodeImg url={`${origem}/`} size={130} />
                  : <div className="w-[130px] h-[130px] bg-zinc-700 rounded-xl flex items-center justify-center"><RefreshCw className="w-5 h-5 text-zinc-500 animate-spin" /></div>
                }
              </div>
              <p className="text-xs font-bold text-blue-400 text-center leading-tight">Demo Geral</p>
              <div className="flex gap-2 w-full">
                <a href={`${origem}/`} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold text-zinc-300 transition-all">
                  <ExternalLink className="w-3 h-3" /> Abrir
                </a>
                <button onClick={() => copiar(`${origem}/`)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold text-zinc-300 transition-all">
                  {copiado === `${origem}/`
                    ? <><CheckCircle2 className="w-3 h-3 text-emerald-400" /> OK!</>
                    : <><Copy className="w-3 h-3" /> Copiar</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* INFO */}
        <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-4">
          <p className="text-base text-blue-300 font-bold">
            📱 Todos os QR codes abaixo apontam para o servidor: <strong className="text-white">{origem || '...'}</strong>
          </p>
          <p className="text-sm text-zinc-500 mt-1">
            Compartilhe o QR Code do perfil correto com cada tipo de usuário para instalação no celular.
          </p>
        </div>

        {/* GRID DE QR CODES */}
        <div className="space-y-4">
          {PERFIS.map(perfil => {
            const url = origem ? `${origem}${perfil.path}` : perfil.path
            return (
              <div key={perfil.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                {/* Cabeçalho */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className={`inline-block text-xs font-black uppercase text-white px-2.5 py-1 rounded-full mb-1.5 ${perfil.badge}`}>
                      {perfil.id}
                    </span>
                    <p className={`font-black text-lg ${perfil.color}`}>{perfil.label}</p>
                    <p className="text-sm text-zinc-500">{perfil.desc}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Abrir
                    </a>
                    <button
                      onClick={() => copiar(url)}
                      className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                      {copiado === url
                        ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Copiado!</>
                        : <><Copy className="w-3.5 h-3.5" /> Copiar URL</>
                      }
                    </button>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="p-3 bg-zinc-800 rounded-2xl border border-zinc-700 flex-shrink-0">
                    {origem
                      ? <QRCodeImg url={url} size={160} />
                      : <div className="w-[160px] h-[160px] bg-zinc-700 rounded-xl flex items-center justify-center">
                          <RefreshCw className="w-6 h-6 text-zinc-500 animate-spin" />
                        </div>
                    }
                  </div>

                  <div className="space-y-3 flex-1">
                    <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3">
                      <p className="text-xs text-zinc-600 mb-1 uppercase font-bold">URL</p>
                      <p className="text-sm text-zinc-300 font-mono break-all">{url}</p>
                    </div>

                    <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 space-y-1">
                      <p className="text-xs text-zinc-600 mb-1 uppercase font-bold">Como instalar</p>
                      <p className="text-sm text-zinc-400">
                        <strong className="text-white">Android:</strong> Abrir no Chrome → ⋮ → Adicionar à tela inicial
                      </p>
                      <p className="text-sm text-zinc-400">
                        <strong className="text-white">iPhone:</strong> Abrir no Safari → Compartilhar → Adicionar à Tela Inicial
                      </p>
                    </div>

                    {/* Link para a tela de instalação pública */}
                    <Link
                      href={`/instalar?perfil=${perfil.id}`}
                      target="_blank"
                      className="flex items-center gap-2 w-full py-2.5 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-sm font-black text-zinc-300 justify-center transition-all"
                    >
                      <Smartphone className="w-4 h-4" /> Abrir guia de instalação
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* LINK PÚBLICO */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <p className="font-black text-base text-white">Página de instalação pública</p>
          <p className="text-sm text-zinc-400">
            Compartilhe esta página com qualquer usuário para que ele escolha e instale o perfil correto.
          </p>
          <div className="flex gap-2">
            <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5">
              <p className="text-sm text-zinc-300 font-mono truncate">{origem}/instalar</p>
            </div>
            <button
              onClick={() => copiar(`${origem}/instalar`)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-black text-white transition-all flex-shrink-0"
            >
              {copiado === `${origem}/instalar` ? '✓' : 'Copiar'}
            </button>
          </div>
          <div className="flex justify-center pt-2">
            {origem && <QRCodeImg url={`${origem}/instalar`} size={160} />}
          </div>
        </div>

      </main>
    </div>
  )
}
