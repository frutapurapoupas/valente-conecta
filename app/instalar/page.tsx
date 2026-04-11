'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Download, Smartphone, Monitor,
  CheckCircle2, Copy, ExternalLink, Zap,
  Building2, User, Users, ShieldCheck,
} from 'lucide-react'

// ─── Perfis de instalação ────────────────────────────────────────────────────
const PERFIS = [
  {
    id: 'usuario',
    label: 'Usuário Geral',
    desc: 'Busca, carteira, ofertas, indicações',
    path: '/',
    icon: <Users className="w-6 h-6 text-blue-400" />,
    color: 'border-blue-500/30 bg-blue-500/5',
    badge: 'bg-blue-600',
  },
  {
    id: 'empresa',
    label: 'Empresa / Loja',
    desc: 'PDV, estoque, catálogo, planos',
    path: '/pdv/colaborativo',
    icon: <Building2 className="w-6 h-6 text-emerald-400" />,
    color: 'border-emerald-500/30 bg-emerald-500/5',
    badge: 'bg-emerald-600',
  },
  {
    id: 'ambulante',
    label: 'Ambulante',
    desc: 'Vendas rápidas, catálogo móvel',
    path: '/ambulantes',
    icon: <span className="text-2xl leading-none">🛵</span>,
    color: 'border-amber-500/30 bg-amber-500/5',
    badge: 'bg-amber-500',
  },
  {
    id: 'profissional',
    label: 'Profissional Liberal',
    desc: 'Perfil, catálogo, planos',
    path: '/profissional/catalogo',
    icon: <User className="w-6 h-6 text-violet-400" />,
    color: 'border-violet-500/30 bg-violet-500/5',
    badge: 'bg-violet-600',
  },
  {
    id: 'admin',
    label: 'Admin Master',
    desc: 'Painel completo de gestão',
    path: '/admin/login',
    icon: <ShieldCheck className="w-6 h-6 text-red-400" />,
    color: 'border-red-500/30 bg-red-500/5',
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

export default function InstalarPage() {
  const [origem, setOrigem] = useState('')
  const [perfilSelecionado, setPerfilSelecionado] = useState('usuario')
  const [copiado, setCopiado] = useState<string | null>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [pwaInstalado, setPwaInstalado] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)

  useEffect(() => {
    setOrigem(window.location.origin)

    // Detectar plataforma
    const ua = navigator.userAgent
    setIsIos(/iPhone|iPad|iPod/.test(ua))
    setIsAndroid(/Android/.test(ua))

    // Capturar evento de instalação PWA (Android/Chrome)
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Detectar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setPwaInstalado(true)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const perfil = PERFIS.find(p => p.id === perfilSelecionado)!
  const urlCompleta = origem ? `${origem}${perfil.path}` : perfil.path

  async function handleInstalar() {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setPwaInstalado(true)
        setDeferredPrompt(null)
      }
    }
  }

  async function copiarUrl(url: string) {
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
        <Link href="/" className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-all flex-shrink-0">
          <ArrowLeft className="w-4 h-4 text-zinc-400" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-white leading-none">Instalar no Celular</h1>
          <p className="text-sm text-zinc-500">Adicionar à tela inicial</p>
        </div>
        <div className="ml-auto w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-black fill-black" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-5 space-y-5">

        {/* STATUS PWA */}
        {pwaInstalado && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-black text-base text-emerald-400">App instalado!</p>
              <p className="text-sm text-zinc-400">Valente Conecta já está na sua tela inicial.</p>
            </div>
          </div>
        )}

        {/* INSTALAR AGORA (se disponível) */}
        {deferredPrompt && !pwaInstalado && (
          <button
            onClick={handleInstalar}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white rounded-2xl p-5 flex items-center gap-4 transition-all active:scale-95"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Download className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="font-black text-lg">Instalar Agora</p>
              <p className="text-base text-blue-200">Adicionar à tela inicial do Android</p>
            </div>
          </button>
        )}

        {/* ESCOLHER PERFIL */}
        <div className="space-y-3">
          <h2 className="text-lg font-black text-white uppercase italic tracking-tighter">Escolha o perfil</h2>
          <div className="space-y-2">
            {PERFIS.map(p => (
              <button
                key={p.id}
                onClick={() => setPerfilSelecionado(p.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                  perfilSelecionado === p.id
                    ? p.color + ' border-opacity-100'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0">
                  {p.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-base text-white">{p.label}</p>
                  <p className="text-sm text-zinc-500">{p.desc}</p>
                </div>
                {perfilSelecionado === p.id && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* QR CODE */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-black text-lg text-white">{perfil.label}</p>
              <p className="text-sm text-zinc-500">{perfil.desc}</p>
            </div>
            <span className={`text-xs font-black uppercase text-white px-2.5 py-1 rounded-full ${perfil.badge}`}>
              QR Code
            </span>
          </div>

          {/* QR centralizado */}
          <div className="flex justify-center">
            {origem ? (
              <div className="p-3 bg-zinc-800 rounded-2xl border border-zinc-700">
                <QRCodeImg url={urlCompleta} size={200} />
              </div>
            ) : (
              <div className="w-[200px] h-[200px] bg-zinc-800 border border-zinc-700 rounded-2xl flex items-center justify-center">
                <p className="text-zinc-600 text-sm">Carregando...</p>
              </div>
            )}
          </div>

          {/* URL */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 flex items-center gap-2">
            <p className="text-sm text-zinc-400 flex-1 truncate font-mono">{urlCompleta}</p>
            <button
              onClick={() => copiarUrl(urlCompleta)}
              className="flex-shrink-0 p-1.5 hover:bg-zinc-700 rounded-lg transition-all"
            >
              {copiado === urlCompleta
                ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                : <Copy className="w-4 h-4 text-zinc-500" />
              }
            </button>
          </div>

          <a
            href={urlCompleta}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-base font-black text-zinc-300 transition-all"
          >
            <ExternalLink className="w-4 h-4" /> Abrir direto
          </a>
        </div>

        {/* INSTRUÇÕES iOS */}
        {isIos && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <p className="font-black text-base text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-400" /> Como instalar no iPhone / iPad
            </p>
            <ol className="space-y-2 text-base text-zinc-400">
              <li className="flex gap-3"><span className="text-blue-400 font-black flex-shrink-0">1.</span> Abra o link acima no <strong className="text-white">Safari</strong></li>
              <li className="flex gap-3"><span className="text-blue-400 font-black flex-shrink-0">2.</span> Toque no ícone <strong className="text-white">Compartilhar</strong> (quadrado com seta para cima)</li>
              <li className="flex gap-3"><span className="text-blue-400 font-black flex-shrink-0">3.</span> Selecione <strong className="text-white">"Adicionar à Tela Inicial"</strong></li>
              <li className="flex gap-3"><span className="text-blue-400 font-black flex-shrink-0">4.</span> Confirme tocando em <strong className="text-white">"Adicionar"</strong></li>
            </ol>
          </div>
        )}

        {/* INSTRUÇÕES Android sem prompt */}
        {isAndroid && !deferredPrompt && !pwaInstalado && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <p className="font-black text-base text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-400" /> Como instalar no Android
            </p>
            <ol className="space-y-2 text-base text-zinc-400">
              <li className="flex gap-3"><span className="text-emerald-400 font-black flex-shrink-0">1.</span> Abra o link no <strong className="text-white">Chrome</strong></li>
              <li className="flex gap-3"><span className="text-emerald-400 font-black flex-shrink-0">2.</span> Toque no menu <strong className="text-white">⋮</strong> (três pontos)</li>
              <li className="flex gap-3"><span className="text-emerald-400 font-black flex-shrink-0">3.</span> Selecione <strong className="text-white">"Adicionar à tela inicial"</strong></li>
              <li className="flex gap-3"><span className="text-emerald-400 font-black flex-shrink-0">4.</span> Confirme tocando em <strong className="text-white">"Adicionar"</strong></li>
            </ol>
          </div>
        )}

        {/* INSTRUÇÕES Desktop */}
        {!isIos && !isAndroid && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <p className="font-black text-base text-white flex items-center gap-2">
              <Monitor className="w-5 h-5 text-zinc-400" /> Instalar pelo QR Code
            </p>
            <p className="text-base text-zinc-400">
              Aponte a câmera do celular para o QR Code acima para abrir o link direto.<br /><br />
              No celular, use o botão <strong className="text-white">"Instalar Agora"</strong> (Android) ou a opção <strong className="text-white">"Adicionar à Tela Inicial"</strong> no Safari (iPhone).
            </p>
          </div>
        )}

      </main>
    </div>
  )
}
