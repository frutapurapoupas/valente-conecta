// app/page.tsx
// 🎨 UI PURA - Home (APENAS RENDERIZAÇÃO)

"use client";

export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import { useHome } from "@/hooks/home/useHome";
import SolicitacaoModal from "@/app/components/SolicitacaoModal";
import BuscaInteligente from "@/components/BuscaInteligente";

function HomePageContent() {
  const {
    user,
    searchTerm,
    setSearchTerm,
    activeSection,
    saldoUsuario,
    carregandoSaldo,
    notificacoesAdmin,
    isMounted,
    homeRef,
    lancamentoRef,
    categorias1Ref,
    categorias2Ref,
    categorias3Ref,
    categorias4Ref,
    gridItens,
    categoriasBloco1,
    categoriasBloco2,
    categoriasBloco3,
    categoriasBloco4,
    modalSolicitacao,
    abrirSolicitacao,
    fecharSolicitacao,
    handleSearch,
    handleVoiceSearch,
    handleBuscaFallback,
    scrollToSection,
    showQR,
    verExtrato,
    router,
  } = useHome();

  if (!isMounted) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div ref={homeRef} className="min-h-screen">
        <div className="bg-gradient-to-r from-green-400 to-green-700 px-5 pt-8 pb-5 rounded-b-3xl">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-white text-lg font-bold">App Valente Conecta</h1>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm font-medium">Olá, {user?.nome || user?.name || "Visitante"}</span>
              <button onClick={() => router.push("/profile")} className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center hover:bg-white/40 transition">
                <i className="fas fa-user text-white text-sm"></i>
              </button>
            </div>
          </div>
          
          <BuscaInteligente 
            onSearch={handleSearch}
            onVoiceSearch={handleVoiceSearch}
            onFallback={handleBuscaFallback}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          <div className="bg-white/20 rounded-2xl p-3">
            <p className="text-white/80 text-xs">Saldo disponível</p>
            <div className="flex items-center justify-between">
              <p className="text-white text-xl font-bold mt-0.5">
                {carregandoSaldo ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  `${saldoUsuario.toFixed(2)} MC`
                )}
              </p>
              <button 
                onClick={verExtrato}
                className="text-white/70 text-xs hover:text-white transition flex items-center gap-1"
              >
                <i className="fas fa-wallet text-white/70 text-xs"></i> Ver extrato
              </button>
            </div>
            <p className="text-white/50 text-[10px] mt-0.5">Moeda Conecta (MC)</p>
            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => {}} 
                className="flex-1 bg-white text-green-600 py-1 rounded-xl font-semibold text-xs hover:bg-gray-100 transition flex items-center justify-center gap-1"
              >
                <i className="fas fa-arrow-down"></i>
                Receber
              </button>
              <button 
                onClick={() => {}} 
                className="flex-1 bg-white/30 text-white py-1 rounded-xl font-semibold text-xs hover:bg-white/40 transition flex items-center justify-center gap-1"
              >
                <i className="fas fa-arrow-up"></i>
                Pagar
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-around px-5 py-4 gap-3">
          {gridItens.map((item, idx) => (
            <button 
              key={idx} 
              onClick={() => router.push(item.href)} 
              className="flex-1 rounded-xl py-3 flex flex-col items-center gap-1 transition-transform hover:scale-105 shadow-lg" 
              style={{ backgroundColor: item.cor }}
            >
              <span className="text-2xl">{item.icone}</span>
              <span className="text-white font-bold text-xs">{item.titulo}</span>
            </button>
          ))}
        </div>

        {/* CARD INDIQUE E GANHE */}
        <div className="px-5 mb-6">
          <div onClick={showQR} className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl p-4 flex items-center justify-between cursor-pointer shadow-lg hover:shadow-xl transition transform hover:scale-[1.02]">
            <div>
              <p className="text-black font-bold text-lg">🎁 INDIQUE E GANHE</p>
              <p className="text-black/70 text-sm">Compartilhe o app e ganhe bônus por indicação!</p>
            </div>
            <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl" style={{
              background: "radial-gradient(circle at 35% 35%, #c49a1a, #8b6914)",
              boxShadow: "0 6px 15px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 2px rgba(0,0,0,0.2)",
              border: "1px solid #e6b422"
            }}>
              <span className="text-xl font-bold text-white drop-shadow-md">MC</span>
            </div>
          </div>
        </div>

        {/* NOTAS DO ADMIN MASTER */}
        <div className="px-5 mb-6">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-xl border border-yellow-500/30 overflow-hidden">
            <div className="flex items-center gap-2 p-3 border-b border-gray-700 bg-gray-800">
              <i className="fas fa-shield-alt text-yellow-400"></i>
              <span className="text-white font-bold text-sm">👑 Admin Master</span>
              <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full">
                {notificacoesAdmin.length}
              </span>
            </div>
            <div className="p-3 space-y-2 max-h-[450px] min-h-[270px] overflow-auto">
              {notificacoesAdmin.length > 0 ? (
                notificacoesAdmin.map((notif) => (
                  <div key={notif.id} className="flex items-start gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition">
                    <div className={`mt-0.5 w-2 h-2 rounded-full ${
                      notif.importancia === "alta" ? "bg-red-500 animate-pulse" : 
                      notif.importancia === "media" ? "bg-yellow-500" : "bg-blue-500"
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-gray-300 text-sm">{notif.mensagem}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-gray-500 text-[10px]">{notif.data}</p>
                        {notif.status === "pendente" && (
                          <span className="text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">Pendente</span>
                        )}
                        {notif.status === "em_andamento" && (
                          <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full">Em andamento</span>
                        )}
                      </div>
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-[8px] font-medium ${
                      notif.importancia === "alta" ? "bg-red-500/20 text-red-400" : 
                      notif.importancia === "media" ? "bg-yellow-500/20 text-yellow-400" : "bg-blue-500/20 text-blue-400"
                    }`}>
                      {notif.importancia === "alta" ? "🔴 Urgente" : notif.importancia === "media" ? "⚠️ Importante" : "ℹ️ Info"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-[220px]">
                  <div className="text-center text-gray-500">
                    <i className="fas fa-bell text-4xl mb-3 opacity-50"></i>
                    <p className="text-sm">Nenhuma notificação ativa</p>
                    <p className="text-xs opacity-70 mt-1">As notificações do Admin aparecerão aqui</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* VÍDEO DE LANÇAMENTO */}
      <div ref={lancamentoRef} className="bg-gray-900 min-h-screen">
        <div className="p-6 pt-8">
          <div className="bg-white/10 rounded-3xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">📹 Vídeo de Apresentação</h2>
            <div className="bg-gray-800 h-72 rounded-2xl flex items-center justify-center cursor-pointer hover:scale-105 transition">
              <i className="fas fa-play-circle text-7xl text-blue-400"></i>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500 rounded-3xl p-8 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-3xl font-bold text-white mb-4">LANÇAMENTO</h2>
            <p className="text-green-300 text-lg font-semibold mb-3">Começa agora em Valente a revolução no comércio digital!</p>
            <p className="text-gray-300 text-md mb-2">A experiência que você esperava agora é real e já começou.</p>
            <p className="text-gray-300 text-md mb-4">A Valente Conecta uniu inovação e praticidade para conectar você ao melhor da cidade.</p>
            <p className="text-yellow-400 font-bold text-lg mb-6">Participe agora, dê o play e faça parte desta nova história!</p>
            <button onClick={() => router.push("/qr-code")} className="mt-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg px-8 py-4 rounded-2xl w-full hover:scale-105 transition shadow-lg">💰 INDICAR AGORA E GANHAR</button>
          </div>
        </div>
      </div>

      {/* CATEGORIAS - BLOCO 1 */}
      <div ref={categorias1Ref} className="bg-gray-900 py-6">
        <div className="px-4 space-y-3">
          {categoriasBloco1.map((cat, idx) => (
            <div 
              key={`b1-${idx}`} 
              onClick={() => cat.href ? router.push(cat.href) : abrirSolicitacao(cat.nome, cat.nome)} 
              className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-300 border border-gray-700"
            >
              <div className="text-5xl">{cat.icone}</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-white">{cat.nome}</h3>
              </div>
              <i className="fas fa-chevron-right text-gray-500 text-xl"></i>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIAS - BLOCO 2 */}
      <div ref={categorias2Ref} className="bg-gray-900 py-6">
        <div className="px-4 space-y-3">
          {categoriasBloco2.map((cat, idx) => (
            <div 
              key={`b2-${idx}`} 
              onClick={() => abrirSolicitacao(cat.nome, cat.nome)} 
              className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-300 border border-gray-700"
            >
              <div className="text-5xl">{cat.icone}</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-white">{cat.nome}</h3>
              </div>
              <i className="fas fa-chevron-right text-gray-500 text-xl"></i>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIAS - BLOCO 3 */}
      <div ref={categorias3Ref} className="bg-gray-900 py-6">
        <div className="px-4 space-y-3">
          {categoriasBloco3.map((cat, idx) => (
            <div 
              key={`b3-${idx}`} 
              onClick={() => abrirSolicitacao(cat.nome, cat.nome)} 
              className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-300 border border-gray-700"
            >
              <div className="text-5xl">{cat.icone}</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-white">{cat.nome}</h3>
              </div>
              <i className="fas fa-chevron-right text-gray-500 text-xl"></i>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIAS - BLOCO 4 */}
      <div ref={categorias4Ref} className="bg-gray-900 py-6 pb-28">
        <div className="px-4 space-y-3">
          {categoriasBloco4.map((cat, idx) => (
            <div 
              key={`b4-${idx}`} 
              onClick={() => abrirSolicitacao(cat.nome, cat.nome)} 
              className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-300 border border-gray-700"
            >
              <div className="text-5xl">{cat.icone}</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-white">{cat.nome}</h3>
              </div>
              <i className="fas fa-chevron-right text-gray-500 text-xl"></i>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL SOLICITAÇÃO */}
      <SolicitacaoModal 
        isOpen={modalSolicitacao.open} 
        onClose={fecharSolicitacao} 
        servico={modalSolicitacao.servico} 
        categoria={modalSolicitacao.categoria} 
        userNome={user?.nome || user?.name} 
        userEmail={user?.email} 
        userTelefone={user?.telefone} 
      />

      {/* BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0a1428] border-t border-white/10 py-2 z-50 overflow-x-auto">
        <div className="flex justify-around items-center text-xs min-w-[500px] px-2">
          <button onClick={() => window.location.href = "/"} className="flex flex-col items-center transition">
            <i className={`fas fa-home text-xl ${activeSection === 1 ? "text-green-400" : "text-gray-500"}`}></i>
            <span className="text-[9px] text-gray-500">Home</span>
          </button>
          <button onClick={() => scrollToSection(lancamentoRef)} className="flex flex-col items-center transition">
            <i className={`fas fa-play-circle text-xl ${activeSection === 2 ? "text-orange-400" : "text-gray-500"}`}></i>
            <span className="text-[9px] text-gray-500">Lançamento</span>
          </button>
          <button onClick={() => router.push("/ajuda")} className="flex flex-col items-center transition">
            <i className="fas fa-question-circle text-xl text-gray-500"></i>
            <span className="text-[9px] text-gray-500">Ajuda</span>
          </button>
          <button onClick={() => scrollToSection(categorias1Ref)} className="flex flex-col items-center transition">
            <i className={`fas fa-th-large text-xl ${activeSection === 3 ? "text-purple-400" : "text-gray-500"}`}></i>
            <span className="text-[9px] text-gray-500">Serviços 1</span>
          </button>
          <button onClick={() => scrollToSection(categorias2Ref)} className="flex flex-col items-center transition">
            <i className={`fas fa-th-large text-xl ${activeSection === 4 ? "text-blue-400" : "text-gray-500"}`}></i>
            <span className="text-[9px] text-gray-500">Serviços 2</span>
          </button>
          <button onClick={() => scrollToSection(categorias3Ref)} className="flex flex-col items-center transition">
            <i className={`fas fa-th-large text-xl ${activeSection === 5 ? "text-yellow-400" : "text-gray-500"}`}></i>
            <span className="text-[9px] text-gray-500">Serviços 3</span>
          </button>
          <button onClick={() => scrollToSection(categorias4Ref)} className="flex flex-col items-center transition">
            <i className={`fas fa-plus-circle text-xl ${activeSection === 6 ? "text-pink-400" : "text-gray-500"}`}></i>
            <span className="text-[9px] text-gray-500">Serviços 4</span>
          </button>
        </div>
      </nav>

      <style jsx>{`
        .pulse { animation: pulse-coin 1.5s ease-in-out infinite; }
        @keyframes pulse-coin { 0% { transform: scale(1); } 50% { transform: scale(1.08); } 100% { transform: scale(1); } }
        @keyframes slide-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        .slide-down { animation: slide-down 0.5s ease-out; }
      `}</style>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div></div>}>
      <HomePageContent />
    </Suspense>
  );
}