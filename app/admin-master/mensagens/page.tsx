"use client";

import React, { useState, useEffect } from "react";
import { 
  Bell, Send, Edit, Save, X, Plus, Trash2,
  CheckCircle, AlertCircle, Clock, Mail, MessageCircle,
  Users, Building, User, Calendar, DollarSign, Award
} from "lucide-react";

interface MensagemPadrao {
  id: number;
  titulo: string;
  corpo: string;
  tipo: "vencimento" | "boas_vindas" | "bonus" | "promocao" | "alerta";
  ativa: boolean;
}

export default function AdminMensagensPage() {
  const [mensagens, setMensagens] = useState<MensagemPadrao[]>([
    { id: 1, titulo: "📅 Proximidade de Vencimento", corpo: "Olá {nome}, seu plano {plano} vence em {dias} dias! Renove agora e continue aproveitando.", tipo: "vencimento", ativa: true },
    { id: 2, titulo: "🎉 Boas-vindas", corpo: "Seja bem-vindo ao Valente Conecta, {nome}! Estamos felizes em ter você conosco.", tipo: "boas_vindas", ativa: true },
    { id: 3, titulo: "🎁 Bônus Especial", corpo: "Parabéns, {nome}! Você ganhou um bônus de {bonus} por sua indicação!", tipo: "bonus", ativa: true },
    { id: 4, titulo: "🔥 Promoção Relâmpago", corpo: "Aproveite {desconto}% OFF em todos os planos! Use o cupom: {cupom}", tipo: "promocao", ativa: true },
    { id: 5, titulo: "⚠️ Alerta de Segurança", corpo: "Detectamos um acesso não autorizado em sua conta. Entre em contato conosco.", tipo: "alerta", ativa: true },
  ]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editando, setEditando] = useState({ titulo: "", corpo: "", tipo: "" });
  const [showNewModal, setShowNewModal] = useState(false);
  const [novaMensagem, setNovaMensagem] = useState({ titulo: "", corpo: "", tipo: "promocao" });

  const handleSave = (id: number) => {
    setMensagens(mensagens.map(m => 
      m.id === id ? { ...m, titulo: editando.titulo, corpo: editando.corpo, tipo: editando.tipo as any } : m
    ));
    setEditingId(null);
    alert("✅ Mensagem salva!");
  };

  const handleToggle = (id: number) => {
    setMensagens(mensagens.map(m => m.id === id ? { ...m, ativa: !m.ativa } : m));
  };

  const handleDelete = (id: number) => {
    if (confirm("Remover esta mensagem?")) {
      setMensagens(mensagens.filter(m => m.id !== id));
    }
  };

  const handleAddNew = () => {
    const newId = Math.max(...mensagens.map(m => m.id), 0) + 1;
    setMensagens([...mensagens, { 
      id: newId, 
      titulo: novaMensagem.titulo, 
      corpo: novaMensagem.corpo, 
      tipo: novaMensagem.tipo as any, 
      ativa: true 
    }]);
    setShowNewModal(false);
    setNovaMensagem({ titulo: "", corpo: "", tipo: "promocao" });
    alert("✅ Nova mensagem adicionada!");
  };

  const getTipoCor = (tipo: string) => {
    switch(tipo) {
      case "vencimento": return "bg-yellow-100 text-yellow-700";
      case "boas_vindas": return "bg-green-100 text-green-700";
      case "bonus": return "bg-purple-100 text-purple-700";
      case "promocao": return "bg-blue-100 text-blue-700";
      case "alerta": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Nova Mensagem</h3>
            <div className="space-y-3">
              <input type="text" value={novaMensagem.titulo} onChange={(e) => setNovaMensagem({...novaMensagem, titulo: e.target.value})} placeholder="Título" className="w-full p-2 border rounded-lg" />
              <select value={novaMensagem.tipo} onChange={(e) => setNovaMensagem({...novaMensagem, tipo: e.target.value})} className="w-full p-2 border rounded-lg">
                <option value="vencimento">Vencimento</option>
                <option value="boas_vindas">Boas-vindas</option>
                <option value="bonus">Bônus</option>
                <option value="promocao">Promoção</option>
                <option value="alerta">Alerta</option>
              </select>
              <textarea value={novaMensagem.corpo} onChange={(e) => setNovaMensagem({...novaMensagem, corpo: e.target.value})} placeholder="Corpo da mensagem..." className="w-full p-2 border rounded-lg h-24" />
              <button onClick={handleAddNew} className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold">Adicionar</button>
              <button onClick={() => setShowNewModal(false)} className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-gray-800">📨 Mensagens</h1><p className="text-gray-500 text-sm">Gerencie mensagens padrão para envio aos usuários</p></div>
        <button onClick={() => setShowNewModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"><Plus size={16} /> Nova Mensagem</button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {mensagens.map(msg => (
          <div key={msg.id} className={`bg-white rounded-xl shadow-sm border-l-4 ${msg.ativa ? "border-green-500" : "border-gray-300"}`}>
            {editingId === msg.id ? (
              <div className="p-4 space-y-3">
                <input type="text" value={editando.titulo} onChange={(e) => setEditando({...editando, titulo: e.target.value})} className="w-full p-2 border rounded-lg font-bold" />
                <select value={editando.tipo} onChange={(e) => setEditando({...editando, tipo: e.target.value})} className="w-full p-2 border rounded-lg">
                  <option value="vencimento">Vencimento</option>
                  <option value="boas_vindas">Boas-vindas</option>
                  <option value="bonus">Bônus</option>
                  <option value="promocao">Promoção</option>
                  <option value="alerta">Alerta</option>
                </select>
                <textarea value={editando.corpo} onChange={(e) => setEditando({...editando, corpo: e.target.value})} className="w-full p-2 border rounded-lg h-24" />
                <div className="flex gap-2"><button onClick={() => handleSave(msg.id)} className="flex-1 bg-green-600 text-white py-1 rounded-lg text-sm flex items-center justify-center gap-1"><Save size={14} /> Salvar</button><button onClick={() => setEditingId(null)} className="flex-1 bg-gray-200 text-gray-700 py-1 rounded-lg text-sm">Cancelar</button></div>
              </div>
            ) : (
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-800">{msg.titulo}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${getTipoCor(msg.tipo)}`}>{msg.tipo}</span>
                      {msg.ativa ? <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Ativa</span> : <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inativa</span>}
                    </div>
                    <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{msg.corpo}</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => { setEditingId(msg.id); setEditando({ titulo: msg.titulo, corpo: msg.corpo, tipo: msg.tipo }); }} className="text-blue-600 text-xs flex items-center gap-1"><Edit size={12} /> Editar</button>
                      <button onClick={() => handleToggle(msg.id)} className={`text-xs flex items-center gap-1 ${msg.ativa ? "text-red-600" : "text-green-600"}`}>{msg.ativa ? <X size={12} /> : <CheckCircle size={12} />} {msg.ativa ? "Desativar" : "Ativar"}</button>
                      <button onClick={() => handleDelete(msg.id)} className="text-red-600 text-xs flex items-center gap-1"><Trash2 size={12} /> Excluir</button>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    <p>ID: {msg.id}</p>
                    <p className="font-mono text-[9px]">{"{nome}"}, {"{plano}"}, {"{dias}"}, {"{bonus}"}, {"{desconto}"}, {"{cupom}"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <h3 className="font-semibold text-blue-800 text-sm mb-2">📌 Variáveis disponíveis</h3>
        <div className="flex flex-wrap gap-2 text-xs text-blue-700">
          <code className="bg-blue-100 px-2 py-1 rounded">{`{nome}`}</code>
          <code className="bg-blue-100 px-2 py-1 rounded">{`{plano}`}</code>
          <code className="bg-blue-100 px-2 py-1 rounded">{`{dias}`}</code>
          <code className="bg-blue-100 px-2 py-1 rounded">{`{bonus}`}</code>
          <code className="bg-blue-100 px-2 py-1 rounded">{`{desconto}`}</code>
          <code className="bg-blue-100 px-2 py-1 rounded">{`{cupom}`}</code>
        </div>
      </div>
    </div>
  );
}