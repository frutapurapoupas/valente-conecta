"use client";
import { Bell, CheckCircle, Clock, Link, List, Package, Phone, Store, Users, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminMasterDashboard() {
  const [suggestions, setSuggestions] = useState([]);
  const [pendenciasServicos, setPendenciasServicos] = useState([]);
  const [pendenciasAdmin, setPendenciasAdmin] = useState([]);
  const [activeTab, setActiveTab] = useState('profissionais');
  const [copied, setCopied] = useState(null);
  const [stats] = useState({ users: 124, stores: 45, products: 1023 });

  // Carregar sugestões de profissionais
  useEffect(() => {
    const stored = localStorage.getItem('professional_suggestions');
    if (stored) setSuggestions(JSON.parse(stored));
  }, []);

  // Carregar pendências de serviços (cards não implementados)
  useEffect(() => {
    const stored = localStorage.getItem('pendencias_servicos');
    if (stored) setPendenciasServicos(JSON.parse(stored));
  }, []);

  // Carregar pendências do Admin Master (incluindo mototáxi)
  useEffect(() => {
    const stored = localStorage.getItem('pendencias_admin');
    if (stored) setPendenciasAdmin(JSON.parse(stored));
  }, []);

  // Aprovar profissional
  const handleApprove = (id) => {
    const updated = suggestions.filter(s => s.id !== id);
    localStorage.setItem('professional_suggestions', JSON.stringify(updated));
    setSuggestions(updated);
    alert('✅ Profissional aprovado!');
  };

  // Rejeitar profissional
  const handleReject = (id) => {
    const updated = suggestions.filter(s => s.id !== id);
    localStorage.setItem('professional_suggestions', JSON.stringify(updated));
    setSuggestions(updated);
    alert('❌ Sugestão rejeitada');
  };

  // Remover pendência de serviço
  const removerPendenciaServico = (id) => {
    const updated = pendenciasServicos.filter(p => p.id !== id);
    setPendenciasServicos(updated);
    localStorage.setItem('pendencias_servicos', JSON.stringify(updated));
    alert('✅ Pendência removida');
  };

  // Marcar pendência Admin como resolvida
  const marcarPendenciaResolvida = (id) => {
    const updated = pendenciasAdmin.filter(p => p.id !== id);
    setPendenciasAdmin(updated);
    localStorage.setItem('pendencias_admin', JSON.stringify(updated));
    alert('✅ Pendência marcada como resolvida!');
  };

  // Convidar mototaxista via WhatsApp
  const convidarMototaxistaWhatsApp = (pendencia) => {
    const message = `📢 *URGENTE - Cliente sem Mototáxi em Valente!*\n\n` +
      `Temos um cliente precisando de corrida AGORA:\n` +
      `*Cliente:* ${pendencia.dados.cliente}\n` +
      `*Telefone:* ${pendencia.dados.telefone}\n` +
      `*Valor:* R$ ${pendencia.dados.valor}\n` +
      `*Origem:* ${pendencia.dados.origem}\n` +
      `*Destino:* ${pendencia.dados.destino}\n\n` +
      `Cadastre-se agora no Valente Conecta e comece a faturar hoje mesmo!\n` +
      `👉 https://valente-conecta.clic.com.br/mototaxi\n\n` +
      `Atenciosamente,\nEquipe Valente Conecta`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/5575999999999?text=${encodedMessage}`, '_blank');
  };

  // Copiar link de convite para prestador de serviço
  const copiarLinkConvite = (servico, categoria) => {
    const link = `${window.location.origin}/admin-master/convite?servico=${encodeURIComponent(servico)}&categoria=${encodeURIComponent(categoria)}`;
    navigator.clipboard.writeText(link);
    setCopied(servico);
    setTimeout(() => setCopied(null), 2000);
  };

  // Enviar convite via WhatsApp
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

  const getIconByCategoria = (categoria) => {
    switch (categoria) {
      case 'Gastronomia': return <Package className="text-orange-500" size={16} />;
      case 'Serviços': return <Users className="text-blue-500" size={16} />;
      case 'Comércio': return <Store className="text-purple-500" size={16} />;
      case 'Utilidades': return <Clock className="text-cyan-500" size={16} />;
      default: return <Package className="text-gray-500" size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-8">
      {/* Header */}
      <div className="bg-indigo-700 text-white p-6 rounded-b-3xl">
        <h1 className="text-2xl font-bold">Admin Master</h1>
        <p className="text-sm opacity-80">Controle total do Valente Conecta</p>
      </div>

      {/* Stats */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-3"><Users className="text-blue-600 mb-1" size={20} /><p className="text-2xl font-bold">{stats.users}</p><p className="text-xs text-gray-500">Usuarios</p></div>
        <div className="bg-white rounded-xl p-3"><Store className="text-green-600 mb-1" size={20} /><p className="text-2xl font-bold">{stats.stores}</p><p className="text-xs text-gray-500">Lojas</p></div>
        <div className="bg-white rounded-xl p-3"><Package className="text-orange-600 mb-1" size={20} /><p className="text-2xl font-bold">{stats.products}</p><p className="text-xs text-gray-500">Produtos</p></div>
        <div className="bg-white rounded-xl p-3"><List className="text-purple-600 mb-1" size={20} /><p className="text-2xl font-bold">{suggestions.length + pendenciasServicos.length + pendenciasAdmin.length}</p><p className="text-xs text-gray-500">Total Pendentes</p></div>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <div className="flex gap-2 border-b">
          <button onClick={() => setActiveTab('profissionais')} className={`pb-2 px-3 text-sm font-medium ${activeTab === 'profissionais' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>
            👥 Profissionais ({suggestions.length})
          </button>
          <button onClick={() => setActiveTab('servicos')} className={`pb-2 px-3 text-sm font-medium ${activeTab === 'servicos' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>
            📦 Serviços ({pendenciasServicos.length})
          </button>
          <button onClick={() => setActiveTab('alertas')} className={`pb-2 px-3 text-sm font-medium ${activeTab === 'alertas' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}>
            🚨 Alertas ({pendenciasAdmin.length})
          </button>
        </div>
      </div>

      {/* Conteúdo - Profissionais */}
      {activeTab === 'profissionais' && (
        <div className="p-4">
          <div className="bg-white rounded-xl p-4">
            <h2 className="font-bold mb-3 flex items-center gap-2"><Users size={18} /> Sugestões de Profissionais</h2>
            {suggestions.length === 0 ? (
              <p className="text-gray-500 py-4 text-center">Nenhuma sugestão pendente</p>
            ) : (
              suggestions.map(s => (
                <div key={s.id} className="border-b py-3 flex justify-between items-center">
                  <div><p className="font-semibold">{s.name}</p><p className="text-sm text-gray-500">{s.category}</p><p className="text-xs text-gray-400">{new Date(s.timestamp).toLocaleDateString('pt-BR')}</p></div>
                  <div className="flex gap-2">
                    <button onClick={() => handleApprove(s.id)} className="bg-green-500 text-white px-3 py-1 rounded-full text-xs">Aprovar</button>
                    <button onClick={() => handleReject(s.id)} className="bg-red-500 text-white px-3 py-1 rounded-full text-xs">Rejeitar</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Conteúdo - Serviços (Cards não implementados) */}
      {activeTab === 'servicos' && (
        <div className="p-4">
          <div className="bg-white rounded-xl p-4">
            <h2 className="font-bold mb-3 flex items-center gap-2"><Bell size={18} /> Solicitações de Serviços</h2>
            {pendenciasServicos.length === 0 ? (
              <p className="text-gray-500 py-4 text-center">Nenhuma solicitação de serviço pendente</p>
            ) : (
              pendenciasServicos.map(p => (
                <div key={p.id} className="border-b py-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">{getIconByCategoria(p.categoria)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-800">{p.servico}</p>
                        <span className="text-[9px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">{p.categoria}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Solicitado em: {new Date(p.data).toLocaleDateString('pt-BR')}</p>
                      <p className="text-xs text-gray-500">Usuário: {p.usuario}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => copiarLinkConvite(p.servico, p.categoria)} className="flex-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs flex items-center justify-center gap-1">
                      {copied === p.servico ? <CheckCircle size={12} /> : <Link size={12} />}
                      {copied === p.servico ? "Copiado!" : "Copiar Link"}
                    </button>
                    <button onClick={() => enviarWhatsApp(p.servico, p.categoria)} className="flex-1 bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs flex items-center justify-center gap-1">
                      <Phone size={12} /> WhatsApp
                    </button>
                    <button onClick={() => removerPendenciaServico(p.id)} className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs flex items-center justify-center gap-1">
                      <XCircle size={12} /> Remover
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Instruções */}
          <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 text-sm mb-2">📌 Como proceder com solicitações de serviços</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Clique em <strong>"Copiar Link"</strong> para gerar um convite personalizado</li>
              <li>• Envie o convite para o prestador de serviço via WhatsApp</li>
              <li>• Após o prestador se cadastrar, remova a pendência da lista</li>
              <li>• O serviço aparecerá automaticamente para os usuários</li>
            </ul>
          </div>
        </div>
      )}

      {/* Conteúdo - Alertas Admin */}
      {activeTab === 'alertas' && (
        <div className="p-4">
          <div className="bg-white rounded-xl p-4">
            <h2 className="font-bold mb-3 flex items-center gap-2"><Bell size={18} /> Alertas do Sistema</h2>
            {pendenciasAdmin.length === 0 ? (
              <p className="text-gray-500 py-4 text-center">Nenhum alerta pendente</p>
            ) : (
              pendenciasAdmin.map(p => (
                <div key={p.id} className="border-b py-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 p-2 rounded-full">
                      <Bell className="text-red-600" size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-red-800">{p.titulo}</p>
                        <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                          {p.tipo === 'mototaxi_indisponivel' ? 'Mototáxi' : 'Sistema'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{p.descricao}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(p.data).toLocaleDateString('pt-BR')} às {new Date(p.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>

                      {p.tipo === 'mototaxi_indisponivel' && p.dados && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-lg text-xs">
                          <p><strong>Cliente:</strong> {p.dados.cliente}</p>
                          <p><strong>Telefone:</strong> {p.dados.telefone}</p>
                          <p><strong>Valor:</strong> R$ {p.dados.valor}</p>
                          <p><strong>Rota:</strong> {p.dados.origem} → {p.dados.destino}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {p.tipo === 'mototaxi_indisponivel' && (
                      <button
                        onClick={() => convidarMototaxistaWhatsApp(p)}
                        className="flex-1 bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs flex items-center justify-center gap-1"
                      >
                        <Phone size={12} /> Convidar Mototaxista
                      </button>
                    )}
                    <button
                      onClick={() => marcarPendenciaResolvida(p.id)}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs flex items-center justify-center gap-1"
                    >
                      <CheckCircle size={12} /> Marcar Resolvido
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Instruções para Alertas */}
          <div className="mt-4 bg-red-50 rounded-xl p-4 border border-red-200">
            <h3 className="font-semibold text-red-800 text-sm mb-2">🚨 Como proceder com alertas</h3>
            <ul className="text-xs text-red-700 space-y-1">
              <li>• <strong>Alertas de Mototáxi:</strong> Clientes sem motoristas disponíveis</li>
              <li>• Use <strong>"Convidar Mototaxista"</strong> para enviar WhatsApp rápido</li>
              <li>• Após resolver, marque como <strong>"Resolvido"</strong></li>
              <li>• Alertas críticos requerem ação imediata</li>
            </ul>
          </div>
        </div>
      )}

      <div className="p-4"><a href="/" className="block text-center text-blue-600">← Voltar para Home</a></div>
    </div>
  );
}