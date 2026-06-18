"use client";

import { ArrowLeft, Phone, ShoppingBag, Store, Utensils } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CozinhaParceiroPage() {
  const router = useRouter();
  const [pratos, setPratos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Carrega dados do Admin Master
    const storedCompleto = localStorage.getItem("cozinha_cardapio_completo");
    const storedImagens = localStorage.getItem("cozinha_cardapio_imagens");

    const cardapioPadrao = [
      { id: 1, name: "Frango com Quiabo", price: 12, pricePartner: 10, description: "Frango com quiabo, vinagrete, arroz e feijão", image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=1200&auto=format&fit=crop" },
      { id: 2, name: "Bife à Cavalo", price: 14, pricePartner: 11.50, description: "Bife acebolado, ovo frito, arroz, feijão e farofa", image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop" },
      { id: 3, name: "Strogonoff", price: 12, pricePartner: 10, description: "Strogonoff de frango, arroz e batata palha", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=1200&auto=format&fit=crop" },
      { id: 4, name: "Feijoada Magra", price: 12, pricePartner: 10, description: "Feijoada magra, arroz, couve e farofa", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1200&auto=format&fit=crop" },
      { id: 5, name: "PF Completo", price: 24.90, pricePartner: 20, description: "Arroz, feijão, bife acebolado, farofa, salada e ovo frito", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format&fit=crop" },
      { id: 6, name: "Peixe à Milanesa", price: 28.90, pricePartner: 24, description: "Filé de peixe empanado, arroz, purê e salada", image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=1200&auto=format&fit=crop" }
    ];

    if (storedCompleto) {
      try {
        const dados = JSON.parse(storedCompleto);
        const pratosFormatados = dados.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          pricePartner: p.price * 0.85,
          description: p.description,
          image: p.image
        }));
        setPratos(pratosFormatados);
      } catch (e) {
        setPratos(cardapioPadrao);
      }
    } else if (storedImagens) {
      const imagens = JSON.parse(storedImagens);
      const pratosComImagens = cardapioPadrao.map(p => ({
        ...p,
        image: imagens[p.name] || p.image
      }));
      setPratos(pratosComImagens);
    } else {
      setPratos(cardapioPadrao);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header Parceiro */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 text-white rounded-b-3xl shadow-lg">
        <div className="px-5 pt-4 pb-3">
          <button onClick={() => router.back()} className="bg-white/20 p-1.5 rounded-full mb-2 inline-flex items-center gap-1 text-sm hover:bg-white/30 transition-all">
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="mt-2">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-2xl">
                <Store size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold">Área do Parceiro</h1>
                <p className="text-white/80 text-xs">Preços especiais para revendedores</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Parceiro */}
      <div className="bg-amber-50 mx-4 mt-4 p-3 rounded-xl border border-amber-200">
        <p className="text-xs text-amber-800 text-center">
          🎯 Você está na área de parceiros! Preços com desconto especial para revenda.
        </p>
      </div>

      {/* Cardápio Parceiro */}
      <div className="px-5 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <Utensils size={16} className="text-green-600" />
          <h2 className="font-bold text-gray-800 text-sm">🍽️ Cardápio Revendedor</h2>
          <span className="text-[9px] text-gray-400 ml-auto">{pratos.length} produtos</span>
        </div>

        <div className="space-y-3">
          {pratos.map(prato => (
            <div key={prato.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-green-100 hover:shadow-md transition-all">
              <div className="flex gap-3 p-3">
                <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                  <img src={prato.image} alt={prato.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-sm">{prato.name}</h3>
                  <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{prato.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <span className="font-bold text-green-600 text-sm">R$ {(prato.pricePartner || prato.price * 0.85).toFixed(2)}</span>
                      <span className="text-[9px] text-gray-400 line-through ml-2">R$ {prato.price.toFixed(2)}</span>
                      <span className="text-[9px] bg-green-100 text-green-700 ml-2 px-1.5 py-0.5 rounded-full">15% OFF</span>
                    </div>
                    <button className="bg-green-600 text-white px-3 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 hover:bg-green-700 transition-all">
                      <ShoppingBag size={10} /> Revender
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp Parceiro */}
      <div className="mx-5 mt-4">
        <div className="bg-green-50 rounded-xl p-3 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <Phone size={14} className="text-green-600" />
            <h3 className="font-semibold text-gray-800 text-xs">📞 Atendimento a Parceiros</h3>
          </div>
          <p className="text-[10px] text-gray-600">Fale com nossa equipe comercial para revenda</p>
          <button className="mt-2 bg-green-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-semibold w-full hover:bg-green-700 transition-all">
            WhatsApp Comercial: (75) 9 8888-8888
          </button>
        </div>
      </div>
    </div>
  );
}