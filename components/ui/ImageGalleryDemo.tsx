'use client'

import { useState } from 'react'
import { ImageGallery } from './ImageGallery'

const demoImages = [
  {
    id: '1',
    url: 'https://picsum.photos/seed/valente1/1200/800.jpg',
    title: 'Valente Centro - Vista Panorâmica',
    description: 'Visão panorâmica do centro de Valente durante o pôr do sol'
  },
  {
    id: '2',
    url: 'https://picsum.photos/seed/valente2/1200/800.jpg',
    title: 'Praça da Matriz',
    description: 'Praça central onde acontece a feira livre aos sábados'
  },
  {
    id: '3',
    url: 'https://picsum.photos/seed/valente3/1200/800.jpg',
    title: 'Igreja Matriz',
    description: 'Igreja histórica no centro da cidade, patrimônio cultural'
  },
  {
    id: '4',
    url: 'https://picsum.photos/seed/valente4/1200/800.jpg',
    title: 'Caminho do Sertão',
    description: 'Antiga estrada que conecta Valente a outras cidades do sertão baiano'
  }
]

export default function ImageGalleryDemo() {
  const [showGallery, setShowGallery] = useState(false)

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-500 mb-2">Galeria de Imagens - Demo</h1>
          <p className="text-zinc-400 mb-6">
            Componente otimizado para exibição de imagens em desktop/notebook
          </p>
          <button
            onClick={() => setShowGallery(true)}
            className="bg-yellow-500 text-zinc-900 px-6 py-3 rounded-xl font-bold hover:bg-yellow-400 transition"
          >
            Abrir Galeria em Tela Cheia
          </button>
        </div>

        {/* Grid de Miniaturas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {demoImages.map((image, index) => (
            <div
              key={image.id}
              className="bg-zinc-800 rounded-xl overflow-hidden hover:ring-2 hover:ring-yellow-500 transition-all cursor-pointer"
              onClick={() => setShowGallery(true)}
            >
              <div className="aspect-video relative">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg">{image.title}</h3>
                  <p className="text-zinc-300 text-sm">{image.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Informações do Componente */}
        <div className="bg-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-yellow-500 mb-4">Características do Componente</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-white mb-3">Controles</h3>
              <ul className="space-y-2 text-zinc-300">
                <li>• Navegação com setas do teclado</li>
                <li>• Zoom com Ctrl + scroll ou +/-</li>
                <li>• Tela cheia com F11 ou botão</li>
                <li>• Download de imagens</li>
                <li>• Miniaturas navegáveis</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-3">Responsividade</h3>
              <ul className="space-y-2 text-zinc-300">
                <li>• Layout otimizado para desktop</li>
                <li>• Zoom até 300% sem perda de qualidade</li>
                <li>• Navegação fluida entre imagens</li>
                <li>• Controles intuitivos</li>
                <li>• Suporte a diferentes resoluções</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal da Galeria */}
      {showGallery && (
        <ImageGallery
          images={demoImages}
          initialIndex={0}
          showThumbnails={true}
          allowDownload={true}
          className="bg-black"
        />
      )}
    </div>
  )
}
