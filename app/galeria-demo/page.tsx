'use client'

import { useState } from 'react'
import { ImageGallery } from '@/components/ui/ImageGallery'

const demoImages = [
  {
    id: '1',
    url: '/api/placeholder-image?width=1200&height=800&text=Valente+Centro',
    title: 'Valente Centro - Vista Panorâmica',
    description: 'Visão panorâmica do centro de Valente durante o pôr do sol'
  },
  {
    id: '2',
    url: '/api/placeholder-image?width=1200&height=800&text=Praça+da+Matriz',
    title: 'Praça da Matriz',
    description: 'Praça central onde acontece a feira livre aos sábados'
  },
  {
    id: '3',
    url: '/api/placeholder-image?width=1200&height=800&text=Igreja+Matriz',
    title: 'Igreja Matriz',
    description: 'Igreja histórica no centro da cidade, patrimônio cultural'
  },
  {
    id: '4',
    url: '/api/placeholder-image?width=1200&height=800&text=Caminho+do+Sertão',
    title: 'Caminho do Sertão',
    description: 'Antiga estrada que conecta Valente a outras cidades do sertão baiano'
  },
  {
    id: '5',
    url: '/api/placeholder-image?width=1200&height=800&text=Cachoeira+de+Pedra',
    title: 'Cachoeira de Pedra',
    description: 'Cachoeira famosa nos arredores de Valente, ponto turístico'
  },
  {
    id: '6',
    url: '/api/placeholder-image?width=1200&height=800&text=Feira+Livre',
    title: 'Feira Livre de Valente',
    description: 'Feira tradicional que acontece aos sábados no centro da cidade'
  }
]

export default function GaleriaDemoPage() {
  const [showGallery, setShowGallery] = useState(false)

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-500 mb-2">Galeria de Imagens - Valente Conecta</h1>
          <p className="text-zinc-400 mb-6">
            Componente de exibição de imagens otimizado para desktop/notebook
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
                <li>• Navegação com setas do teclado (← →)</li>
                <li>• Zoom com Ctrl + scroll ou +/-</li>
                <li>• Tela cheia com F11 ou botão</li>
                <li>• Download de imagens individuais</li>
                <li>• Miniaturas navegáveis com clique</li>
                <li>• Contador de posição (1/6)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-3">Responsividade</h3>
              <ul className="space-y-2 text-zinc-300">
                <li>• Layout otimizado para desktop/notebook</li>
                <li>• Zoom até 300% sem perda de qualidade</li>
                <li>• Navegação fluida entre imagens</li>
                <li>• Controles intuitivos e sempre visíveis</li>
                <li>• Suporte a diferentes resoluções</li>
                <li>• Modo tela cheia imersivo</li>
              </ul>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="font-bold text-white mb-3">Performance</h3>
              <ul className="space-y-2 text-zinc-300">
                <li>• Lazy loading de imagens</li>
                <li>• Transições suaves de navegação</li>
                <li>• Event listeners otimizados</li>
                <li>• Memory management adequado</li>
                <li>• Zoom com transform CSS</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-3">Acessibilidade</h3>
              <ul className="space-y-2 text-zinc-300">
                <li>• Navegação por teclado completa</li>
                <li>• Indicadores visuais de estado</li>
                <li>• Contraste otimizado para imagens</li>
                <li>• Feedback tátil em todos os botões</li>
                <li>• Suporte a leitores de tela</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Como Usar */}
        <div className="bg-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-yellow-500 mb-4">Como Usar o Componente</h2>
          <div className="bg-zinc-900 rounded-lg p-4 mb-4">
            <pre className="text-zinc-300 text-sm overflow-x-auto">
{`import { ImageGallery } from '@/components/ui/ImageGallery'

const images = [
  { id: '1', url: '/imagem1.jpg', title: 'Título 1' },
  { id: '2', url: '/imagem2.jpg', title: 'Título 2' }
]

<ImageGallery
  images={images}
  initialIndex={0}
  showThumbnails={true}
  allowDownload={true}
  className="bg-black"
/>`}
            </pre>
          </div>
          
          <div className="space-y-3 text-zinc-300">
            <p className="font-medium text-white">Integração:</p>
            <ul className="space-y-2 text-sm">
              <li>• Importe o componente ImageGallery</li>
              <li>• Passe o array de imagens</li>
              <li>• Configure as opções desejadas</li>
              <li>• Adicione ao seu projeto</li>
            </ul>
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
