/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['source.unsplash.com', 'via.placeholder.com', 'api.qrserver.com'],
    unoptimized: false,
  },
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  trailingSlash: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
