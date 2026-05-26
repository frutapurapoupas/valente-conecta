"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function MotoTaxiPage() {
  const router = useRouter();
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [preco, setPreco] = useState<number | null>(null);
  const [historico, setHistorico] = useState([
    { id: 1, origem: "Centro", destino: "Bairro A", preco: 12, data: "10/05" },
    { id: 2, origem: "Bairro A", destino: "Centro", preco: 12, data: "09/05" },
  ]);

  const motoristas = [
    { id: 1, nome: "Carlos Moto", avaliacao: 4.8, veiculo: "Honda CG 160", tempo: "3 min", placa: "ABC-1234" },
    { id: 2, nome: "Paulo Freire", avaliacao: 4.9, veiculo: "Yamaha Fazer 250", tempo: "5 min", placa: "DEF-5678" },
    { id: 3, nome: "José Roberto", avaliacao: 4.7, veiculo: "Suzuki Intruder", tempo: "7 min", placa: "GHI-9012" },
  ];

  const calcularPreco = () => {
    if (!origem || !destino) { toast.error("Preencha origem e destino"); return; }
    const distancia = Math.floor(Math.random() * 10) + 2;
    const valor = distancia * 2.5;
    setPreco(valor);
    toast.success(`Distância estimada: ${distancia}km`);
  };

  const solicitarCorrida = (motorista: any) => {
    if (!preco) { toast.error("Calcule o preço primeiro"); return; }
    const mensagem = `🏍️ *SOLICITAÇÃO DE CORRIDA*%0A%0A📍 Origem: ${origem}%0A📍 Destino: ${destino}%0A💰 Preço: R$ ${preco.toFixed(2)}%0A👨‍✈️ Motorista: ${motorista.nome}%0A🚲 Veículo: ${motorista.veiculo}%0A🪪 Placa: ${motorista.placa}%0A%0A✅ Confirmar corrida?`;
    window.open(`https://wa.me/5575999999999?text=${mensagem}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <header className="gradient-primary p-4 flex items-center gap-3"><button onClick={() => router.back()}><i className="fas fa-arrow-left text-white"></i></button><h1 className="text-white font-bold text-xl">🏍️ Moto Táxi Valente</h1></header>

      <div className="p-4 space-y-4">
        <div className="bg-white/10 rounded-2xl p-4"><h2 className="text-white font-bold mb-3">📍 Solicitar Corrida</h2><input type="text" placeholder="Ponto de partida" value={origem} onChange={(e) => setOrigem(e.target.value)} className="w-full bg-white/20 rounded-xl p-3 text-white mb-2 placeholder-gray-400" /><input type="text" placeholder="Destino" value={destino} onChange={(e) => setDestino(e.target.value)} className="w-full bg-white/20 rounded-xl p-3 text-white mb-3 placeholder-gray-400" /><button onClick={calcularPreco} className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold">Calcular Preço</button>{preco && (<div className="mt-3 text-center"><p className="text-green-400 font-bold text-2xl">R$ {preco.toFixed(2)}</p><p className="text-gray-400 text-sm">Preço estimado</p></div>)}</div>

        <div><h2 className="text-white font-bold mb-3">🏍️ Motoristas Próximos</h2><div className="space-y-2">{motoristas.map(m => (<div key={m.id} className="bg-white/10 rounded-2xl p-3"><div className="flex justify-between items-center"><div><p className="font-bold text-white">{m.nome}</p><p className="text-yellow-400 text-sm">⭐ {m.avaliacao}</p><p className="text-gray-400 text-xs">{m.veiculo}</p></div><div className="text-right"><p className="text-green-400 text-sm">{m.tempo}</p><button onClick={() => solicitarCorrida(m)} className="mt-1 bg-green-500 text-black px-4 py-1 rounded-full text-sm font-bold">Solicitar</button></div></div></div>))}</div></div>

        <div><h2 className="text-white font-bold mb-3">📜 Histórico de Corridas</h2>{historico.map(h => (<div key={h.id} className="bg-white/5 rounded-xl p-2 flex justify-between text-sm"><span>{h.origem} → {h.destino}</span><span className="text-green-400">R$ {h.preco}</span><span className="text-gray-400">{h.data}</span></div>))}</div>
      </div>
    </div>
  );
}
