/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Imagens - configure se necessário
  images: {
    domains: [], // Adicione domínios de imagens externas se precisar
  },
  
  // Compiler options (substitui o antigo swcMinify)
  compiler: {
    // removeConsole: process.env.NODE_ENV === 'production', // opcional
  },
}

module.exports = nextConfig