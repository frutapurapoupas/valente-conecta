// components/home/HomeViewNew.tsx
// ðŸŽ¨ UI PURA - View da Home

"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HomeData } from '@/types/home';
import HeaderHome from './HeaderHome';
import BuscaHome from './BuscaHome';
import CarrosselBanners from './CarrosselBanners';
import SecaoCategorias from './SecaoCategorias';
import SecaoEstatisticas from './SecaoEstatisticas';
import SecaoPlanos from './SecaoPlanos';
import VideoLancamento from './VideoLancamento';
import BotaoAdmin from './BotaoAdmin';

interface HomeViewNewProps {
  dados: HomeData | null;
  loading: boolean;
  bannerAtual: number;
  onBannerChange: (index: number) => void;
  onIndicacaoChange: (index: number) => void;
  onBuscar: (termo: string) => void;
}

export default function HomeViewNew({
  dados,
  loading,
  bannerAtual,
  onBannerChange,
  onIndicacaoChange,
  onBuscar,
}: HomeViewNewProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-600 to-indigo-600">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">Carregando Valente Conecta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-indigo-600">
      {/* Header */}
      <HeaderHome />

      {/* ConteÃºdo Principal */}
      <main className="container mx-auto px-4 pb-8 pt-4">
        {/* Barra de Busca */}
        <BuscaHome onBuscar={onBuscar} />

        {/* Card de Ofertas */}
        <div 
          className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-4 mb-4 text-white shadow-lg cursor-pointer hover:opacity-90 transition"
          onClick={() => router.push('/ofertas')}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg">ðŸ”¥ Ofertas do Dia</h2>
              <p className="text-sm opacity-90">Aproveite as melhores ofertas da cidade!</p>
            </div>
            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition">
              Ver Ofertas
            </button>
          </div>
        </div>

        {/* Card Indique */}
        <div 
          className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-4 mb-4 text-white shadow-lg cursor-pointer hover:opacity-90 transition"
          onClick={() => router.push('/indicacoes')}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg">ðŸ¤ Indique e Ganhe</h2>
              <p className="text-sm opacity-90">Indique amigos e ganhe benefÃ­cios!</p>
            </div>
            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition">
              Indicar
            </button>
          </div>
        </div>

        {/* Carrossel de Banners */}
        {dados?.banners && dados.banners.length > 0 && (
          <CarrosselBanners
            banners={dados.banners}
            bannerAtual={bannerAtual}
            onBannerChange={onBannerChange}
          />
        )}

        {/* Categorias */}
        {dados?.categorias && dados.categorias.length > 0 && (
          <SecaoCategorias categorias={dados.categorias} />
        )}

        {/* Planos */}
        {dados?.planos && dados.planos.length > 0 && (
          <SecaoPlanos planos={dados.planos} />
        )}

        {/* Pratos do Dia */}
        {dados?.pratos && dados.pratos.length > 0 && (
          <section className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <span>ðŸ½ï¸</span> Pratos do Dia
              </h2>
              <Link href="/cozinha" className="text-sm text-white/80 hover:text-white underline">
                Ver cardÃ¡pio completo
              </Link>
            </div>
            <div className="overflow-x-auto mt-3 pb-2">
              <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
                {dados.pratos.map((prato) => (
                  <Link href={`/cozinha/prato/${prato.id}`} key={prato.id}>
                    <div className="bg-white/10 rounded-xl p-3 min-w-[160px] backdrop-blur-sm hover:bg-white/20 transition-all cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
                          {prato.emoji || 'ðŸ½ï¸'}
                        </div>
                        {prato.badge && (
                          <span className="text-[10px] bg-yellow-500 text-white px-2 py-0.5 rounded-full whitespace-nowrap">
                            {prato.badge}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-sm">{prato.nome}</p>
                      <p className="text-xs opacity-90 line-clamp-2">{prato.descricao}</p>
                      <div className="mt-2">
                        {prato.preco > 0 ? (
                          <>
                            <span className="text-lg font-bold">R$ {prato.preco.toFixed(2)}</span>
                            {prato.original && prato.original > prato.preco && (
                              <span className="text-xs line-through opacity-70 ml-2">R$ {prato.original.toFixed(2)}</span>
                            )}
                          </>
                        ) : (
                          <span className="text-sm font-semibold">ðŸŽ GrÃ¡tis!</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* EstatÃ­sticas */}
        <SecaoEstatisticas />

        {/* VÃ­deo de LanÃ§amento */}
        <VideoLancamento />
      </main>

      {/* BotÃ£o Admin Master */}
      <BotaoAdmin />

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-sm mt-8 py-6 text-center text-white/60 text-sm">
        <p>Â© 2026 Valente Conecta - Todos os direitos reservados</p>
        <p className="text-xs mt-1">Valente, BA</p>
      </footer>
    </div>
  );
}

