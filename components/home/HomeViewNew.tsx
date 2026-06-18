'use client';

// ============================================
// PROPOSTA VISUAL - HOME VIEW NEW
// ============================================
// Redesenho completo da Home Principal com:
// - Glassmorphism, rounded-2xl, sombras suaves
// - Micro-interações hover/scale/opacity
// - Header degradê azul-índigo escuro sofisticado
// - Preserva 100% das funcionalidades existentes
// - Preserva Feature Flags (MODULE_FLAGS) intactas
// ============================================

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Utensils, Handshake, Play, X, Crown, ChevronRight,
  Users, Store, Shield, Search, Mic, MapPin,
  Sparkles, ChevronLeft, Star, TrendingUp, Award
} from 'lucide-react';
import { useState } from 'react';
import { homeConstants } from '@/constants/homeConstants';
import { filterCategoriasByFlags, CURRENT_ENV } from '@/config/modules';
import BuscaInteligente from '@/components/busca/BuscaInteligente';
import NotificacaoSininho from '@/components/NotificacaoSininho';

// ============================================
// TYPES (mantendo contrato com app/page.tsx)
// ============================================
interface HomeViewNewProps {
  bannerAtual: number;
  abaAtual: number;
  isAdmin: boolean;
  user: any;
  onSearchResult: (produto: any) => void;
}

// ============================================
// MAPEAMENTO DE ÍCONES DAS CATEGORIAS
// ============================================
const iconMap: Record<string, any> = {
  Store: Store, Pizza: Utensils, Dumbbell: TrendingUp,
  Bike: TrendingUp, Wrench: Sparkles, Users: Users,
  Briefcase: Star, Building2: Star, Car: TrendingUp,
  HeartPulse: Sparkles, GraduationCap: Sparkles,
  Scissors: Sparkles, Gamepad2: Sparkles, Plane: TrendingUp,
  UsersIcon: Users, Crown: Crown, Shield: Shield
};

// ============================================
// COMPONENTE PRINCIPAL HOMEVIEWNEW
// ============================================
export default function HomeViewNew({
  bannerAtual,
  abaAtual,
  isAdmin,
  user,
  onSearchResult
}: HomeViewNewProps) {
  const router = useRouter();
  const { titulos, pratos, banners, abasIndique, planos, estatisticas } = homeConstants;
  const categoriasVisiveis = filterCategoriasByFlags(homeConstants.categorias);

  // Estado do vídeo
  const [showVideo, setShowVideo] = useState(false);

  // ==========================================
  // SECTION 1.0 - HEADER AZUL REFINADO
  // ==========================================
  const renderHeader = () => (
    <header className="
      sticky top-0 z-50
      bg-gradient-to-br from-[#0a1a3a] via-[#0f2b5e] to-[#1a3a7a]
      shadow-[0_8px_32px_rgba(10,26,58,0.4)]
      border-b border-white/10
    ">
      {/* Efeito de brilho sutil no topo */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 py-3 relative">
        <div className="flex justify-between items-center">
          {/* Logo e Nome */}
          <div className="flex items-center gap-3">
            <div className="
              w-10 h-10 rounded-2xl
              bg-gradient-to-br from-white/20 to-white/5
              backdrop-blur-md border border-white/20
              flex items-center justify-center
              shadow-lg shadow-blue-900/30
            ">
              <span className="text-lg">🏪</span>
            </div>
            <div>
              <span className="font-extrabold text-lg text-white drop-shadow-sm">
                Valente Conecta
              </span>
              <span className="block text-[10px] text-blue-200/70 font-medium -mt-0.5">
                Sua cidade na palma da mão
              </span>
            </div>
          </div>

          {/* Geolocalização + Sininho + Admin */}
          <div className="flex items-center gap-2">
            {/* Badge Localização */}
            <div className="
              hidden sm:flex items-center gap-1.5
              bg-white/10 backdrop-blur-md
              border border-white/15
              rounded-xl px-3 py-1.5
            ">
              <MapPin className="w-3.5 h-3.5 text-blue-200" />
              <span className="text-xs text-blue-100 font-medium">Valente, BA</span>
            </div>

            <NotificacaoSininho />

            {isAdmin && (
              <Link
                href="/admin"
                className="
                  w-9 h-9 rounded-xl
                  bg-white/10 backdrop-blur-md
                  border border-white/20
                  flex items-center justify-center
                  hover:bg-white/20 hover:scale-105
                  active:scale-95
                  transition-all duration-200
                "
              >
                <Shield className="w-4 h-4 text-blue-200" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  // ==========================================
  // SECTION 1.2 - GEOLOCALIZAÇÃO (mobile)
  // ==========================================
  const renderGeolocalizacaoMobile = () => (
    <div className="sm:hidden px-4 pt-3 pb-1">
      <div className="
        flex items-center gap-2
        bg-gradient-to-r from-blue-50 to-indigo-50
        border border-blue-100
        rounded-xl px-3 py-2
      ">
        <MapPin className="w-4 h-4 text-blue-600" />
        <span className="text-xs font-medium text-blue-800">Você está em Valente, BA</span>
        <span className="ml-auto text-[10px] text-blue-400 bg-blue-100 px-2 py-0.5 rounded-full">
          ✅ Verificado
        </span>
      </div>
    </div>
  );

  // ==========================================
  // SECTION 1.3 - BUSCA COM VOZ
  // ==========================================
  const renderBusca = () => (
    <div className="
      sticky top-[68px] z-40
      bg-white/80 backdrop-blur-xl
      border-b border-gray-100/80
      shadow-sm
    ">
      <div className="container mx-auto px-4 py-3">
        <div className="
          group
          flex items-center gap-3
          bg-gradient-to-r from-gray-50 to-white
          border-2 border-gray-200
          focus-within:border-blue-400
          focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.1)]
          rounded-2xl px-4 py-2.5
          transition-all duration-300
        ">
          <Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <div className="flex-1">
            <BuscaInteligente
              onResultadoClick={onSearchResult}
              placeholder="🔍 Buscar produtos, serviços, profissionais..."
            />
          </div>
          <button className="
            w-9 h-9 rounded-xl
            bg-gradient-to-br from-blue-50 to-indigo-50
            hover:from-blue-100 hover:to-indigo-100
            border border-blue-200
            flex items-center justify-center
            hover:scale-105 active:scale-95
            transition-all duration-200
          ">
            <Mic className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // SECTION 1.4 - CARD OFERTAS (PRATOS DO DIA)
  // ==========================================
  const renderCardOfertas = () => (
    <div className="
      relative overflow-hidden
      bg-gradient-to-br from-[#dc2626] via-[#ea580c] to-[#f97316]
      rounded-3xl p-5 mb-6 text-white
      shadow-[0_12px_40px_rgba(220,38,38,0.25)]
      group hover:shadow-[0_16px_48px_rgba(220,38,38,0.35)]
      transition-all duration-500
    ">
      {/* Efeito de brilho sutil */}
      <div className="
        absolute -top-20 -right-20 w-40 h-40
        bg-white/10 rounded-full blur-3xl
        group-hover:scale-150 transition-transform duration-700
      " />
      <div className="
        absolute -bottom-10 -left-10 w-24 h-24
        bg-white/5 rounded-full blur-2xl
      " />

      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="
              w-10 h-10 rounded-xl
              bg-white/20 backdrop-blur-md
              border border-white/25
              flex items-center justify-center
            ">
              <Utensils className="w-5 h-5" />
            </div>
            <h2 className="font-extrabold text-lg drop-shadow-sm">
              {titulos.pratosDoDia}
            </h2>
          </div>
          <Link
            href="/cozinha"
            className="
              text-xs font-semibold
              bg-white/20 backdrop-blur-md
              border border-white/25
              rounded-xl px-3 py-1.5
              hover:bg-white/30 hover:scale-105
              active:scale-95
              transition-all duration-200
            "
          >
            Ver cardápio →
          </Link>
        </div>

        {/* Scroll horizontal de pratos */}
        <div className="overflow-x-auto mt-4 pb-2 scrollbar-hide">
          <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
            {pratos.map((prato) => (
              <Link href={prato.link} key={prato.id}>
                <div className="
                  group/card
                  bg-white/10 backdrop-blur-md
                  border border-white/15
                  rounded-2xl p-4 min-w-[180px]
                  hover:bg-white/20 hover:scale-[1.02]
                  hover:border-white/30
                  active:scale-[0.98]
                  transition-all duration-300
                  cursor-pointer
                ">
                  {/* Emoji com fundo */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="
                      w-11 h-11 rounded-xl
                      bg-white/15
                      flex items-center justify-center text-2xl
                    ">
                      {prato.emoji}
                    </div>
                    {prato.badge && (
                      <span className="
                        text-[10px] font-bold tracking-wider
                        bg-yellow-400 text-yellow-900
                        px-2 py-0.5 rounded-full
                      ">
                        {prato.badge}
                      </span>
                    )}
                  </div>

                  <p className="font-bold text-sm drop-shadow-sm">{prato.titulo}</p>
                  <p className="text-xs text-white/70 line-clamp-2 mt-1">{prato.descricao}</p>

                  <div className="mt-3 pt-2 border-t border-white/10">
                    {prato.preco > 0 ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-extrabold">
                          R$ {prato.preco.toFixed(2)}
                        </span>
                        <span className="text-xs line-through text-white/50">
                          R$ {prato.original.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm font-bold">🎁 Grátis!</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // SECTION 1.5 - CARD INDIQUE ROTATIVO
  // ==========================================
  const renderCardIndique = () => {
    const aba = abasIndique[abaAtual];
    return (
      <div
        onClick={() => router.push('/indicacoes')}
        className="
          relative overflow-hidden cursor-pointer
          bg-gradient-to-br from-[#059669] via-[#10b981] to-[#34d399]
          rounded-3xl p-5 mb-6 text-white
          shadow-[0_12px_40px_rgba(5,150,105,0.25)]
          group hover:shadow-[0_16px_48px_rgba(5,150,105,0.35)]
          transition-all duration-500
        "
      >
        {/* Efeitos decorativos */}
        <div className="
          absolute -top-16 -right-16 w-32 h-32
          bg-white/10 rounded-full blur-3xl
          group-hover:scale-150 transition-transform duration-700
        " />
        <div className="
          absolute -bottom-8 -left-8 w-20 h-20
          bg-white/5 rounded-full blur-2xl
        " />

        <div className="relative">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="
                w-10 h-10 rounded-xl
                bg-white/20 backdrop-blur-md
                border border-white/25
                flex items-center justify-center
              ">
                <Handshake className="w-5 h-5" />
              </div>
              <h2 className="font-extrabold text-lg drop-shadow-sm">
                {titulos.indicacaoPremiada}
              </h2>
              {/* Badge animado */}
              <span className="
                hidden sm:inline-flex text-[10px] font-bold
                bg-yellow-400 text-yellow-900
                px-2 py-0.5 rounded-full
                animate-pulse
              ">
                🔥 R$10
              </span>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); router.push('/indicacoes'); }}
              className="
                bg-white/20 backdrop-blur-md
                border border-white/25
                rounded-xl px-4 py-2
                font-semibold text-sm
                hover:bg-white/30 hover:scale-105
                active:scale-95
                transition-all duration-200
              "
            >
              Indicar Agora
            </button>
          </div>

          {/* Aba rotativa com transição suave */}
          <div className="mt-4 h-12 flex items-center">
            <div
              key={abaAtual}
              className="
                inline-flex items-center gap-2
                bg-white/15 backdrop-blur-sm
                border border-white/20
                rounded-full px-4 py-2
                animate-fadeIn
              "
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <p className="text-sm font-medium drop-shadow-sm">
                {aba.texto}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // SECTION 1.6 - CATEGORIAS (5 blocos × 6 cards)
  // ==========================================
  const renderCategorias = () => {
    if (categoriasVisiveis.length === 0) return null;

    // Divide as categorias em blocos de até 6
    const blocos: typeof categoriasVisiveis[] = [];
    for (let i = 0; i < categoriasVisiveis.length; i += 6) {
      blocos.push(categoriasVisiveis.slice(i, i + 6));
    }

    return (
      <div className="mb-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="
              w-8 h-8 rounded-xl
              bg-gradient-to-br from-blue-500 to-indigo-600
              flex items-center justify-center
              shadow-lg shadow-blue-500/25
            ">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-extrabold text-lg text-gray-800">
              {titulos.categorias}
            </h2>
            {CURRENT_ENV === "development" && (
              <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                {categoriasVisiveis.length} ativas
              </span>
            )}
          </div>
        </div>

        {blocos.map((bloco, idx) => (
          <div key={idx} className="
            bg-white
            rounded-3xl p-4
            border border-gray-100
            shadow-[0_4px_20px_rgba(0,0,0,0.04)]
            hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]
            transition-shadow duration-300
          ">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {bloco.map((cat) => {
                const Icon = iconMap[cat.icon] || Sparkles;
                return (
                  <Link
                    key={cat.id}
                    href={cat.href}
                    className="
                      group/cat
                      flex flex-col items-center gap-2
                      p-3 rounded-2xl
                      hover:bg-gray-50
                      hover:scale-[1.03]
                      active:scale-[0.97]
                      transition-all duration-200
                    "
                  >
                    <div className={`
                      ${cat.cor}
                      w-12 h-12 rounded-2xl
                      flex items-center justify-center
                      shadow-md
                      group-hover/cat:shadow-lg
                      group-hover/cat:scale-110
                      transition-all duration-200
                    `}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[11px] font-semibold text-gray-600 text-center leading-tight group-hover/cat:text-gray-900 transition-colors">
                      {cat.nome}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ==========================================
  // SECTION 1.7 - CARROSSEL BANNERS
  // ==========================================
  const renderCarrosselBanners = () => (
    <div className="mb-8">
      <div className="
        relative rounded-3xl overflow-hidden
        h-36 md:h-44
        shadow-[0_8px_30px_rgba(0,0,0,0.08)]
      ">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`
              absolute inset-0
              transition-all duration-700 ease-in-out
              ${index === bannerAtual ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}
            `}
          >
            <Link
              href={banner.link}
              className={`
                bg-gradient-to-r ${banner.cor}
                w-full h-full flex items-center justify-center p-6
                relative overflow-hidden
              `}
            >
              {/* Efeito decorativo */}
              <div className="
                absolute -top-10 -right-10 w-24 h-24
                bg-white/10 rounded-full blur-2xl
              " />
              <div className="
                absolute -bottom-6 -left-6 w-16 h-16
                bg-white/5 rounded-full blur-xl
              " />

              <div className="text-center text-white relative">
                <h3 className="text-2xl md:text-3xl font-extrabold drop-shadow-md">
                  {banner.titulo}
                </h3>
                <p className="text-sm md:text-base opacity-90 mt-1">{banner.descricao}</p>
                <span className="
                  inline-block mt-3 text-xs font-semibold
                  bg-white/20 backdrop-blur-sm
                  border border-white/30
                  rounded-full px-4 py-1
                ">
                  Saiba mais →
                </span>
              </div>
            </Link>
          </div>
        ))}

        {/* Indicadores */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`
                rounded-full transition-all duration-300
                ${index === bannerAtual
                  ? 'bg-white w-6 h-2'
                  : 'bg-white/40 w-2 h-2 hover:bg-white/60'
                }
              `}
            />
          ))}
        </div>
      </div>
    </div>
  );

  // ==========================================
  // SECTION 1.8 - VÍDEO DE LANÇAMENTO
  // ==========================================
  const renderVideo = () => (
    <>
      <div className="mb-8">
        <button
          onClick={() => setShowVideo(true)}
          className="
            w-full
            bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900
            rounded-3xl p-6
            shadow-[0_8px_30px_rgba(0,0,0,0.15)]
            group
            hover:from-gray-800 hover:via-gray-700 hover:to-gray-800
            hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)]
            transition-all duration-300
            relative overflow-hidden
          "
        >
          <div className="
            absolute inset-0
            bg-gradient-to-r from-transparent via-white/5 to-transparent
            -translate-x-full group-hover:translate-x-full
            transition-transform duration-1000
          " />

          <div className="flex items-center justify-center gap-4 relative">
            <div className="
              w-16 h-16 rounded-2xl
              bg-white/10 backdrop-blur-md
              border border-white/15
              flex items-center justify-center
              group-hover:scale-110
              group-hover:bg-white/20
              transition-all duration-300
            ">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
            <div className="text-left">
              <p className="text-white font-bold text-lg">{titulos.video}</p>
              <p className="text-gray-400 text-sm">{titulos.videoDesc}</p>
            </div>
            <div className="
              hidden sm:block ml-auto
              text-xs text-gray-500
              bg-white/5 border border-white/10
              rounded-full px-3 py-1.5
            ">
              ▶ 2:30 min
            </div>
          </div>
        </button>
      </div>

      {/* Modal Vídeo */}
      {showVideo && (
        <div className="
          fixed inset-0 z-50
          bg-black/80 backdrop-blur-xl
          flex items-center justify-center p-4
        ">
          <div className="relative max-w-3xl w-full animate-fadeIn">
            <button
              onClick={() => setShowVideo(false)}
              className="
                absolute -top-12 right-0
                text-white/60 hover:text-white
                transition-colors
              "
            >
              <X className="w-6 h-6" />
            </button>
            <div className="
              bg-black rounded-2xl overflow-hidden
              aspect-video
              shadow-[0_24px_64px_rgba(0,0,0,0.5)]
              border border-white/10
            ">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Vídeo Valente Conecta"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // ==========================================
  // SECTION 1.9 - PLANOS (8 cards)
  // ==========================================
  const renderPlanos = () => {
    const iconPlanosMap: Record<string, any> = { Users, Store, Crown, Shield };

    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="
            w-8 h-8 rounded-xl
            bg-gradient-to-br from-amber-500 to-yellow-600
            flex items-center justify-center
            shadow-lg shadow-amber-500/25
          ">
            <Crown className="w-4 h-4 text-white" />
          </div>
          <h2 className="font-extrabold text-lg text-gray-800">{titulos.planos}</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {planos.map((plano) => {
            const Icon = iconPlanosMap[plano.icon] || Crown;
            return (
              <div
                key={plano.id}
                className="
                  group
                  bg-white
                  rounded-2xl p-4
                  border border-gray-100
                  shadow-[0_4px_16px_rgba(0,0,0,0.04)]
                  hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]
                  hover:border-gray-200
                  hover:-translate-y-1
                  transition-all duration-300
                "
              >
                <div className={`
                  ${plano.cor}
                  w-10 h-10 rounded-xl
                  flex items-center justify-center
                  mb-3
                  shadow-md
                  group-hover:scale-110
                  transition-transform duration-200
                `}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-sm">{plano.nome}</h3>
                <p className="text-xl font-extrabold text-gray-900 mt-1">
                  {plano.preco === 0 ? 'Grátis' : `R$ ${plano.preco.toFixed(2)}`}
                  {plano.preco > 0 && (
                    <span className="text-xs font-normal text-gray-400">/mês</span>
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-1">{plano.descricao}</p>

                <ul className="mt-3 space-y-1.5">
                  {plano.features.map((feature, idx) => (
                    <li key={idx} className="text-[11px] text-gray-500 flex items-center gap-1.5">
                      <ChevronRight className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className="
                  mt-4 w-full
                  bg-gradient-to-r from-blue-600 to-indigo-600
                  text-white py-2 rounded-xl
                  text-xs font-bold tracking-wide
                  hover:from-blue-700 hover:to-indigo-700
                  hover:shadow-lg hover:shadow-blue-600/25
                  active:scale-[0.97]
                  transition-all duration-200
                ">
                  Assinar
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ==========================================
  // SECTION 1.10 - ESTATÍSTICAS
  // ==========================================
  const renderEstatisticas = () => (
    <div className="
      relative overflow-hidden
      bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700
      rounded-3xl p-6 text-white
      shadow-[0_12px_40px_rgba(37,99,235,0.25)]
      mb-8
    ">
      {/* Efeito de grade */}
      <div className="
        absolute inset-0
        bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')]
        opacity-50
      " />

      <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {estatisticas.map((stat, index) => (
          <div key={index} className="
            group
            p-3 rounded-2xl
            hover:bg-white/5
            transition-colors duration-200
          ">
            <div className="
              text-3xl font-extrabold drop-shadow-md
              group-hover:scale-110
              transition-transform duration-200
            ">
              {stat.valor}
            </div>
            <div className="text-sm text-blue-100/80 font-medium mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ==========================================
  // SECTION 1.11 - BOTÃO ADMIN (flutuante)
  // ==========================================
  const renderBotaoAdmin = () => {
    if (!isAdmin) return null;
    return (
      <Link
        href="/admin"
        className="
          fixed bottom-7 right-7 z-50
          w-14 h-14 rounded-2xl
          bg-gradient-to-br from-gray-800 via-gray-900 to-black
          shadow-[0_8px_32px_rgba(0,0,0,0.3)]
          border border-gray-700/50
          flex items-center justify-center
          hover:scale-110 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]
          active:scale-90
          transition-all duration-300
          group
        "
      >
        <Shield className="
          w-6 h-6 text-blue-400
          group-hover:text-blue-300
          transition-colors
        " />
        {/* Tooltip */}
        <span className="
          absolute -top-10 right-0
          bg-gray-900 text-white text-[10px]
          px-2 py-1 rounded-lg
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          whitespace-nowrap
        ">
          Painel Admin
        </span>
      </Link>
    );
  };

  // ==========================================
  // RENDER PRINCIPAL
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header (1.1) */}
      {renderHeader()}

      {/* Geolocalização Mobile (1.2) */}
      {renderGeolocalizacaoMobile()}

      {/* Busca com Voz (1.3) */}
      {renderBusca()}

      <main className="container mx-auto px-4 py-5">
        {/* Card Ofertas (1.4) */}
        {renderCardOfertas()}

        {/* Card Indique Rotativo 10s (1.5) */}
        {renderCardIndique()}

        {/* Categorias - 5 blocos × 6 cards (1.6) */}
        {renderCategorias()}

        {/* Carrossel Banners (1.7) */}
        {renderCarrosselBanners()}

        {/* Vídeo (1.8) */}
        {renderVideo()}

        {/* Planos - 8 cards (1.9) */}
        {renderPlanos()}

        {/* Estatísticas (1.10) */}
        {renderEstatisticas()}
      </main>

      {/* Botão Admin flutuante (1.11) */}
      {renderBotaoAdmin()}

      {/* Indicador Dev (mantido) */}
      {CURRENT_ENV === "development" && (
        <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none">
          <div className="
            bg-gray-900/80 backdrop-blur-md
            border border-green-500/30
            text-xs text-green-400 font-mono
            px-3 py-1.5 rounded-full shadow-lg
          ">
            🚩 Visual Redesign
          </div>
        </div>
      )}
    </div>
  );
}
