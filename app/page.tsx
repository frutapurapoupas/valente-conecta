"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import toast from "react-hot-toast";

export default function HomePage() {
  const router = useRouter();
  const { user, isAdmin } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState(1);
  const [showAdminNotifications, setShowAdminNotifications] = useState(true);
  
  // Notificações do Admin Master
  const [notificacoesAdmin, setNotificacoesAdmin] = useState([
    { id: 1, mensagem: "📢 Novas funcionalidades disponíveis! Confira o cardápio da Cozinha.", importancia: "alta", data: "Hoje" },
    { id: 2, mensagem: "🎁 Campanha de indicação: Ganhe R$5 por amigo indicado!", importancia: "media", data: "Hoje" },
    { id: 3, mensagem: "💪 Academia agora com geolocalização para registrar treinos!", importancia: "alta", data: "Ontem" },
    { id: 4, mensagem: "🏍️ Moto Táxi com novos motoristas cadastrados!", importancia: "baixa", data: "Ontem" }
  ]);
  
  // Referências para scroll
  const homeRef = useRef<HTMLDivElement>(null);
  const lancamentoRef = useRef<HTMLDivElement>(null);
  const categorias1Ref = useRef<HTMLDivElement>(null);
  const categorias2Ref = useRef<HTMLDivElement>(null);
  const categorias3Ref = useRef<HTMLDivElement>(null);
  const categorias4Ref = useRef<HTMLDivElement>(null);

  // Cards principais
  const gridItens = [
    { titulo: "MOTO TÁXI", cor: "#007bff", icone: "🏍️", href: "/mototaxi" },
    { titulo: "MARMITA", cor: "#ff9800", icone: "🍱", href: "/cozinha" },
    { titulo: "ÁGUA & GÁS", cor: "#e64a19", icone: "💧", href: "/comercio" },
  ];

  // Blocos de categorias
  const categoriasBloco1 = [
    { nome: "ACADEMIAS & ESPORTES", icone: "💪", href: "/academia" },
    { nome: "MARMITA & BOLOS", icone: "🍱", href: "/cozinha" },
    { nome: "ALIMENTAÇÃO", icone: "🍔", href: "/comercio" },
    { nome: "TRANSPORTE & DELIVERY", icone: "🏍️", href: "/mototaxi" },
    { nome: "UTILIDADES", icone: "💡", href: "/servicos" },
    { nome: "SERVIÇOS", icone: "🔧", href: "/servicos" },
  ];

  const categoriasBloco2 = [
    { nome: "MERCADOS", icone: "🏪", href: "/comercio" },
    { nome: "IMÓVEL", icone: "🏠", href: "/servicos" },
    { nome: "AGRO E CAMPO", icone: "🌾", href: "/servicos" },
    { nome: "CONSTRUÇÃO", icone: "🏗️", href: "/servicos" },
    { nome: "ALUGUEL MÁQUINAS", icone: "🔨", href: "/servicos" },
    { nome: "TECNOLOGIA", icone: "💻", href: "/servicos" },
  ];

  const categoriasBloco3 = [
    { nome: "AUTOMOTIVO", icone: "🚗", href: "/servicos" },
    { nome: "EDUCAÇÃO", icone: "📚", href: "/servicos" },
    { nome: "SAÚDE", icone: "🏥", href: "/servicos" },
    { nome: "MODA MASCULINA", icone: "👔", href: "/servicos" },
    { nome: "MODA FEMININA", icone: "👗", href: "/servicos" },
    { nome: "BELEZA & ESTÉTICA", icone: "💇", href: "/servicos" },
  ];

  const categoriasBloco4 = [
    { nome: "BELEZA & ESTÉTICA", icone: "💅", href: "/servicos" },
    { nome: "EVENTOS & ENTRETENIMENTO", icone: "🎉", href: "/servicos" },
    { nome: "PET SHOP & ANIMAIS", icone: "🐕", href: "/servicos" },
    { nome: "FINANCEIRO", icone: "💰", href: "/servicos" },
  ];

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = [homeRef, lancamentoRef, categorias1Ref, categorias2Ref, categorias3Ref, categorias4Ref];
      const scrollPosition = window.scrollY + 100;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i].current;
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(i + 1);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showQR = () => {
    router.push("/qr-code");
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/busca?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleVoiceSearch = () => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = "pt-BR";
      recognition.onresult = (event: any) => {
        setSearchTerm(event.results[0][0].transcript);
        setTimeout(handleSearch, 500);
      };
      recognition.start();
    } else {
      toast.error("Busca por voz não suportada");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      
      {/* ==================== PÁGINA 1 - HOME ==================== */}
      <div ref={homeRef} className="min-h-screen">
        {/* Header reduzido */}
        <div className="bg-gradient-to-r from-green-400 to-green-700 px-5 pt-8 pb-5 rounded-b-3xl">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-white text-lg font-bold">App Valente Conecta</h1>
            <button onClick={() => router.push("/profile")} className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
              <i className="fas fa-user text-white text-sm"></i>
            </button>
          </div>

          {/* Barra de Busca */}
          <div className="mb-3">
            <div className="flex items-center bg-white rounded-2xl px-3 py-2 shadow-lg">
              <i className="fas fa-search text-gray-400 mr-2 text-sm"></i>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Buscar produtos ou serviços..." 
                className="flex-1 outline-none text-gray-700 bg-transparent text-sm"
              />
              <button onClick={handleVoiceSearch} className="text-gray-400 mr-2">
                <i className="fas fa-microphone text-sm"></i>
              </button>
              <button onClick={handleSearch} className="bg-green-500 text-white px-3 py-1 rounded-xl text-xs font-medium">
                Buscar
              </button>
            </div>
          </div>

          {/* Card de Saldo reduzido */}
          <div className="bg-white/20 rounded-2xl p-3">
            <p className="text-white/80 text-xs">Saldo disponível</p>
            <p className="text-white text-xl font-bold mt-0.5">
              R$ {user?.wallet?.toFixed(2) || "150,00"}
            </p>
            <div className="flex gap-2 mt-2">
              <button className="flex-1 bg-white text-green-600 py-1 rounded-xl font-semibold text-xs">Receber</button>
              <button className="flex-1 bg-white/30 text-white py-1 rounded-xl font-semibold text-xs">Pagar</button>
            </div>
          </div>
        </div>

        {/* Grid de Ícones */}
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

        {/* Card Indique e Ganhe - MOEDA REALISTA COM PULSO */}
        <div className="px-5 mb-4">
          <div onClick={showQR} className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl p-4 flex items-center justify-between cursor-pointer shadow-lg hover:shadow-xl transition">
            <div>
              <p className="text-black font-bold text-lg">🎁 INDIQUE E GANHE</p>
              <p className="text-black/70 text-sm">Ganhe R$5 por amigo + QR Code exclusivo</p>
            </div>
            <div className="moeda-realista w-16 h-16 rounded-full flex items-center justify-center shadow-xl pulse">
              <span className="text-xl font-bold text-yellow-800">R$</span>
            </div>
          </div>
        </div>

        {/* ==================== CARD DE NOTIFICAÇÕES ADMIN (NA PÁGINA 1, ABAIXO DO CARD INDIQUE) ==================== */}
        {showAdminNotifications && (
          <div className="px-5 mb-6">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="flex justify-between items-center p-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-bullhorn text-blue-600 text-xs"></i>
                  </div>
                  <div>
                    <span className="text-gray-800 font-bold text-sm">Comunicado Oficial</span>
                    <p className="text-gray-400 text-[9px]">Admin Master</p>
                  </div>
                </div>
                <button onClick={() => setShowAdminNotifications(false)} className="text-gray-300 hover:text-gray-500">
                  <i className="fas fa-times text-xs"></i>
                </button>
              </div>
              <div className="p-3 space-y-2 max-h-48 overflow-auto">
                {notificacoesAdmin.map((notif) => (
                  <div key={notif.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 transition">
                    <div className={`mt-0.5 w-2 h-2 rounded-full ${
                      notif.importancia === "alta" ? "bg-red-500" : 
                      notif.importancia === "media" ? "bg-yellow-500" : "bg-blue-500"
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-gray-700 text-sm">{notif.mensagem}</p>
                      <p className="text-gray-400 text-[9px] mt-0.5">{notif.data}</p>
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-[8px] font-medium ${
                      notif.importancia === "alta" ? "bg-red-100 text-red-600" : 
                      notif.importancia === "media" ? "bg-yellow-100 text-yellow-600" : "bg-blue-100 text-blue-600"
                    }`}>
                      {notif.importancia === "alta" ? "Urgente" : notif.importancia === "media" ? "Importante" : "Info"}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-gray-100 text-center bg-gray-50">
                <button className="text-blue-600 text-[10px] font-medium hover:text-blue-700 transition">
                  Ver todas as notificações →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================== PÁGINA 2 - LANÇAMENTO ==================== */}
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
            <p className="text-green-300 text-lg font-semibold mb-3">
              Começa agora em Valente a revolução no comércio digital!
            </p>
            <p className="text-gray-300 text-md mb-2">
              A experiência que você esperava agora é real e já começou.
            </p>
            <p className="text-gray-300 text-md mb-4">
              A Valente Conecta uniu inovação e praticidade para conectar você ao melhor da cidade.
            </p>
            <p className="text-yellow-400 font-bold text-lg mb-6">
              Participe agora, dê o play e faça parte desta nova história!
            </p>
            <button 
              onClick={() => scrollToSection(homeRef)}
              className="mt-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg px-8 py-4 rounded-2xl w-full hover:scale-105 transition shadow-lg"
            >
              💰 INDICAR AGORA E GANHAR
            </button>
          </div>
        </div>
      </div>

      {/* ==================== BLOCO 1 ==================== */}
      <div ref={categorias1Ref} className="bg-gray-900 py-6">
        <div className="px-4 space-y-3">
          {categoriasBloco1.map((cat, idx) => (
            <div key={idx} onClick={() => router.push(cat.href)} className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-300 border border-gray-700">
              <div className="text-5xl">{cat.icone}</div>
              <div className="flex-1"><h3 className="font-bold text-lg text-white">{cat.nome}</h3></div>
              <i className="fas fa-chevron-right text-gray-500 text-xl"></i>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== BLOCO 2 ==================== */}
      <div ref={categorias2Ref} className="bg-gray-900 py-6">
        <div className="px-4 space-y-3">
          {categoriasBloco2.map((cat, idx) => (
            <div key={idx} onClick={() => router.push(cat.href)} className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-300 border border-gray-700">
              <div className="text-5xl">{cat.icone}</div>
              <div className="flex-1"><h3 className="font-bold text-lg text-white">{cat.nome}</h3></div>
              <i className="fas fa-chevron-right text-gray-500 text-xl"></i>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== BLOCO 3 ==================== */}
      <div ref={categorias3Ref} className="bg-gray-900 py-6">
        <div className="px-4 space-y-3">
          {categoriasBloco3.map((cat, idx) => (
            <div key={idx} onClick={() => router.push(cat.href)} className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-300 border border-gray-700">
              <div className="text-5xl">{cat.icone}</div>
              <div className="flex-1"><h3 className="font-bold text-lg text-white">{cat.nome}</h3></div>
              <i className="fas fa-chevron-right text-gray-500 text-xl"></i>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== BLOCO 4 ==================== */}
      <div ref={categorias4Ref} className="bg-gray-900 py-6 pb-28">
        <div className="px-4 space-y-3">
          {categoriasBloco4.map((cat, idx) => (
            <div key={idx} onClick={() => router.push(cat.href)} className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-300 border border-gray-700">
              <div className="text-5xl">{cat.icone}</div>
              <div className="flex-1"><h3 className="font-bold text-lg text-white">{cat.nome}</h3></div>
              <i className="fas fa-chevron-right text-gray-500 text-xl"></i>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== BOTTOM NAVIGATION ==================== */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0a1428] border-t border-white/10 py-3 z-50">
        <div className="flex justify-around items-center text-xs">
          <button onClick={() => scrollToSection(homeRef)} className="flex flex-col items-center transition">
            <i className={`fas fa-home text-2xl ${activeSection === 1 ? "text-green-400" : "text-gray-500"}`}></i>
            <span className="text-[10px] text-gray-500">Home</span>
          </button>
          <button onClick={() => scrollToSection(lancamentoRef)} className="flex flex-col items-center transition">
            <i className={`fas fa-play-circle text-2xl ${activeSection === 2 ? "text-orange-400" : "text-gray-500"}`}></i>
            <span className="text-[10px] text-gray-500">Lançamento</span>
          </button>
          <button onClick={() => scrollToSection(categorias1Ref)} className="flex flex-col items-center transition">
            <i className={`fas fa-th-large text-2xl ${activeSection === 3 ? "text-purple-400" : "text-gray-500"}`}></i>
            <span className="text-[10px] text-gray-500">Categ 1</span>
          </button>
          <button onClick={() => scrollToSection(categorias2Ref)} className="flex flex-col items-center transition">
            <i className={`fas fa-th-large text-2xl ${activeSection === 4 ? "text-blue-400" : "text-gray-500"}`}></i>
            <span className="text-[10px] text-gray-500">Categ 2</span>
          </button>
          <button onClick={() => scrollToSection(categorias3Ref)} className="flex flex-col items-center transition">
            <i className={`fas fa-th-large text-2xl ${activeSection === 5 ? "text-yellow-400" : "text-gray-500"}`}></i>
            <span className="text-[10px] text-gray-500">Categ 3</span>
          </button>
          <button onClick={() => scrollToSection(categorias4Ref)} className="flex flex-col items-center transition">
            <i className={`fas fa-plus-circle text-2xl ${activeSection === 6 ? "text-pink-400" : "text-gray-500"}`}></i>
            <span className="text-[10px] text-gray-500">Mais</span>
          </button>
        </div>
      </nav>

      <style jsx>{`
        .moeda-realista {
          background: radial-gradient(circle at 30% 30%, #f5e050, #d4a017);
          box-shadow: 0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5);
          border: 1px solid #ffd700;
        }
        .pulse {
          animation: pulse-coin 1.5s ease-in-out infinite;
        }
        @keyframes pulse-coin {
          0% { transform: scale(1); box-shadow: 0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5); }
          50% { transform: scale(1.08); box-shadow: 0 8px 25px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.6); }
          100% { transform: scale(1); box-shadow: 0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.5); }
        }
      `}</style>
    </div>
  );
}
