'use client'

import Link from 'next/link'
import { ArrowLeft, Upload, Gavel, CheckCircle, Clock, Info, Image } from 'lucide-react'
import { useCarrosselLeilao } from '@/hooks/useCarrosselLeilao'

export default function LeilaoCarrosselPage() {
  const {
    slotSelecionado,
    setSlotSelecionado,
    meuLance,
    setMeuLance,
    imagemPreview,
    handleImagemUpload,
    handleEnviarLance,
    enviado,
    resetar,
    erroLance,
    slotsDisponiveis,
    LANCE_MINIMO,
  } = useCarrosselLeilao()

  if (enviado) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black">Lance enviado!</h2>
          <p className="text-zinc-400 text-sm">Registrado. O Admin irá analisar sua imagem. Se você vencer o leilão, o anúncio vai ao ar automaticamente na semana selecionada.</p>
          <button onClick={resetar} className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-black transition-all">
            Fazer outro lance
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <header className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur border-b border-zinc-900 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/anuncios" className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl">
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-black">Leilão Carrossel</h1>
            <p className="text-xs text-zinc-500">Semana 14/04 – 20/04/2026</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
            <Clock className="w-4 h-4" />
            Encerra em 22h
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">

        {/* Explicação */}
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-zinc-300 space-y-1">
            <p className="font-bold text-white">Como funciona?</p>
            <p>3 slots por semana. Maior lance garante o slot. Lance mínimo: <strong className="text-indigo-300">R$ {LANCE_MINIMO}/semana</strong>.</p>
            <p className="text-zinc-500">O Admin aprova a imagem antes da publicação.</p>
          </div>
        </div>

        {/* Slots */}
        <section className="space-y-3">
          <h2 className="text-sm font-black text-zinc-400 uppercase tracking-widest">Escolha seu Slot</h2>
          <div className="grid grid-cols-3 gap-3">
            {slotsDisponiveis.map(s => (
              <button
                key={s.slot}
                onClick={() => setSlotSelecionado(s.slot)}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  slotSelecionado === s.slot
                    ? 'border-violet-500/60 bg-violet-500/15'
                    : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                }`}
              >
                <p className="text-xs text-zinc-500 font-bold uppercase">Slot {s.slot}</p>
                <p className="text-xl font-black text-white font-mono mt-1">R$ {s.lanceAtual}</p>
                <p className="text-[10px] text-zinc-600 mt-1">Lance atual</p>
              </button>
            ))}
          </div>
        </section>

        {/* Valor do lance */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <label className="block text-sm font-black text-zinc-300">Seu Lance (R$/semana)</label>
          <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 focus-within:border-violet-500 transition-colors">
            <span className="text-zinc-500 font-bold">R$</span>
            <input
              type="number"
              value={meuLance}
              onChange={(e) => setMeuLance(e.target.value)}
              placeholder={`Mínimo ${LANCE_MINIMO}`}
              className="flex-1 outline-none text-2xl font-black font-mono bg-transparent text-white placeholder:text-zinc-600"
              min={LANCE_MINIMO}
              step="5"
            />
          </div>
          <p className="text-xs text-zinc-600">💡 Lance mínimo de partida: R$ {LANCE_MINIMO},00/semana</p>
        </section>

        {/* Upload de imagem */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <label className="block text-sm font-black text-zinc-300">
            Imagem do Anúncio <span className="text-zinc-600 font-normal">(máx. 500KB)</span>
          </label>
          {imagemPreview ? (
            <div className="relative">
              <img src={imagemPreview} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
              <button onClick={() => {}} className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded-lg text-xs font-bold">
                Trocar
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-700 rounded-xl p-8 cursor-pointer hover:border-violet-500/50 transition-all">
              <Image className="text-zinc-600 mb-2" size={40} />
              <span className="text-zinc-400 text-sm font-bold">Clique para selecionar imagem</span>
              <span className="text-zinc-600 text-xs mt-1">PNG, JPG, WebP — até 500KB</span>
              <input type="file" accept="image/*" onChange={handleImagemUpload} className="hidden" />
            </label>
          )}
          <p className="text-xs text-zinc-600">A imagem será revisada pelo Admin antes da publicação.</p>
        </section>

        {/* Erro */}
        {erroLance && (
          <p className="text-red-400 text-sm font-bold bg-red-500/10 px-4 py-3 rounded-xl border border-red-500/30">{erroLance}</p>
        )}

        {/* Botão enviar */}
        <button
          onClick={handleEnviarLance}
          className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          <Gavel size={22} />
          Enviar Lance
        </button>

      </main>
    </div>
  )
}
