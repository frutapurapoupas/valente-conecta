/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permitir conexões do celular na mesma rede
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.*.*', '10.*.*.*', '172.*.*.*'],
  
  reactStrictMode: false,
  
  images: {
    domains: ['localhost', 'via.placeholder.com', 'picsum.photos'],
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig