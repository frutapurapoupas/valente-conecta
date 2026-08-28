/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: { 
    domains: ['api.qrserver.com', 'valente-conecta.clic.com.br'],
    unoptimized: true 
  },
  staticPageGenerationTimeout: 60,

  // Precisa ser UNICO por deploy (era fixo 'valente-conecta-v2' antes —
  // nenhum mecanismo de deteccao de versao nova, incluindo o verificador em
  // components/VerificadorAtualizacao.tsx, conseguia perceber que existia
  // deploy novo, deixando quem ja tinha o app aberto/instalado preso na
  // versao antiga indefinidamente). VERCEL_GIT_COMMIT_SHA e' preenchido
  // automaticamente pela Vercel a cada deploy; fallback com timestamp cobre
  // rodar local (npm run dev/build fora da Vercel).
  generateBuildId: async () => {
    return process.env.VERCEL_GIT_COMMIT_SHA || `dev-${Date.now()}`;
  },

  env: {
    NEXT_PUBLIC_BUILD_ID: process.env.VERCEL_GIT_COMMIT_SHA || `dev-${Date.now()}`,
  },

  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;