'use client'

import { X, Search, MapPin, Package, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

interface OnboardingTutorialProps {
  isVisible: boolean
  onClose: () => void
  onDismiss: () => void
}

export default function OnboardingTutorial({ isVisible, onClose, onDismiss }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [viewCount, setViewCount] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const steps = [
    {
      title: "1. Busque",
      description: "Digite ou fale o que você procura. Nossa IA corrige automaticamente e sugere melhores opções.",
      icon: Search,
      color: "bg-gradient-to-br from-blue-500 to-cyan-500"
    },
    {
      title: "2. Localize",
      description: "Encontre as melhores ofertas perto de você. Sistema prioriza produtos locais com preços competitivos.",
      icon: MapPin,
      color: "bg-gradient-to-br from-emerald-500 to-teal-500"
    },
    {
      title: "3. Compare",
      description: "Compare preços de múltiplas lojas e economize. Inteligência artificial encontra os melhores negócios.",
      icon: Package,
      color: "bg-gradient-to-br from-purple-500 to-pink-500"
    }
  ]

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (isMobile && scrollContainerRef.current) {
      const scrollAmount = currentStep * (280 + 16)
      scrollContainerRef.current.scrollTo({ left: scrollAmount, behavior: 'smooth' })
    }
  }, [currentStep, isMobile])

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      const views = parseInt(localStorage.getItem('onboarding_view_count') || '0')
      setViewCount(views)
    } else {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [isVisible])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleClose = () => {
    const currentViews = parseInt(localStorage.getItem('onboarding_view_count') || '0')
    localStorage.setItem('onboarding_view_count', (currentViews + 1).toString())
    if (currentViews + 1 >= 3) {
      localStorage.setItem('has_seen_onboarding', 'true')
    }
    onClose()
  }

  const handleDismiss = () => {
    localStorage.setItem('onboarding_view_count', '3')
    localStorage.setItem('has_seen_onboarding', 'true')
    onDismiss()
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 50) {
      diff > 0 ? handleNext() : handlePrev()
    }
  }

  const handleScroll = () => {
    if (isMobile && scrollContainerRef.current) {
      const scrollPosition = scrollContainerRef.current.scrollLeft
      const newStep = Math.round(scrollPosition / (280 + 16))
      if (newStep !== currentStep && newStep >= 0 && newStep < steps.length) {
        setCurrentStep(newStep)
      }
    }
  }

  if (!isVisible) return null
  if (parseInt(localStorage.getItem('onboarding_view_count') || '0') >= 3) return null

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border-4 border-white/20">
        
        <div className="sticky top-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 z-10 p-4 sm:p-8 border-b border-white/10">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-3xl font-black text-white leading-tight">🎉 Bem-vindo!</h2>
                <p className="text-white/80 text-xs sm:text-sm">Descubra como economizar ✨</p>
              </div>
            </div>
            <button onClick={handleClose} className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-8">
          
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-between mb-2 text-white/80 text-xs sm:text-sm">
              <span>Passo {currentStep + 1} de {steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="block md:hidden">
            <div 
              ref={scrollContainerRef}
              className="overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar"
              onScroll={handleScroll}
            >
              <div className="flex gap-4 w-max">
                {steps.map((step, index) => (
                  <div key={index} className="snap-center w-[280px] flex-shrink-0">
                    <div className={`p-6 rounded-2xl border-2 transition-all ${
                      currentStep === index ? 'border-white bg-white/90 shadow-2xl' : 'border-white/20 bg-white/50'
                    }`}>
                      <div className="text-center">
                        <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                          <step.icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className={`text-xl font-bold mb-2 ${currentStep === index ? 'text-gray-900' : 'text-gray-700'}`}>
                          {step.title}
                        </h3>
                        <p className={`text-sm ${currentStep === index ? 'text-gray-600' : 'text-gray-500'}`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {steps.map((_, i) => (
                <button key={i} onClick={() => setCurrentStep(i)} className={`h-2 rounded-full transition-all ${i === currentStep ? 'w-8 bg-white' : 'w-2 bg-white/30'}`} />
              ))}
            </div>
            <p className="text-center text-white/50 text-xs mt-3">👆 Deslize para os lados</p>
          </div>

          <div className="hidden md:grid md:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <div key={index} onClick={() => setCurrentStep(index)} className={`cursor-pointer p-6 rounded-2xl border-2 transition-all ${
                currentStep === index ? 'border-white bg-white/90 shadow-2xl scale-105' : 'border-white/20 bg-white/50 hover:bg-white/70'
              }`}>
                <div className="text-center">
                  <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${currentStep === index ? 'text-gray-900' : 'text-gray-700'}`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm ${currentStep === index ? 'text-gray-600' : 'text-gray-500'}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-8 pt-6 border-t border-white/20">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex-1 py-3 text-white/70 bg-white/10 rounded-xl disabled:opacity-50 hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-3 font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              {currentStep < steps.length - 1 ? 'Próximo →' : '🚀 Começar!'}
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-black/30">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-white/60 text-xs">
            <span>💡 Este tutorial aparece apenas 3 vezes</span>
            <button onClick={handleDismiss} className="hover:text-white transition-all">Pular Tutorial →</button>
          </div>
        </div>
      </div>
    </div>
  )
}