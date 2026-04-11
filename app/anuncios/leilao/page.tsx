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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Lance enviado!</h2>
          <p className="text-gray-500 mb-2">Seu lance foi registrado. O Admin irá analisar sua imagem.</p>
          <p className="text-sm text-gray-400 mb-8">
            Se o leilão encerrar com você como maior lance, seu anúncio entra automaticamente na semana selecionada.
          </p>
          <button onClick={resetar} className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-bold">
            Fazer outro lance
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
          <Link href="/anuncios" className="p-2 hover:bg-white/20 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-bold text-lg">Leilão Carrossel</h1>
            <p className="text-xs text-purple-200">Semana 14/04 – 20/04/2026</p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-purple-200">
            <Clock className="w-4 h-4" />
            Encerra em 22h
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6 pt-6">

        {/* Explicação do sistema */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Como funciona?</strong></p>
              <p>Há 3 slots disponíveis por semana. Lance o maior valor por semana e garanta seu slot. Lance mínimo: <strong>R$ {LANCE_MINIMO},00/semana</strong>.</p>
              <p>Após o leilão encerrar (24h antes da publicação), o Admin aprova a imagem e o anúncio vai ao ar.</p>
            </div>
          </div>
        </div>

        {/* Slots disponíveis */}
        <section>
          <h2 className="font-bold text-gray-700 mb-3">Escolha seu Slot</h2>
          <div className="grid grid-cols-3 gap-3">
            {slotsDisponiveis.map(s => (
              <button
                key={s.slot}
                onClick={() => setSlotSelecionado(s.slot)}
                className={`p-4 rounded-2xl border-2 text-center transition-all ${
                  slotSelecionado === s.slot
                    ? 'border-purple-600 bg-purple-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
              >
                <p className="text-xs text-gray-500 font-bold uppercase">Slot {s.slot}</p>
                <p className="text-xl font-bold text-gray-800 font-mono mt-1">R$ {s.lanceAtual}</p>
                <p className="text-[10px] text-gray-400 mt-1">Lance atual</p>
              </button>
            ))}
          </div>
        </section>

        {/* Valor do lance */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <label className="block text-sm font-bold text-gray-700 mb-2">Seu Lance (R$/semana)</label>
          <div className="flex items-center gap-2 border-2 border-gray-200 rounded-xl px-4 py-2 focus-within:border-purple-500">
            <span className="text-gray-500 font-bold">R$</span>
            <input
              type="number"
              value={meuLance}
              onChange={(e) => setMeuLance(e.target.value)}
              placeholder={`Mínimo ${LANCE_MINIMO}`}
              className="flex-1 outline-none text-2xl font-bold font-mono"
              min={LANCE_MINIMO}
              step="5"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">💡 Lance mínimo de partida: R$ {LANCE_MINIMO},00/semana</p>
        </section>

        {/* Upload de imagem */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Imagem do Anúncio <span className="text-gray-400 font-normal">(máx. 500KB)</span>
          </label>
          {imagemPreview ? (
            <div className="relative">
              <img src={imagemPreview} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
              <button onClick={() => {}} className="absolute top-2 right-2 bg-black/60 text-white px-3 py-1 rounded-lg text-xs font-bold">
                Trocar
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-purple-400 transition-all">
              <Image className="text-gray-300 mb-2" size={40} />
              <span className="text-gray-500 text-sm font-bold">Clique para selecionar imagem</span>
              <span className="text-gray-400 text-xs mt-1">PNG, JPG, WebP — até 500KB</span>
              <input type="file" accept="image/*" onChange={handleImagemUpload} className="hidden" />
            </label>
          )}
          <p className="text-xs text-gray-400 mt-2">A imagem será revisada pelo Admin antes da publicação.</p>
        </section>

        {/* Erro */}
        {erroLance && (
          <p className="text-red-500 text-sm font-bold bg-red-50 px-4 py-3 rounded-xl border border-red-200">{erroLance}</p>
        )}

        {/* Botão enviar */}
        <button
          onClick={handleEnviarLance}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
        >
          <Gavel size={22} />
          Enviar Lance
        </button>

      </main>
    </div>
  )
}
