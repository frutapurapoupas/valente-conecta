// components/cozinha/SelecaoPerfilUI.tsx
// 🎨 DESIGN - Seleção de Perfil com Efeito Vidro

"use client";

interface Perfil {
  id: string;
  nome: string;
  icone: string;
  descricao: string;
  desconto: number;
  badge: string;
  cor: string;
  corDestaque: string;
}

interface SelecaoPerfilUIProps {
  perfis: Perfil[];
  onSelecionar: (id: string) => void;
  loading: boolean;
}

// ============================================================
// DESIGN - Estilo Vidro (Glassmorphism)
// ============================================================
const design = {
  container: "min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900 text-white pb-20",
  header: "sticky top-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10 px-4 py-4",
  title: "text-2xl md:text-3xl font-extrabold text-center bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent tracking-wide",
  subtitle: "text-center text-sm text-gray-300 mt-1",
  cardContainer: "px-3 py-4 grid grid-cols-1 md:grid-cols-3 gap-3 max-w-6xl mx-auto",
  card: "relative overflow-hidden rounded-2xl p-4 md:p-5 cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl backdrop-blur-xl border border-white/20",
  cardGlow: "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
  cardIcon: "text-5xl md:text-6xl text-center mb-2",
  cardTitle: "text-lg md:text-xl font-extrabold text-center leading-tight",
  cardDesc: "text-center mt-1 text-sm text-white/80 min-h-[36px]",
  cardBadge: "inline-block mt-2 px-3 py-1 rounded-full text-[11px] font-bold backdrop-blur-sm",
  btnPrimary: "mt-3 w-full font-bold rounded-xl py-2.5 text-sm transition-all duration-300 backdrop-blur-sm border border-white/20 hover:scale-[1.01]"
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function SelecaoPerfilUI({ perfis, onSelecionar, loading }: SelecaoPerfilUIProps) {
  return (
    <div className={design.container}>
      {/* CABEÇALHO */}
      <div className={design.header}>
        <h1 className={design.title}>🍳 COZINHA CHEF NEIDE</h1>
        <p className={design.subtitle}>Selecione seu perfil para continuar</p>
      </div>

      {/* CARDS DE PERFIL */}
      <div className={design.cardContainer}>
        {perfis.map((perfil) => (
          <div
            key={perfil.id}
            onClick={() => onSelecionar(perfil.id)}
            className={`${design.card} group`}
            style={{
              background: `linear-gradient(135deg, ${perfil.cor}15, ${perfil.cor}05)`,
              borderColor: `${perfil.cor}40`,
              boxShadow: `0 8px 32px ${perfil.cor}20`
            }}
          >
            {/* Efeito de brilho ao passar o mouse */}
            <div 
              className={design.cardGlow}
              style={{
                background: `radial-gradient(circle at 50% 0%, ${perfil.cor}30, transparent 70%)`
              }}
            />

            <div className="relative z-10">
              <div className={design.cardIcon}>{perfil.icone}</div>
              <h2 
                className={design.cardTitle}
                style={{ color: perfil.cor }}
              >
                {perfil.nome}
              </h2>
              <p className={design.cardDesc}>{perfil.descricao}</p>
              
              <div className="text-center">
                <span 
                  className={design.cardBadge}
                  style={{
                    background: `${perfil.cor}25`,
                    color: perfil.cor,
                    border: `1px solid ${perfil.cor}30`
                  }}
                >
                  {perfil.badge}
                </span>
              </div>

              <button 
                className={design.btnPrimary}
                style={{
                  background: `linear-gradient(135deg, ${perfil.cor}40, ${perfil.cor}20)`,
                  color: perfil.cor,
                  borderColor: `${perfil.cor}30`
                }}
              >
                {loading ? 'Carregando...' : 'Selecionar →'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-gray-500 text-sm mt-4">
        💡 Os descontos e condições são configurados pelo Admin da Cozinha
      </p>
    </div>
  );
}