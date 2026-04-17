'use client'

import { useState } from 'react'
import { ArrowLeft, MapPin, Camera, Upload, Star, Gift, Trophy, Users, TrendingUp, User, Phone, CheckCircle, AlertCircle } from 'lucide-react'
import { useReferralSystem } from '@/hooks/useReferralSystem'
import { useLocationService } from '@/hooks/useLocationService'

export default function IndicarLojaPage() {
  const {
    referrals,
    wallet,
    userLevel,
    loading,
    error,
    createReferral,
    updateReferralStatus,
    usePoints,
    loadUserData
  } = useReferralSystem()

  const {
    location,
    loading: locationLoading,
    error: locationError,
    captureLocation,
    isLocationAvailable,
    isSecureContext
  } = useLocationService()

  const [step, setStep] = useState<'photo' | 'confirm' | 'responsible' | 'success'>('photo')
  const [formData, setFormData] = useState({
    storeName: '',
    storeLocation: '',
    storePhoto: null as File | null,
    storeImageUrl: '',
    responsibleName: '',
    responsibleWhatsapp: ''
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isProcessingOCR, setIsProcessingOCR] = useState(false)
  const [ocrResult, setOcrResult] = useState<any>(null)
  const [useManualInput, setUseManualInput] = useState(false)

  // Carregar dados do usuário
  useEffect(() => {
    const currentUserId = '00000000-0000-0000-0000-000000000001' // UUID válido para testes
    loadUserData(currentUserId)
  }, [loadUserData])

  const processImageWithOCR = async (file: File) => {
    setIsProcessingOCR(true)
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      
      if (result.success) {
        setOcrResult(result)
        setFormData(prev => ({
          ...prev,
          storeImageUrl: result.imageUrl,
          storeName: result.suggestedName || ''
        }))
        
        if (result.suggestedName && result.confidence > 0.7) {
          setStep('confirm')
        } else {
          setUseManualInput(true)
          setStep('confirm')
        }
      } else {
        throw new Error(result.error || 'Erro no processamento')
      }
    } catch (error) {
      console.error('Erro no OCR:', error)
      setUseManualInput(true)
      setStep('confirm')
    } finally {
      setIsProcessingOCR(false)
    }
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, storePhoto: file })
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      
      // Processar com OCR
      await processImageWithOCR(file)
    }
  }

  const handleConfirmStore = () => {
    if (!formData.storeName.trim()) {
      alert('Por favor, informe o nome da loja')
      return
    }
    setStep('responsible')
  }

  const handleCaptureLocation = async () => {
    if (!isLocationAvailable()) {
      alert('Geolocalização não disponível neste dispositivo')
      return
    }

    try {
      const locationData = await captureLocation()
      setFormData(prev => ({
        ...prev,
        storeLocation: locationData.address
      }))
    } catch (error: any) {
      alert('Erro ao capturar localização: ' + error.message)
    }
  }

  const handleSubmitReferral = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const currentUserId = '00000000-0000-0000-0000-000000000001' // UUID válido para testes
      
      // Criar indicação
      const referral = await createReferral(
        currentUserId,
        formData.storeName,
        formData.storeLocation,
        formData.storeImageUrl
      )

      // Enviar convite WhatsApp
      const response = await fetch('/api/whatsapp/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeName: formData.storeName,
          responsibleName: formData.responsibleName,
          whatsapp: formData.responsibleWhatsapp,
          referralId: referral.id,
          referrerName: 'Usuário Valente' // Em produção, pegar do contexto do usuário
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setStep('success')
      } else {
        throw new Error(result.error || 'Erro ao enviar convite')
      }
    } catch (err: any) {
      alert('Erro ao criar indicação: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusUpdate = async (referralId: string, status: 'registered' | 'active') => {
    try {
      await updateReferralStatus(referralId, status)
      alert('Status atualizado com sucesso!')
    } catch (err: any) {
      alert('Erro ao atualizar status: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-zinc-300 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </a>
          <h1 className="text-xl font-bold">Indicar Loja</h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Formulário de Indicação */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Gift className="w-8 h-8 text-yellow-500" />
                Indicar Nova Loja
              </h2>

              {/* Step 1: Foto */}
              {step === 'photo' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <Camera className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Tire uma foto da loja</h3>
                    <p className="text-zinc-400">Nosso sistema vai identificar o nome automaticamente</p>
                  </div>

                  <div className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center">
                    {previewUrl ? (
                      <div className="space-y-4">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        {isProcessingOCR && (
                          <div className="flex items-center justify-center gap-2 text-yellow-500">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></div>
                            <span>Processando imagem...</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewUrl(null)
                            setFormData({ ...formData, storePhoto: null, storeName: '', storeImageUrl: '' })
                            setStep('photo')
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          Tirar outra foto
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Camera className="w-16 h-16 text-zinc-500 mx-auto" />
                        <div>
                          <label className="cursor-pointer">
                            <span className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-600 transition inline-block">
                              Tirar Foto
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoChange}
                              className="hidden"
                              capture="environment"
                            />
                          </label>
                          <p className="text-zinc-500 text-sm mt-2">
                            Clique para usar a câmera ou fazer upload
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Confirmar Nome */}
              {step === 'confirm' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Confirme o nome da loja</h3>
                  </div>

                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Store"
                      className="w-full h-48 object-cover rounded-lg mb-6"
                    />
                  )}

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Nome da Loja *
                    </label>
                    <input
                      type="text"
                      value={formData.storeName}
                      onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Digite o nome da loja"
                      required
                    />
                    {ocrResult && ocrResult.confidence > 0.5 && (
                      <p className="text-xs text-zinc-500 mt-1">
                        🤖 Identificado automaticamente com {Math.round(ocrResult.confidence * 100)}% de confiança
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Localização *
                    </label>
                    <div className="space-y-3">
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                        <input
                          type="text"
                          value={formData.storeLocation}
                          onChange={(e) => setFormData({ ...formData, storeLocation: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          placeholder="Ex: Rua Principal, 123 - Centro, Coité-BA"
                          required
                        />
                      </div>
                      
                      {isLocationAvailable() && (
                        <div className="space-y-2">
                          {!isSecureContext() && (
                            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-3">
                              <p className="text-yellow-400 text-sm">
                                <AlertCircle className="w-4 h-4 inline mr-2" />
                                Para usar GPS, use HTTPS ou localhost
                              </p>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={handleCaptureLocation}
                            disabled={locationLoading || !isSecureContext()}
                            className="w-full bg-zinc-800 text-zinc-300 py-3 rounded-xl font-bold hover:bg-zinc-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {locationLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                                Capturando localização...
                              </>
                            ) : (
                              <>
                                <MapPin className="w-5 h-5" />
                                {isSecureContext() ? 'Usar Localização Atual (GPS)' : 'GPS Indisponível - Use HTTPS'}
                              </>
                            )}
                          </button>
                        </div>
                      )}
                      
                      {locationError && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3">
                          <p className="text-red-400 text-sm">{locationError.message}</p>
                        </div>
                      )}
                      
                      {location && (
                        <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-3">
                          <p className="text-green-400 text-sm flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Localização capturada com precisão de {Math.round(location.accuracy)}m
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep('photo')}
                      className="flex-1 bg-zinc-800 text-zinc-300 py-3 rounded-xl font-bold hover:bg-zinc-700 transition"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmStore}
                      className="flex-1 bg-yellow-500 text-black py-3 rounded-xl font-bold hover:bg-yellow-600 transition"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Responsável */}
              {step === 'responsible' && (
                <form onSubmit={handleSubmitReferral} className="space-y-6">
                  <div className="text-center mb-6">
                    <User className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Dados do Responsável</h3>
                    <p className="text-zinc-400">Vamos enviar um convite via WhatsApp</p>
                  </div>

                  <div className="bg-zinc-800 rounded-xl p-4 mb-6">
                    <p className="text-sm text-zinc-400 mb-1">Loja a ser indicada:</p>
                    <p className="font-bold text-white">{formData.storeName}</p>
                    <p className="text-sm text-zinc-400">{formData.storeLocation}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      Nome do Responsável *
                    </label>
                    <input
                      type="text"
                      value={formData.responsibleName}
                      onChange={(e) => setFormData({ ...formData, responsibleName: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Nome completo do responsável"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                      WhatsApp *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="tel"
                        value={formData.responsibleWhatsapp}
                        onChange={(e) => setFormData({ ...formData, responsibleWhatsapp: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        placeholder="(75) 12345-6789"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div className="text-sm text-blue-400">
                        <p className="font-semibold mb-1">O que acontece depois?</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Enviaremos um convite via WhatsApp</li>
                          <li>• O responsável aceita e completa o cadastro</li>
                          <li>• Você ganha 100 pontos quando a loja for cadastrada</li>
                          <li>• Mais 300 pontos quando a loja ativar o catálogo</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep('confirm')}
                      className="flex-1 bg-zinc-800 text-zinc-300 py-3 rounded-xl font-bold hover:bg-zinc-700 transition"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-yellow-500 text-black py-3 rounded-xl font-bold hover:bg-yellow-600 transition disabled:opacity-50"
                    >
                      {isSubmitting ? 'Enviando...' : 'Enviar Convite'}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 4: Sucesso */}
              {step === 'success' && (
                <div className="text-center py-8">
                  <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Convite Enviado!</h3>
                  <p className="text-zinc-400 mb-6">
                    O convite foi enviado para {formData.responsibleName} via WhatsApp.
                    Assim que ele aceitar, você receberá os pontos na sua carteira.
                  </p>
                  <button
                    onClick={() => {
                      setStep('photo')
                      setFormData({
                        storeName: '',
                        storeLocation: '',
                        storePhoto: null,
                        storeImageUrl: '',
                        responsibleName: '',
                        responsibleWhatsapp: ''
                      })
                      setPreviewUrl(null)
                    }}
                    className="bg-yellow-500 text-black px-8 py-3 rounded-xl font-bold hover:bg-yellow-600 transition"
                  >
                    Indicar Outra Loja
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Painel do Usuário */}
          <div className="space-y-6">
            {/* Carteira */}
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Minha Carteira
              </h3>
              
              <div className="space-y-4">
                <div className="bg-zinc-800 rounded-xl p-4">
                  <p className="text-zinc-400 text-sm">Saldo Atual</p>
                  <p className="text-3xl font-bold text-yellow-500">
                    {wallet?.balance || 0} pts
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-800 rounded-xl p-3">
                    <p className="text-zinc-400 text-xs">Total Ganhos</p>
                    <p className="text-lg font-semibold text-emerald-400">
                      {wallet?.total_earned || 0}
                    </p>
                  </div>
                  <div className="bg-zinc-800 rounded-xl p-3">
                    <p className="text-zinc-400 text-xs">Pontos Usados</p>
                    <p className="text-lg font-semibold text-red-400">
                      {wallet?.points_used || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Nível */}
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                Meu Nível
              </h3>
              
              <div className="space-y-4">
                <div className={`${userLevel?.badge_color} rounded-xl p-4`}>
                  <p className="text-white font-bold text-lg">{userLevel?.name}</p>
                  <p className="text-white/80 text-sm">{referrals.length} indicações</p>
                </div>
                
                <div className="text-sm text-zinc-400">
                  <p className="font-medium text-zinc-300 mb-2">Recompensas:</p>
                  <ul className="space-y-1">
                    {userLevel?.rewards.map((reward, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        {reward}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-yellow-500" />
                Estatísticas
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Total Indicadas</span>
                  <span className="font-bold">{referrals.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Pendentes</span>
                  <span className="font-bold text-yellow-500">
                    {referrals.filter(r => r.status === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Cadastradas</span>
                  <span className="font-bold text-blue-400">
                    {referrals.filter(r => r.status === 'registered').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Ativas</span>
                  <span className="font-bold text-emerald-400">
                    {referrals.filter(r => r.status === 'active').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Indicações */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Users className="w-8 h-8 text-yellow-500" />
            Minhas Indicações
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {referrals.map((referral) => (
              <div key={referral.id} className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                <div className="space-y-3">
                  <h3 className="font-bold text-lg">{referral.store_name}</h3>
                  <p className="text-zinc-400 text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {referral.store_location}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      referral.status === 'pending' 
                        ? 'bg-yellow-500/20 text-yellow-500'
                        : referral.status === 'registered'
                        ? 'bg-blue-500/20 text-blue-500'
                        : 'bg-emerald-500/20 text-emerald-500'
                    }`}>
                      {referral.status === 'pending' ? 'Pendente' : 
                       referral.status === 'registered' ? 'Cadastrada' : 'Ativa'}
                    </span>
                    <span className="text-yellow-500 font-bold">
                      {referral.points_earned} pts
                    </span>
                  </div>
                  
                  {/* Botões de Admin (simulação) */}
                  <div className="flex gap-2">
                    {referral.status === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(referral.id, 'registered')}
                        className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm"
                      >
                        Marcar Cadastrada
                      </button>
                    )}
                    {referral.status === 'registered' && (
                      <button
                        onClick={() => handleStatusUpdate(referral.id, 'active')}
                        className="flex-1 bg-emerald-500 text-white py-2 rounded-lg text-sm"
                      >
                        Ativar Catálogo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
