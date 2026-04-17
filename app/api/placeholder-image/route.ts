import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const width = searchParams.get('width') || '1200'
  const height = searchParams.get('height') || '800'
  const text = searchParams.get('text') || 'Placeholder'
  
  // Criar uma imagem SVG com texto
  const svgContent = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#374151"/>
      <text x="50%" y="50%" 
            font-family="Arial, sans-serif" 
            font-size="24" 
            fill="#9CA3AF"
            text-anchor="middle" 
            dominant-baseline="middle">
        ${decodeURIComponent(text)}
      </text>
    </svg>
  `
  
  return new NextResponse(svgContent, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
