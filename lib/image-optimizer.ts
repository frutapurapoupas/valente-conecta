// lib/image-optimizer.ts
export const imageLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  // Usar CDN se disponível
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || ''
  
  // Otimizações para diferentes dispositivos
  const getOptimalWidth = () => {
    if (typeof window === 'undefined') return width
    
    const screenWidth = window.innerWidth
    if (screenWidth < 640) return Math.min(width, 640)
    if (screenWidth < 768) return Math.min(width, 768)
    if (screenWidth < 1024) return Math.min(width, 1024)
    return width
  }
  
  const optimalWidth = getOptimalWidth()
  const optimalQuality = quality || (optimalWidth < 640 ? 70 : 80)
  
  return `${cdnUrl}/_next/image?url=${encodeURIComponent(src)}&w=${optimalWidth}&q=${optimalQuality}`
}