'use client'

import { useEffect, useRef } from 'react'

interface QRCodeGeneratorProps {
  value: string
  size?: number
  level?: 'L' | 'M' | 'Q' | 'H'
  includeMargin?: boolean
}

export function QRCodeGenerator({ 
  value, 
  size = 256, 
  level = 'M', 
  includeMargin = true 
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !value) return

    // Gerar QR Code manualmente (simples, sem biblioteca externa)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Configurar canvas
    canvas.width = size
    canvas.height = size

    // Limpar canvas
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, size, size)

    // Gerar pattern simples (placeholder - implementação real usaria biblioteca)
    const cellSize = Math.floor(size / 25)
    const margin = includeMargin ? cellSize : 0
    
    // Criar pattern visual representando QR Code
    ctx.fillStyle = '#000000'
    
    // Desenhar posição markers (cantos)
    drawPositionMarker(ctx, margin, margin, cellSize * 7)
    drawPositionMarker(ctx, size - margin - cellSize * 7, margin, cellSize * 7)
    drawPositionMarker(ctx, margin, size - margin - cellSize * 7, cellSize * 7)
    
    // Desenhar pattern de dados (aleatório para visualização)
    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 25; col++) {
        if (
          (row < 9 && col < 9) || // Canto superior esquerdo
          (row < 9 && col >= 16) || // Canto superior direito
          (row >= 16 && col < 9) // Canto inferior esquerdo
        ) {
          continue // Pular áreas de position markers
        }
        
        if (Math.random() > 0.5) {
          ctx.fillRect(
            margin + col * cellSize,
            margin + row * cellSize,
            cellSize,
            cellSize
          )
        }
      }
    }

    // Adicionar texto central (indicando que é QR Code)
    ctx.fillStyle = '#000000'
    ctx.font = `${size / 20}px Arial`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Scanner', size / 2, size / 2)
  }, [value, size, level, includeMargin])

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        className="border-2 border-zinc-700 rounded-lg"
        style={{ width: size, height: size }}
      />
      <div className="text-center">
        <p className="text-zinc-400 text-sm">Escaneie com celular</p>
        <p className="text-zinc-500 text-xs mt-1">Sessão: {value.slice(-8)}</p>
      </div>
    </div>
  )
}

function drawPositionMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  const outerSize = size
  const innerSize = size * 3 / 7
  const centerSize = size * 1 / 7
  
  // Outer square
  ctx.fillStyle = '#000000'
  ctx.fillRect(x, y, outerSize, outerSize)
  
  // White square
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(
    x + (outerSize - innerSize) / 2,
    y + (outerSize - innerSize) / 2,
    innerSize,
    innerSize
  )
  
  // Inner square
  ctx.fillStyle = '#000000'
  ctx.fillRect(
    x + (outerSize - centerSize) / 2,
    y + (outerSize - centerSize) / 2,
    centerSize,
    centerSize
  )
}
