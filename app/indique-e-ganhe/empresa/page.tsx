'use client'

import { useState, useEffect } from 'react'
import { Store, Upload, MapPin, Camera, Star, Gift, TrendingUp, Check, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function IndiqueEmpresaPage() {
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [formData, setFormData] = useState({
    storeName: '',
    storeLocation: '',
    storePhoto: null as File | null,
    responsibleName: '',
    responsibleWhatsapp: '',
    storeCategory: ''
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [referralStats, setReferralStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    currentBatch: 0,
    batchSize: 3,
    batchAmount: 2.00
  })

  const categories = [
    'Mercado', 'Farmácia', 'Restaurante', 'Padaria', 'Loja de Roupas',
    'Material de Construção', 'Posto de Gasolina', 'Hotel', 'Outros'
  ]

  useEffect(() => {
    // Carregar estatísticas do usuário
    setReferralStats({
      total: 1,
      completed: 0,
      pending: 1,
      currentBatch: 1,
      batchSize: 3,
      batchAmount: 2.00
    })
  }, [])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, storePhoto: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simular envio para API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setStep('success')
    } catch (error) {
      console.error('Erro ao enviar indicação:', error)
      alert('Erro ao enviar indicação. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-zinc-900 text-white p-4 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-yellow-500 mb-4">Indicação Enviada!</h1>
          <p className="text-zinc-400 mb-6">
            Sua indicação para {formData.storeName} foi recebida com sucesso. 
            Entraremos em contato com o responsável em breve.
          </p>
          <div className="bg-zinc-800 rounded-xl p-4 mb-6">
            <p className="text-yellow-400 font-medium mb-2">Seu Progresso:</p>
            <div className="flex justify-between mb-2">
              <span className="text-zinc-400">Empresas indicadas:</span>
              <span className="text-yellow-400 font-bold">{referralStats.currentBatch}/{referralStats.batchSize}</span>
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(referralStats.currentBatch / referralStats.batchSize) * 100}%` }}
              ></div>
            </div>
            <p className="text-zinc-400 text-sm mt-2">
              Faltam {referralStats.batchSize - referralStats.currentBatch} para ganhar R${referralStats.batchAmount.toFixed(2)}
            </p>
          </div>
          <button
            onClick={() => router.push('/indique-e-ganhe')}
            className="w-full bg-yellow-500 text-zinc-900 py-3 rounded-xl font-bold hover:bg-yellow-400 transition"
          >
            Voltar para Indicações
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-500 mb-2">Indique Empresa/Loja</h1>
          <p className="text-zinc-400">Ganhe R$2,00 a cada 3 empresas que se cadastrarem</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-800 rounded-xl p-4 text-center">
            <Store className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{referralStats.total}</p>
            <p className="text-zinc-400 text-sm">Total Indicadas</p>
          </div>
          <div className="bg-zinc-800 rounded-xl p-4 text-center">
            <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{referralStats.completed}</p>
            <p className="text-zinc-400 text-sm">Confirmadas</p>
          </div>
          <div className="bg-zinc-800 rounded-xl p-4 text-center">
            <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{referralStats.currentBatch}/{referralStats.batchSize}</p>
            <p className="text-zinc-400 text-sm">Lote Atual</p>
          </div>
          <div className="bg-zinc-800 rounded-xl p-4 text-center">
            <Gift className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">R${referralStats.batchAmount.toFixed(2)}</p>
            <p className="text-zinc-400 text-sm">Próximo Bônus</p>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-zinc-800 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Foto da Loja */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Foto da Loja *
              </label>
              <div className="flex flex-col items-center">
                {previewUrl ? (
                  <div className="relative w-48 h-48 mb-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewUrl(null)
                        setFormData({ ...formData, storePhoto: null })
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                    >
                      <AlertCircle className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="w-48 h-48 bg-zinc-700 border-2 border-dashed border-zinc-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-600 transition">
                    <Camera className="w-12 h-12 text-zinc-400 mb-2" />
                    <span className="text-zinc-400 text-sm">Tirar Foto</span>
                    <span className="text-zinc-500 text-xs">ou arrastar</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      required
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Nome da Loja */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Nome da Empresa/Loja *
              </label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Ex: Mercado Central Valente"
                required
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Categoria *
              </label>
              <select
                value={formData.storeCategory}
                onChange={(e) => setFormData({ ...formData, storeCategory: e.target.value })}
                className="w-full bg-zinc-700 border border-zinc-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Localização */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Localização *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  value={formData.storeLocation}
                  onChange={(e) => setFormData({ ...formData, storeLocation: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-700 border border-zinc-600 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Ex: Rua Principal, 123 - Centro, Valente-BA"
                  required
                />
              </div>
            </div>

            {/* Responsável */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Nome do Responsável *
                </label>
                <input
                  type="text"
                  value={formData.responsibleName}
                  onChange={(e) => setFormData({ ...formData, responsibleName: e.target.value })}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Nome completo"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  value={formData.responsibleWhatsapp}
                  onChange={(e) => setFormData({ ...formData, responsibleWhatsapp: e.target.value })}
                  className="w-full bg-zinc-700 border border-zinc-600 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="(75) 9xxxx-xxxx"
                  required
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push('/indique-e-ganhe')}
                className="flex-1 bg-zinc-700 text-zinc-300 py-3 rounded-xl font-bold hover:bg-zinc-600 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-yellow-500 text-zinc-900 py-3 rounded-xl font-bold hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Indicação'}
              </button>
            </div>
          </form>
        </div>

        {/* Como Funciona */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl p-6 mt-8 border border-yellow-500/30">
          <h3 className="text-lg font-bold text-yellow-400 mb-4">Como Funciona</h3>
          <div className="space-y-3 text-zinc-300">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-yellow-500 text-zinc-900 rounded-full flex items-center justify-center font-bold">1</div>
              <p>Preencha os dados da empresa/loja que deseja indicar</p>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-yellow-500 text-zinc-900 rounded-full flex items-center justify-center font-bold">2</div>
              <p>Tire uma foto do estabelecimento</p>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-yellow-500 text-zinc-900 rounded-full flex items-center justify-center font-bold">3</div>
              <p>Entraremos em contato com o responsável para finalizar o cadastro</p>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-yellow-500 text-zinc-900 rounded-full flex items-center justify-center font-bold">4</div>
              <p>A cada 3 empresas confirmadas, você ganha R$2,00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
