/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=1, stale-while-revalidate=59', 
            // Diz ao navegador: "Confie por 1 segundo, depois verifique se mudou"
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig