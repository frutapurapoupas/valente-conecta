"use client";

import {
  Bell,
  Building,
  CheckCircle,
  Clock,
  Package,
  Phone,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminPendentesPage() {
  const [pendencias, setPendencias] = useState([]);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('pendencias_servicos');
    if (stored) {
      setPendencias(JSON.parse(stored));
    }
  }, []);

  const getIconByCategoria = (categoria) => {
    switch (categoria) {
      case 'Gastronomia': return <Package className="text-orange-500" size={18} />;
      case 'Serviços': return <Building className="text-blue-500" size={18} />;
      case 'Comércio': return <Building className="text-purple-500" size={18} />;
      case 'Utilidades': return <Clock className="text-cyan-500" size={18} />;
      default: return <Package className="text-gray-500" size={18} />;
    }
  };

  const removerPendencia = (id) => {
    const updated = pendencias.filter(p => p.id !== id);
    setPendencias(updated);
    localStorage.setItem('pendencias_servicos', JSON.stringify(updated));
    alert('✅ Pendência removida');
  };

  const copiarLinkConvite = (servico, categoria) => {
    const link = `${window.location.origin}/admin-master/convite?servico=${encodeURIComponent(servico)}&categoria=${encodeURIComponent(categoria)}`;
    navigator.clipboard.writeText(link);
    setCopied(servico);
    setTimeout(() => setCopied(null), 2000);
  };

  const enviarWhatsApp = (servico, categoria) => {
    const link = `${window.location.origin}/admin-master/convite?servico=${encodeURIComponent(servico)}&categoria=${encodeURIComponent(categoria)}`;
    const message = `📢 *Convite para cadastro - Valente Conecta*\n\n` +
      `Recebemos uma solicitação para incluir o serviço:\n` +
      `*${servico}* (${categoria})\n\n` +
      `Clique no link para cadastrar este serviço na plataforma:\n${link}\n\n` +
      `Atenciosamente,\nEquipe Valente Conecta`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/5575999999999?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white p-6 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pendências de Serviços</h1>
            <p className="text-sm opacity-90">Solicitações de novos serviços e produtos</p>
          </div>
          <div className="relative bg-white/20 p-2 rounded-full">
            <Bell size={20} />
            {pendencias.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                {pendencias.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-3">
          <Clock size={18} className="text-yellow-500 mb-1" />
          <p className="text-2xl font-bold">{pendencias.length}</p>
          <p className="text-xs text-gray-500">Pendências</p>
        </div>
        <div className="bg-white rounded-xl p-3">
          <Package size={18} className="text-green-500 mb-1" />
          <p className="text-2xl font-bold">{pendencias.filter(p => p.status === 'pendente').length}</p>
          <p className="text-xs text-gray-500">Aguardando ação</p>
        </div>
      </div>

      {/* Lista de Pendências */}
      <div className="p-4 space-y-3">
        <h2 className="font-bold text-gray-800 text-sm mb-2">📋 Solicitações Recentes</h2>

        {pendencias.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <CheckCircle size={48} className="mx-auto text-green-300 mb-3" />
            <p className="text-gray-500">Nenhuma pendência no momento</p>
            <p className="text-xs text-gray-400 mt-1">Quando usuários solicitarem novos serviços, aparecerão aqui</p>
          </div>
        ) : (
          pendencias.map(pendencia => (
            <div key={pendencia.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="bg-gray-100 p-2 rounded-full">
                  {getIconByCategoria(pendencia.categoria)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-800">{pendencia.servico}</h3>
                    <span className="text-[9px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">
                      {pendencia.categoria}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Solicitado em: {new Date(pendencia.data).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-xs text-gray-500">
                    Usuário: {pendencia.usuario}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => copiarLinkConvite(pendencia.servico, pendencia.categoria)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Copiar link de convite"
                  >
                    {copied === pendencia.servico ? <CheckCircle size={16} /> : <LinkIcon size={16} />}
                  </button>
                  <button
                    onClick={() => enviarWhatsApp(pendencia.servico, pendencia.categoria)}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                    title="Enviar via WhatsApp"
                  >
                    <Phone size={16} />
                  </button>
                  <button
                    onClick={() => removerPendencia(pendencia.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Remover pendência"
                  >
                    <XCircle size={16} />
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
            <li>• Clique no <strong>link</strong> para copiar o convite personalizado</li>
            <li>• Envie o convite para o prestador de serviço via WhatsApp</li>
            <li>• Após cadastrar, remova a pendência da lista</li>
            <li>• O serviço aparecerá automaticamente para os usuários</li>
          </ul>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center py-2 px-3 shadow-lg">
        <Link href="/admin-master/dashboard" className="flex flex-col items-center text-indigo-600">
          <Bell size={20} /><span className="text-[10px]">Dashboard</span>
        </Link>
        <Link href="/admin-master/pendentes" className="flex flex-col items-center text-indigo-600">
          <Clock size={20} /><span className="text-[10px]">Pendências</span>
        </Link>
        <Link href="/" className="flex flex-col items-center text-gray-500">
          <Package size={20} /><span className="text-[10px]">App</span>
        </Link>
      </nav>
    </div>
  );
}