'use client'

import { useState, useEffect } from 'react'
import { X, Search, MapPin, Package, Sparkles } from 'lucide-react'

interface OnboardingTutorialProps {
  isVisible: boolean
  onClose: () => void
  onDismiss: () => void
}

export default function OnboardingTutorial({ isVisible, onClose, onDismiss }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [viewCount, setViewCount] = useState(0)

  const steps = [
    {
      icon: Search,
      title: "1. Busque",
      description: "Digite ou fale o que você procura. Nossa IA corrige automaticamente e sugere melhores opções.",
      color: "bg-blue-500"
    },
    {
      icon: MapPin,
      title: "2. Localize",
      description: "Encontre as melhores ofertas perto de você. Sistema prioriza produtos locais com preços competitivos.",
      color: "bg-green-500"
    },
    {
      icon: Package,
      title: "3. Compare",
      description: "Compare preços de múltiplas lojas e economize. Intelência artificial encontra os melhores negócios.",
      color: "bg-purple-500"
    }
  ]

  useEffect(() => {
    if (isVisible) {
      setViewCount(prev => prev + 1)
      // Salvar no localStorage
      localStorage.setItem('onboarding_view_count', (viewCount + 1).toString())
    }
  }, [isVisible])

  useEffect(() => {
    // Auto-dismiss após 3 visualizações
    if (viewCount >= 3) {
      onDismiss()
    }
  }, [viewCount, onDismiss])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-4 border-white/20">
        {/* Header com gradiente vibrante */}
        <div className="relative p-8 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
                  <Sparkles className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-300 rounded-full animate-ping"></div>
              </div>
              <div>
                <h2 className="text-3xl font-black text-white mb-2 leading-tight">
                  🎉 Bem-vindo ao<br/>Valente Conecta!
                </h2>
                <p className="text-lg text-white/90 font-medium">
                  Descubra como economizar em 3 passos mágicos ✨
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {viewCount < 3 && (
                <button
                  onClick={onDismiss}
                  className="text-white/80 hover:text-white p-3 rounded-full hover:bg-white/10 transition-all"
                  title="Pular tutorial"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <span className="text-white text-sm font-medium">
                  {viewCount < 3 ? `👀 ${viewCount}/3` : '✅ Concluído'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content com cards vibrantes */}
        <div className="p-8 bg-gradient-to-b from-white/10 to-transparent">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative group cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                  currentStep === index
                    ? 'scale-105'
                    : 'hover:scale-102'
                }`}
                onClick={() => setCurrentStep(index)}
              >
                {currentStep === index && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-4 py-2 rounded-full font-bold shadow-lg animate-bounce">
                      PASSO {index + 1}
                    </div>
                  </div>
                )}
                
                <div className={`relative p-8 rounded-2xl border-2 transition-all backdrop-blur-sm ${
                  currentStep === index
                    ? 'border-white bg-white/90 shadow-2xl'
                    : 'border-white/20 bg-white/50 hover:bg-white/70'
                }`}>
                  {/* Background decorativo */}
                  <div className={`absolute inset-0 rounded-2xl opacity-10 ${
                    currentStep === index ? 'bg-gradient-to-br from-blue-400 to-purple-600' : 'bg-gray-400'
                  }`}></div>
                  
                  <div className="relative z-10 text-center">
                    <div className={`w-20 h-20 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl transform transition-transform group-hover:rotate-12`}>
                      <step.icon className="w-10 h-10 text-white drop-shadow-lg" />
                    </div>
                    <h3 className={`text-2xl font-bold mb-3 ${
                      currentStep === index ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-base leading-relaxed ${
                      currentStep === index ? 'text-gray-600' : 'text-gray-500'
                    }`}>
                      {step.description}
                    </p>
                    
                    {/* Indicador visual */}
                    {currentStep !== index && (
                      <div className="mt-4 text-gray-400 text-sm">
                        Clique para explorar →
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation melhorada */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/20">
            <div className="flex items-center gap-4">
              <div className="text-white/80 text-sm font-medium">
                Passo {currentStep + 1} de {steps.length}
              </div>
              <div className="flex gap-2">
                {[...Array(steps.length)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentStep ? 'bg-white w-8' : 'bg-white/30 w-2'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="px-6 py-3 text-sm font-medium text-white/70 bg-white/10 backdrop-blur-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all border border-white/20"
              >
                ← Anterior
              </button>
              <button
                onClick={() => {
                  if (currentStep < steps.length - 1) {
                    setCurrentStep(currentStep + 1)
                  } else {
                    onClose()
                  }
                }}
                className="px-8 py-3 text-base font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-xl transform transition-all hover:scale-105 border-2 border-white/30"
              >
                {currentStep < steps.length - 1 ? 'Próximo Passo →' : '🚀 Começar Agora!'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer com design moderno */}
        <div className="bg-gradient-to-r from-gray-900/90 to-black/90 px-8 py-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="text-white/80 text-sm">
                <div className="font-medium">💡 Dica Rápida</div>
                <div className="text-white/60 text-xs mt-1">
                  Este tutorial aparece apenas 3 vezes para não atrapalhar sua experiência
                </div>
              </div>
            </div>
            {viewCount < 3 && (
              <button
                onClick={onDismiss}
                className="text-white/60 hover:text-white px-6 py-3 rounded-xl hover:bg-white/10 transition-all border border-white/20"
              >
                Pular Tutorial →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
