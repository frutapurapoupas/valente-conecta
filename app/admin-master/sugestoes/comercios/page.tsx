"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle, XCircle, Package, Store, 
  Phone, MapPin, AlertCircle, Bell
} from "lucide-react";
import Link from "next/link";

export default function AdminSugestoesComerciosPage() {
  const [sugestoes, setSugestoes] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('sugestoes_outros_comercios');
    if (stored) {
      setSugestoes(JSON.parse(stored));
    }
  }, []);

  const handleApprove = (id) => {
    const sugestao = sugestoes.find(s => s.id === id);
    
    // Adicionar aos itens aprovados
    const storedAprovados = localStorage.getItem('outros_comercios_adicionados');
    const aprovados = storedAprovados ? JSON.parse(storedAprovados) : [];
    
    const novoItem = {
      id: Date.now(),
      nome: sugestao.nome,
      descricao: sugestao.descricao,
      icone: "✅",
      cor: "bg-green-100",
      href: `/comercio/outros/${sugestao.nome.toLowerCase().replace(/ /g, '-')}`,
      aprovado: true
    };
    
    aprovados.push(novoItem);
    localStorage.setItem('outros_comercios_adicionados', JSON.stringify(aprovados));
    
    // Remover da lista de sugestões pendentes
    const updated = sugestoes.filter(s => s.id !== id);
    setSugestoes(updated);
    localStorage.setItem('sugestoes_outros_comercios', JSON.stringify(updated));
    
    alert(`✅ "${sugestao.nome}" foi aprovado e adicionado à lista!`);
  };

  const handleReject = (id) => {
    const sugestao = sugestoes.find(s => s.id === id);
    const updated = sugestoes.filter(s => s.id !== id);
    setSugestoes(updated);
    localStorage.setItem('sugestoes_outros_comercios', JSON.stringify(updated));
    alert(`❌ Sugestão "${sugestao?.nome}" foi rejeitada.`);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white p-6 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Sugestões de Comércios</h1>
            <p className="text-sm opacity-90">Aprove ou rejeite sugestões de novos estabelecimentos</p>
          </div>
          <div className="relative bg-white/20 p-2 rounded-full">
            <Bell size={20} />
            {sugestoes.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                {sugestoes.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-3">
          <Package size={18} className="text-yellow-500 mb-1" />
          <p className="text-2xl font-bold">{sugestoes.length}</p>
          <p className="text-xs text-gray-500">Pendentes</p>
        </div>
        <div className="bg-white rounded-xl p-3">
          <Store size={18} className="text-green-500 mb-1" />
          <p className="text-2xl font-bold">0</p>
          <p className="text-xs text-gray-500">Aprovados este mês</p>
        </div>
      </div>

      {/* Lista de Sugestões */}
      <div className="p-4 space-y-3">
        <h2 className="font-bold text-gray-800 text-sm mb-2">📋 Sugestões Pendentes</h2>
        
        {sugestoes.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <CheckCircle size={48} className="mx-auto text-green-300 mb-3" />
            <p className="text-gray-500">Nenhuma sugestão pendente</p>
            <p className="text-xs text-gray-400 mt-1">Quando usuários sugerirem novos comércios, aparecerão aqui</p>
          </div>
        ) : (
          sugestoes.map(sugestao => (
            <div key={sugestao.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="bg-gray-100 p-2 rounded-full">
                  <Store size={18} className="text-blue-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-800">{sugestao.nome}</h3>
                    <span className="text-[9px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">Pendente</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{sugestao.descricao}</p>
                  {sugestao.contato && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Phone size={10} /> {sugestao.contato}</p>
                  )}
                  {sugestao.endereco && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin size={10} /> {sugestao.endereco}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(sugestao.id)} className="bg-green-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                    <CheckCircle size={12} /> Aprovar
                  </button>
                  <button onClick={() => handleReject(sugestao.id)} className="bg-red-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                    <XCircle size={12} /> Rejeitar
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Instruções */}
      <div className="px-4 mb-8">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <h3 className="font-semibold text-blue-800 text-sm mb-2">📌 Como proceder</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• <strong>Aprovar</strong> - O comércio será adicionado à lista "Outros" para todos os usuários</li>
            <li>• <strong>Rejeitar</strong> - A sugestão será descartada</li>
            <li>• Os usuários podem sugerir novos comércios através da tela "Outros"</li>
          </ul>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center py-2 px-3 shadow-lg">
        <Link href="/admin-master/dashboard" className="flex flex-col items-center text-indigo-600">
          <Bell size={20} /><span className="text-[10px]">Dashboard</span>
        </Link>
        <Link href="/admin-master/sugestoes/comercios" className="flex flex-col items-center text-indigo-600">
          <Store size={20} /><span className="text-[10px]">Sugestões</span>
        </Link>
        <Link href="/" className="flex flex-col items-center text-gray-500">
          <Package size={20} /><span className="text-[10px]">App</span>
        </Link>
      </nav>
    </div>
  );
}