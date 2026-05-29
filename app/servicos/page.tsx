"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Adicionado para desabilitar renderização estática
export const dynamic = 'force-dynamic';

export default function ServicosPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profissionais" | "veiculos" | "imoveis">("profissionais");

  const profissionais = [
    { id: 1, nome: "Dra. Ana Lima", especialidade: "Médica Clínica Geral", avaliacao: 4.9, preco: 150, disponivel: true },
    { id: 2, nome: "Carlos Mendes", especialidade: "Eletricista", avaliacao: 4.8, preco: 80, disponivel: true },
    { id: 3, nome: "Mariana Silva", especialidade: "Cabelereira", avaliacao: 4.7, preco: 60, disponivel: true },
    { id: 4, nome: "José Pereira", especialidade: "Encanador", avaliacao: 4.6, preco: 90, disponivel: false },
  ];

  const veiculos = [
    { id: 1, nome: "Fiat Uno 2015", preco: 25000, km: 89000, imagem: "🚗", vendedor: "João" },
    { id: 2, nome: "Honda CG 2022", preco: 15000, km: 12000, imagem: "🏍️", vendedor: "Carlos" },
  ];

  const imoveis = [
    { id: 1, nome: "Casa 2 quartos", preco: 800, tipo: "Aluguel", area: "80m²", bairro: "Centro" },
    { id: 2, nome: "Apartamento 3 quartos", preco: 250000, tipo: "Venda", area: "120m²", bairro: "Bairro Novo" },
  ];

  const agendarConsulta = (prof: any) => {
    const mensagem = `👨‍⚕️ *AGENDAMENTO*%0A%0AProfissional: ${prof.nome}%0AEspecialidade: ${prof.especialidade}%0APreço: R$ ${prof.preco}%0A%0AGostaria de agendar um horário.`;
    window.open(`https://wa.me/5575999999999?text=${mensagem}`, "_blank");
  };

  const interessado = (item: any, tipo: string) => {
    const mensagem = `💰 *INTERESSADO*%0A%0A${tipo}: ${item.nome}%0APreço: ${item.preco}%0A%0ATenho interesse!`;
    window.open(`https://wa.me/5575999999999?text=${mensagem}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <header className="gradient-primary p-4 flex items-center gap-3"><button onClick={() => router.back()}><i className="fas fa-arrow-left text-white"></i></button><h1 className="text-white font-bold text-xl">🔧 Serviços</h1></header>

      <div className="flex border-b border-gray-800"><button onClick={() => setActiveTab("profissionais")} className={`flex-1 py-3 text-center ${activeTab === "profissionais" ? "text-yellow-400 border-b-2 border-yellow-400" : "text-gray-400"}`}>👨‍⚕️ Profissionais</button><button onClick={() => setActiveTab("veiculos")} className={`flex-1 py-3 text-center ${activeTab === "veiculos" ? "text-yellow-400 border-b-2 border-yellow-400" : "text-gray-400"}`}>🚗 Veículos</button><button onClick={() => setActiveTab("imoveis")} className={`flex-1 py-3 text-center ${activeTab === "imoveis" ? "text-yellow-400 border-b-2 border-yellow-400" : "text-gray-400"}`}>🏠 Imóveis</button></div>

      {activeTab === "profissionais" && (<div className="p-4 space-y-3">{profissionais.map(p => (<div key={p.id} className="bg-white/10 rounded-2xl p-3"><div className="flex justify-between"><div><p className="font-bold text-white">{p.nome}</p><p className="text-gray-400 text-sm">{p.especialidade}</p><p className="text-yellow-400 text-sm">⭐ {p.avaliacao}</p></div><div className="text-right"><p className="text-green-400 font-bold">R$ {p.preco}</p><button onClick={() => agendarConsulta(p)} disabled={!p.disponivel} className={`mt-2 px-4 py-1 rounded-full text-sm ${p.disponivel ? "bg-green-500 text-black" : "bg-gray-600 text-gray-400"}`}>{p.disponivel ? "Agendar" : "Indisponível"}</button></div></div></div>))}</div>)}

      {activeTab === "veiculos" && (<div className="p-4 space-y-3">{veiculos.map(v => (<div key={v.id} className="bg-white/10 rounded-2xl p-3"><div className="flex items-center gap-3"><div className="text-5xl">{v.imagem}</div><div className="flex-1"><p className="font-bold text-white">{v.nome}</p><p className="text-gray-400 text-sm">{v.km} km</p><p className="text-green-400 font-bold">R$ {v.preco.toLocaleString()}</p></div><button onClick={() => interessado(v, "Veículo")} className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm">Interessado</button></div></div>))}</div>)}

      {activeTab === "imoveis" && (<div className="p-4 space-y-3">{imoveis.map(i => (<div key={i.id} className="bg-white/10 rounded-2xl p-3"><div className="flex justify-between"><div><p className="font-bold text-white">{i.nome}</p><p className="text-gray-400 text-sm">{i.area} • {i.bairro}</p><p className="text-green-400 font-bold">{i.tipo === "Aluguel" ? `R$ ${i.preco}/mês` : `R$ ${i.preco.toLocaleString()}`}</p></div><button onClick={() => interessado(i, i.tipo)} className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm">Interessado</button></div></div>))}</div>)}
    </div>
  );
}