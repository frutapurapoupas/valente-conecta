"use client";

import {
  CheckCircle,
  Download,
  Edit,
  Eye,
  MapPin,
  MessageCircle,
  Plus,
  QrCode,
  Save,
  Search,
  Store,
  Trash2,
  Upload,
  X,
  XCircle
} from "lucide-react";
import { useEffect, useState } from "react";

interface Contato {
  id: number;
  nome: string;
  responsavel: string;
  telefone: string;
  email: string;
  endereco: string;
  cidade: string;
  categoria: string;
  status: "ativo" | "inativo" | "pendente";
  cnpj?: string;
  dataCadastro: string;
}

export default function ContatosLojas() {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterCidade, setFilterCidade] = useState("todos");
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [editingContato, setEditingContato] = useState<Contato | null>(null);
  const [selectedContato, setSelectedContato] = useState<Contato | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [cidades, setCidades] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    nome: "",
    responsavel: "",
    telefone: "",
    email: "",
    endereco: "",
    cidade: "Valente",
    categoria: "",
    status: "ativo" as "ativo" | "inativo" | "pendente",
    cnpj: ""
  });

  useEffect(() => {
    const mockContatos: Contato[] = [
      { id: 1, nome: "Mercado Central", responsavel: "João Silva", telefone: "(75) 99999-1111", email: "contato@mercadocentral.com", endereco: "Rua principal, 123", cidade: "Valente", categoria: "Supermercado", status: "ativo", cnpj: "12.345.678/0001-90", dataCadastro: new Date().toISOString() },
      { id: 2, nome: "Farmácia Popular", responsavel: "Maria Santos", telefone: "(75) 99999-2222", email: "farmacia@popular.com", endereco: "Av. Central, 456", cidade: "Valente", categoria: "Farmácia", status: "ativo", cnpj: "23.456.789/0001-01", dataCadastro: new Date().toISOString() },
      { id: 3, nome: "Auto Peças Silva", responsavel: "Carlos Oliveira", telefone: "(75) 99999-3333", email: "pecas@silva.com", endereco: "Rua das Oficinas, 789", cidade: "Rafael Jambeiro", categoria: "Auto Peças", status: "pendente", cnpj: "34.567.890/0001-12", dataCadastro: new Date().toISOString() },
      { id: 4, nome: "Padaria do Pão", responsavel: "José Santos", telefone: "(75) 99999-5555", email: "pao@padaria.com", endereco: "Praça Central, 10", cidade: "Valente", categoria: "Padaria", status: "ativo", cnpj: "45.678.901/0001-23", dataCadastro: new Date().toISOString() },
      { id: 5, nome: "Vestuario Fashion", responsavel: "Ana Paula", telefone: "(75) 99999-6666", email: "contato@fashion.com", endereco: "Rua das Lojas, 50", cidade: "Santa Bárbara", categoria: "Vestuário", status: "inativo", cnpj: "56.789.012/0001-34", dataCadastro: new Date().toISOString() },
    ];
    setContatos(mockContatos);
    setCidades(["Valente", "Rafael Jambeiro", "Santa Bárbara", "Santaluz", "Conceição do Coité"]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo": return "bg-green-100 text-green-700";
      case "inativo": return "bg-red-100 text-red-700";
      case "pendente": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ativo": return "Ativo";
      case "inativo": return "Inativo";
      case "pendente": return "Pendente";
      default: return status;
    }
  };

  const handleView = (contato: Contato) => {
    setSelectedContato(contato);
    setShowViewModal(true);
  };

  const handleEdit = (contato: Contato) => {
    setEditingContato(contato);
    setFormData({
      nome: contato.nome,
      responsavel: contato.responsavel,
      telefone: contato.telefone,
      email: contato.email,
      endereco: contato.endereco,
      cidade: contato.cidade,
      categoria: contato.categoria,
      status: contato.status,
      cnpj: contato.cnpj || ""
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta loja?")) {
      setContatos(contatos.filter(c => c.id !== id));
      alert("✅ Loja excluída com sucesso!");
    }
  };

  const handleStatusToggle = (id: number, currentStatus: string) => {
    const novoStatus = currentStatus === "ativo" ? "inativo" : "ativo";
    setContatos(contatos.map(c =>
      c.id === id ? { ...c, status: novoStatus as "ativo" | "inativo" | "pendente" } : c
    ));
    alert(`✅ Status alterado para ${novoStatus === "ativo" ? "Ativo" : "Inativo"}`);
  };

  const handleGenerateQr = (contato: Contato) => {
    setSelectedContato(contato);
    setShowQrModal(true);
  };

  const handleSendMessage = (contato: Contato) => {
    setSelectedContato(contato);
    setMensagem("");
    setShowMsgModal(true);
  };

  const handleSendWhatsApp = () => {
    if (selectedContato && mensagem) {
      const texto = `📢 *Valente Conecta*\n\nOlá ${selectedContato.responsavel}!\n\n${mensagem}\n\nAtenciosamente,\nEquipe Valente Conecta`;
      window.open(`https://wa.me/55${selectedContato.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(texto)}`, '_blank');
      setShowMsgModal(false);
      setMensagem("");
    }
  };

  const handleSave = () => {
    if (editingContato) {
      setContatos(contatos.map(c =>
        c.id === editingContato.id
          ? { ...c, ...formData, dataCadastro: c.dataCadastro }
          : c
      ));
      alert("✅ Loja atualizada com sucesso!");
    } else {
      const newId = Math.max(...contatos.map(c => c.id), 0) + 1;
      const novoContato: Contato = {
        id: newId,
        ...formData,
        dataCadastro: new Date().toISOString()
      };
      setContatos([...contatos, novoContato]);
      alert("✅ Loja cadastrada com sucesso!");
    }
    setShowModal(false);
    setEditingContato(null);
    setFormData({
      nome: "",
      responsavel: "",
      telefone: "",
      email: "",
      endereco: "",
      cidade: "Valente",
      categoria: "",
      status: "ativo",
      cnpj: ""
    });
  };

  const filteredContatos = contatos.filter(c => {
    const matchSearch = c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.responsavel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "todos" || c.status === filterStatus;
    const matchCidade = filterCidade === "todos" || c.cidade === filterCidade;
    return matchSearch && matchStatus && matchCidade;
  });

  const stats = {
    total: contatos.length,
    ativos: contatos.filter(c => c.status === "ativo").length,
    pendentes: contatos.filter(c => c.status === "pendente").length,
    cidades: new Set(contatos.map(c => c.cidade)).size
  };

  return (
    <div className="space-y-6">
      {/* Modal de Visualização */}
      {showViewModal && selectedContato && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">👁️ Detalhes da Loja</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-2">
              <p><strong className="text-gray-700">Nome:</strong> <span className="text-gray-600">{selectedContato.nome}</span></p>
              <p><strong className="text-gray-700">Responsável:</strong> <span className="text-gray-600">{selectedContato.responsavel}</span></p>
              <p><strong className="text-gray-700">Telefone:</strong> <span className="text-gray-600">{selectedContato.telefone}</span></p>
              <p><strong className="text-gray-700">Email:</strong> <span className="text-gray-600">{selectedContato.email}</span></p>
              <p><strong className="text-gray-700">Endereço:</strong> <span className="text-gray-600">{selectedContato.endereco}</span></p>
              <p><strong className="text-gray-700">Cidade:</strong> <span className="text-gray-600">{selectedContato.cidade}</span></p>
              <p><strong className="text-gray-700">Categoria:</strong> <span className="text-gray-600">{selectedContato.categoria}</span></p>
              <p><strong className="text-gray-700">CNPJ:</strong> <span className="text-gray-600">{selectedContato.cnpj || "Não informado"}</span></p>
              <p><strong className="text-gray-700">Status:</strong> <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(selectedContato.status)}`}>{getStatusLabel(selectedContato.status)}</span></p>
            </div>
            <button onClick={() => setShowViewModal(false)} className="w-full mt-4 bg-gray-200 text-gray-700 py-2 rounded-lg">Fechar</button>
          </div>
        </div>
      )}

      {/* Modal de QR Code */}
      {showQrModal && selectedContato && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">📱 QR Code da Loja</h3>
              <button onClick={() => setShowQrModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="bg-gray-100 p-8 rounded-xl flex items-center justify-center">
              <div className="w-48 h-48 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                <QrCode size={80} className="text-gray-800" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">QR Code para {selectedContato.nome}</p>
            <p className="text-xs text-gray-400 mt-1">Escaneie para acessar a loja</p>
            <button onClick={() => setShowQrModal(false)} className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-lg">Fechar</button>
          </div>
        </div>
      )}

      {/* Modal de Envio de Mensagem */}
      {showMsgModal && selectedContato && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">✉️ Enviar Mensagem</h3>
              <button onClick={() => setShowMsgModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-600 mb-3">Para: <strong>{selectedContato.responsavel} ({selectedContato.nome})</strong></p>
            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Digite sua mensagem aqui..."
              className="w-full p-3 border border-gray-200 rounded-lg h-32 text-gray-700 focus:ring-2 focus:ring-indigo-500"
            />
            <button onClick={handleSendWhatsApp} className="w-full mt-3 bg-green-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-700">
              <MessageCircle size={16} /> Enviar via WhatsApp
            </button>
            <button onClick={() => setShowMsgModal(false)} className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded-lg">Cancelar</button>
          </div>
        </div>
      )}

      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">
                {editingContato ? "✏️ Editar Loja" : "➕ Nova Loja"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-4 space-y-3">
              <input type="text" placeholder="Nome da loja" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="w-full p-2 border rounded-lg" />
              <input type="text" placeholder="Responsável" value={formData.responsavel} onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })} className="w-full p-2 border rounded-lg" />
              <input type="text" placeholder="Telefone" value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} className="w-full p-2 border rounded-lg" />
              <input type="email" placeholder="E-mail" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-2 border rounded-lg" />
              <input type="text" placeholder="CNPJ" value={formData.cnpj} onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })} className="w-full p-2 border rounded-lg" />
              <input type="text" placeholder="Endereço" value={formData.endereco} onChange={(e) => setFormData({ ...formData, endereco: e.target.value })} className="w-full p-2 border rounded-lg" />
              <div className="grid grid-cols-2 gap-2">
                <select value={formData.cidade} onChange={(e) => setFormData({ ...formData, cidade: e.target.value })} className="p-2 border rounded-lg">
                  {cidades.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="text" placeholder="Categoria" value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })} className="p-2 border rounded-lg" />
              </div>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full p-2 border rounded-lg">
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="pendente">Pendente</option>
              </select>
              <button onClick={handleSave} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
                <Save size={16} /> {editingContato ? "Salvar Alterações" : "Cadastrar Loja"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🏪 Contatos e Lojas</h1>
          <p className="text-sm text-gray-500">Gerencie todos os estabelecimentos cadastrados</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-green-700 transition">
            <Upload size={16} /> Importar CSV
          </button>
          <button
            onClick={() => { setEditingContato(null); setFormData({ nome: "", responsavel: "", telefone: "", email: "", endereco: "", cidade: "Valente", categoria: "", status: "ativo", cnpj: "" }); setShowModal(true); }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-indigo-700 transition"
          >
            <Plus size={16} /> Nova Loja
          </button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-500">Total de Lojas</p><p className="text-2xl font-bold text-gray-800">{stats.total}</p></div>
            <div className="bg-blue-100 p-2 rounded-full"><Store size={20} className="text-blue-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-500">Lojas Ativas</p><p className="text-2xl font-bold text-green-600">{stats.ativos}</p></div>
            <div className="bg-green-100 p-2 rounded-full"><CheckCircle size={20} className="text-green-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-500">Pendentes</p><p className="text-2xl font-bold text-yellow-600">{stats.pendentes}</p></div>
            <div className="bg-yellow-100 p-2 rounded-full"><XCircle size={20} className="text-yellow-600" /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div><p className="text-xs text-gray-500">Cidades</p><p className="text-2xl font-bold text-purple-600">{stats.cidades}</p></div>
            <div className="bg-purple-100 p-2 rounded-full"><MapPin size={20} className="text-purple-600" /></div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar loja ou responsável..." className="w-full pl-9 p-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="p-2 border border-gray-200 rounded-lg text-sm bg-white">
            <option value="todos">Todos os status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="pendente">Pendente</option>
          </select>
          <select value={filterCidade} onChange={(e) => setFilterCidade(e.target.value)} className="p-2 border border-gray-200 rounded-lg text-sm bg-white">
            <option value="todos">Todas as cidades</option>
            {cidades.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Tabela de Contatos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-3 text-left text-xs font-semibold text-gray-600">Loja</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600">Responsável</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600">Contato</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600">Cidade</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600">Status</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredContatos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">Nenhuma loja encontrada</td>
                </tr>
              ) : (
                filteredContatos.map((contato) => (
                  <tr key={contato.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="p-3">
                      <div>
                        <p className="font-medium text-gray-800">{contato.nome}</p>
                        <p className="text-xs text-gray-400">{contato.categoria}</p>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-700">{contato.responsavel}</td>
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-700">{contato.telefone}</span>
                        <span className="text-xs text-gray-400">{contato.email}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-700">{contato.cidade}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(contato.status)} cursor-pointer`} onClick={() => handleStatusToggle(contato.id, contato.status)}>
                        {getStatusLabel(contato.status)}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleView(contato)} className="text-blue-500 hover:text-blue-700" title="Visualizar"><Eye size={16} /></button>
                        <button onClick={() => handleEdit(contato)} className="text-gray-500 hover:text-gray-700" title="Editar"><Edit size={16} /></button>
                        <button onClick={() => handleGenerateQr(contato)} className="text-green-500 hover:text-green-700" title="Gerar QR Code"><QrCode size={16} /></button>
                        <button onClick={() => handleSendMessage(contato)} className="text-indigo-500 hover:text-indigo-700" title="Enviar Mensagem"><MessageCircle size={16} /></button>
                        <button onClick={() => handleDelete(contato.id)} className="text-red-500 hover:text-red-700" title="Excluir"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}