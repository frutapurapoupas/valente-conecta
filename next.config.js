/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Configurações do Turbopack (se precisar)
  turbopack: {
    // Suas configurações do Turbopack aqui, se houver
  },
  
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