/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove 'swcMinify' - não é mais necessário no Next.js 16
  reactStrictMode: true,
  compress: true,
  generateEtags: true,
  
  // Otimizações de imagem
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // Headers de segurança e cache
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          }
        ],
      }
    ]
  },
  
  // Configuração do Turbopack (substitui o webpack)
  turbopack: {
    // Regras para loaders (se necessário)
    rules: {
      // Exemplo: se precisar de loader para SVG
      // '*.svg': {
      //   loaders: ['@svgr/webpack'],
      //   as: '*.js',
      // },
    },
    // Aliases de resolução
    resolveAlias: {
      // Exemplo: '@': './src',
    },
    // Extensões para resolver
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
    // Debug IDs para desenvolvimento
    debugIds: process.env.NODE_ENV === 'development',
  },
}

module.exports = nextConfig