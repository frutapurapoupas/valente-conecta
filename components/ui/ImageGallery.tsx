'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Maximize2 } from 'lucide-react'

interface Image {
  id: string
  url: string
  title?: string
  description?: string
}

interface ImageGalleryProps {
  images: Image[]
  initialIndex?: number
  showThumbnails?: boolean
  allowDownload?: boolean
  className?: string
}

export function ImageGallery({ 
  images, 
  initialIndex = 0, 
  showThumbnails = true,
  allowDownload = true,
  className = ''
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)

  const currentImage = images[currentIndex]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          navigateImage('prev')
          break
        case 'ArrowRight':
          navigateImage('next')
          break
        case 'Escape':
          if (isFullscreen) {
            setIsFullscreen(false)
          }
          break
        case '+':
        case '=':
          handleZoom('in')
          break
        case '-':
        case '_':
          handleZoom('out')
          break
      }
    }

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        handleZoom(e.deltaY < 0 ? 'in' : 'out')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('wheel', handleWheel)
    }
  }, [isFullscreen])

  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1)
    } else {
      setCurrentIndex(prev => (prev + 1) % images.length)
    }
    setZoomLevel(1) // Reset zoom on navigation
  }

  const handleZoom = (direction: 'in' | 'out') => {
    if (direction === 'in') {
      setZoomLevel(prev => Math.min(prev + 0.25, 3))
    } else {
      setZoomLevel(prev => Math.max(prev - 0.25, 0.5))
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = currentImage.url
    link.download = currentImage.title || `image-${currentIndex + 1}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen()
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        (document.documentElement as any).webkitRequestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
    setZoomLevel(1) // Reset zoom
  }

  if (images.length === 0) return null

  return (
    <div className={`fixed inset-0 bg-black z-50 flex ${className}`}>
      {/* Header com informações */}
      <div className="absolute top-0 left-0 right-0 bg-black/80 backdrop-blur-sm z-10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-white text-lg font-medium">
              {currentImage.title || `Imagem ${currentIndex + 1} de ${images.length}`}
            </h2>
            {currentImage.description && (
              <p className="text-zinc-300 text-sm hidden lg:block">
                {currentImage.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Controles de Zoom */}
            <div className="flex items-center bg-black/50 rounded-lg px-2 py-1">
              <button
                onClick={() => handleZoom('out')}
                className="p-1 rounded hover:bg-white/20 transition"
                title="Diminuir zoom"
              >
                <ZoomOut className="w-4 h-4 text-white" />
              </button>
              <span className="text-white text-sm font-medium mx-2 min-w-[3rem] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => handleZoom('in')}
                className="p-1 rounded hover:bg-white/20 transition"
                title="Aumentar zoom"
              >
                <ZoomIn className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Botão de Download */}
            {allowDownload && (
              <button
                onClick={handleDownload}
                className="p-2 bg-black/50 rounded-lg hover:bg-white/20 transition"
                title="Baixar imagem"
              >
                <Download className="w-4 h-4 text-white" />
              </button>
            )}

            {/* Botão de Tela Cheia */}
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-black/50 rounded-lg hover:bg-white/20 transition"
              title="Tela cheia"
            >
              <Maximize2 className="w-4 h-4 text-white" />
              {isFullscreen ? 'Sair' : 'Tela cheia'}
            </button>
          </div>
        </div>
      </div>

      {/* Área Principal da Imagem */}
      <div className="flex-1 flex items-center justify-center overflow-hidden relative">
        <div 
          className="relative flex items-center justify-center"
          style={{ 
            transform: `scale(${zoomLevel})`,
            transition: 'transform 0.2s ease-in-out'
          }}
        >
          {/* Imagem Principal */}
          <img
            src={currentImage.url}
            alt={currentImage.title || `Imagem ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain cursor-move select-none"
            draggable={false}
            style={{
              maxHeight: isFullscreen ? '100vh' : '80vh',
              maxWidth: isFullscreen ? '100vw' : '90vw'
            }}
          />

          {/* Indicadores de Navegação */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => navigateImage('prev')}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 rounded-full hover:bg-black/70 transition"
                title="Imagem anterior"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => navigateImage('next')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 rounded-full hover:bg-black/70 transition"
                title="Próxima imagem"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}
        </div>

        {/* Contador de Imagens */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 px-3 py-2 rounded-full">
            <span className="text-white text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
        )}
      </div>

      {/* Thumbnails (opcional) */}
      {showThumbnails && images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 relative rounded-lg overflow-hidden transition-all ${
                    index === currentIndex 
                      ? 'ring-2 ring-white scale-110' 
                      : 'hover:scale-105 opacity-70 hover:opacity-100'
                  }`}
                  style={{ width: '80px', height: '60px' }}
                >
                  <img
                    src={image.url}
                    alt={image.title || `Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === currentIndex && (
                    <div className="absolute inset-0 ring-2 ring-white rounded-lg"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Botão Fechar */}
      <button
        onClick={() => {
          if (isFullscreen) {
            toggleFullscreen()
          }
          // Aqui você pode adicionar uma callback para fechar a galeria
        }}
        className="absolute top-4 right-4 p-2 bg-black/50 rounded-lg hover:bg-black/70 transition z-20"
        title="Fechar"
      >
        <X className="w-5 h-5 text-white" />
      </button>
    </div>
  )
}
