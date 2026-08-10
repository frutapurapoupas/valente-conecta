"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Search, Mic, X, MapPin, Loader2, Globe, 
  Bell, Clock, Package, Briefcase, Star, 
  TrendingUp, Navigation, AlertCircle, CheckCircle
} from "lucide-react";
import toast from "react-hot-toast";

interface BuscaInteligenteProps {
  onSearch: (termo: string) => void;
  onVoiceSearch: () => void;
  onFallback: (termo: string) => void;
  searchTerm: string;
  setSearchTerm: (termo: string) => void;
}

interface ResultadoBusca {
  id: string;
  nome: string;
  tipo: "produto" | "servico";
  preco?: number;
  distancia?: number;
  loja?: string;
  avaliacao?: number;
  imagem?: string;
}

export default function BuscaInteligente({
  onSearch,
  onVoiceSearch,
  onFallback,
  searchTerm,
  setSearchTerm
}: BuscaInteligenteProps) {
  const [resultados, setResultados] = useState<ResultadoBusca[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [usandoGeolocalizacao, setUsandoGeolocalizacao] = useState(false);
  const [localizacao, setLocalizacao] = useState<{ lat: number; lng: number; cidade: string } | null>(null);
  const [buscaPendente, setBuscaPendente] = useState<{ termo: string; notificado: boolean } | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Verificar se há busca pendente
  useEffect(() => {
    const pendente = localStorage.getItem("busca_pendente");
    if (pendente) {
      try {
        const data = JSON.parse(pendente);
        setBuscaPendente(data);
        if (!data.notificado) {
          toast((t) => (
            <div className="flex items-start gap-3 p-2">
              <Bell className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="font-bold text-sm">Produto não encontrado</p>
                <p className="text-xs text-gray-600">
                  "{data.termo}" - Vamos te avisar em até 24h quando encontrarmos
                </p>
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    marcarPendenteNotificado();
                  }}
                  className="mt-2 text-xs bg-yellow-500 text-white px-3 py-1 rounded-full"
                >
                  Entendi
                </button>
              </div>
            </div>
          ), { duration: 8000 });
        }
      } catch (e) {}
    }
  }, []);

  // Marcar pendente como notificado
  const marcarPendenteNotificado = () => {
    if (buscaPendente) {
      const novoPendente = { ...buscaPendente, notificado: true };
      setBuscaPendente(novoPendente);
      localStorage.setItem("busca_pendente", JSON.stringify(novoPendente));
    }
  };

  // Obter geolocalização do usuário
  const obterGeolocalizacao = () => {
    if (!navigator.geolocation) {
      toast.error("Seu navegador não suporta geolocalização");
      return;
    }

    setUsandoGeolocalizacao(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocalizacao({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          cidade: "Valente, BA"
        });
        toast.success(`📍 Localização ativada: ${localizacao?.cidade || "Valente, BA"}`);
        setUsandoGeolocalizacao(false);
        
        localStorage.setItem("user_location", JSON.stringify(localizacao));
      },
      (error) => {
        console.error("Erro ao obter localização:", error);
        toast.error("Não foi possível obter sua localização");
        setUsandoGeolocalizacao(false);
      }
    );
  };

  // Buscar por proximidade
  const buscarPorProximidade = async (termo: string) => {
    setBuscando(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const resultadosEncontrados = Math.random() > 0.5;
      
      if (!resultadosEncontrados && localizacao) {
        toast.loading("Buscando na internet...", { duration: 1000 });
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast((t) => (
          <div className="max-w-sm p-3">
            <p className="font-bold text-sm">🔍 Produto não encontrado localmente</p>
            <p className="text-xs text-gray-600 mt-1">
              Encontramos "{termo}" na internet. Deseja ver os resultados?
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  setResultados([
                    { id: "web1", nome: `${termo} - Mercado Livre`, tipo: "produto", preco: 49.90, loja: "Mercado Livre" },
                    { id: "web2", nome: `${termo} - Shopee`, tipo: "produto", preco: 39.90, loja: "Shopee" }
                  ]);
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs"
              >
                Ver resultados
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  registrarBuscaPendente(termo);
                }}
                className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-xs"
              >
                Quero na minha cidade
              </button>
            </div>
          </div>
        ), { duration: 10000 });
      } else if (resultadosEncontrados) {
        setResultados([
          { id: "1", nome: termo, tipo: "produto", preco: 29.90, loja: "Mercearia do João", distancia: 0.5, avaliacao: 4.5 },
          { id: "2", nome: termo, tipo: "servico", preco: 49.90, loja: "Serviços Valente", distancia: 1.2, avaliacao: 4.8 }
        ]);
        toast.success(`Encontramos ${resultados.length} resultados próximos a você!`);
      }
      
    } catch (error) {
      console.error("Erro na busca:", error);
      toast.error("Erro ao realizar busca");
    } finally {
      setBuscando(false);
    }
  };

  // Registrar busca pendente
  const registrarBuscaPendente = (termo: string) => {
    const buscaPendenteData = {
      termo,
      data: new Date().toISOString(),
      notificado: false,
      usuario: {
        nome: localStorage.getItem("user_name") || "Visitante",
        email: localStorage.getItem("user_email") || "anonimo@email.com"
      }
    };
    
    localStorage.setItem("busca_pendente", JSON.stringify(buscaPendenteData));
    
    const buscasPendentesAdmin = localStorage.getItem("buscas_pendentes");
    const lista = buscasPendentesAdmin ? JSON.parse(buscasPendentesAdmin) : [];
    lista.push({
      id: Date.now().toString(),
      termo,
      usuario_nome: localStorage.getItem("user_name") || "Visitante",
      usuario_email: localStorage.getItem("user_email") || "anonimo@email.com",
      tipo: termo.includes("serviço") ? "servico" : "produto",
      status: "pendente",
      data_busca: new Date().toISOString(),
      notificado_usuario: false
    });
    localStorage.setItem("buscas_pendentes", JSON.stringify(lista));
    
    setBuscaPendente({ termo, notificado: false });
    toast.success("📢 Anotamos sua busca! Vamos te avisar quando encontrarmos.");
  };

  // Executar busca principal
  const executarBusca = async () => {
    if (!searchTerm.trim()) return;
    
    setBuscando(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const encontrou = Math.random() > 0.3;
      
      if (!encontrou && !localizacao) {
        registrarBuscaPendente(searchTerm);
      }
      
      onSearch(searchTerm);
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="relative">
      {/* Barra de busca principal - APENAS O CAMPO, SEM AUTOCOMPLETAR */}
      <div className="w-full">
        <div className="flex items-center bg-white rounded-2xl px-3 py-2 shadow-lg">
          <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && executarBusca()}
            placeholder="Buscar produtos ou serviços perto de você..."
            className="flex-1 outline-none text-gray-700 bg-transparent text-sm min-w-0"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-gray-400 hover:text-gray-600 mr-1 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onVoiceSearch}
            className="text-gray-400 mr-1 hover:text-green-500 transition flex-shrink-0"
            title="Busca por voz"
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            onClick={obterGeolocalizacao}
            className={`text-gray-400 mr-1 transition flex-shrink-0 ${
              localizacao ? "text-green-500" : "hover:text-green-500"
            }`}
            title={localizacao ? `Local: ${localizacao.cidade}` : "Ativar localização"}
          >
            {usandoGeolocalizacao ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      
      {/* Indicador de localização ativa */}
      {localizacao && (
        <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
          <MapPin className="w-3 h-3" />
          <span>Buscando próximo a {localizacao.cidade}</span>
        </div>
      )}
      
      {/* Badge de busca pendente */}
      {buscaPendente && !buscaPendente.notificado && (
        <div className="mt-2 flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full inline-flex">
          <Bell className="w-3 h-3" />
          <span>Vamos te avisar quando "{buscaPendente.termo}" estiver disponível</span>
        </div>
      )}
      
      {/* Resultados da busca */}
      {resultados.length > 0 && (
        <div className="mt-4 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              Resultados encontrados na internet
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {resultados.map((resultado) => (
              <div key={resultado.id} className="p-3 hover:bg-gray-50 transition cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{resultado.nome}</p>
                    <p className="text-xs text-gray-500">{resultado.loja}</p>
                    {resultado.distancia && (
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {resultado.distancia} km de você
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {resultado.preco && (
                      <p className="font-bold text-green-600">R$ {resultado.preco.toFixed(2)}</p>
                    )}
                    {resultado.avaliacao && (
                      <p className="text-xs text-yellow-500">⭐ {resultado.avaliacao}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

