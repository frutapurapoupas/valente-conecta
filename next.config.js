/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { domains: ['api.qrserver.com'] },
  // Desabilitar geração estática para rotas problemáticas
  staticPageGenerationTimeout: 120,
  // Configurar rotas dinâmicas
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ];
  },
}

module.exports = nextConfig
