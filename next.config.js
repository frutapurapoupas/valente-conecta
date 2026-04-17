/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  allowedDevOrigins: ['192.168.18.9', 'localhost', '127.0.0.1'],
  turbopack: {},
}
module.exports = nextConfig
