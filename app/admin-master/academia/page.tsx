"use client";

import { useState, useEffect } from "react";
import { 
  Dumbbell, Users, TrendingUp, Calendar, Clock, 
  Award, Target, Activity, Plus, Edit, Trash2,
  Eye, CheckCircle, XCircle, Search, Filter,
  MapPin, Globe, Building, Shield, Crown
} from "lucide-react";

interface Academia {
  id: number;
  nome: string;
  cidade: string;
  endereco: string;
  whatsapp: string;
  responsavel: string;
  alunos: number;
  planos: number;
  status: "ativo" | "pendente" | "inativo";
  dataCadastro: string;
}

interface Cidade {
  id: number;
  nome: string;
  estado: string;
  academias: number;
  usuarios: number;
  ativa: boolean;
}

export default function AdminMasterAcademiaPage() {
  const [academias, setAcademias] = useState<Academia[]>([
    { id: 1, nome: "Academia Fit Center", cidade: "Valente", endereco: "Av. Principal, 100", whatsapp: "75912345678", responsavel: "Carlos Silva", alunos: 128, planos: 3, status: "ativo", dataCadastro: "2024-01-15" },
    { id: 2, nome: "Studio Body", cidade: "Rafael Jambeiro", endereco: "Rua da Saúde, 45", whatsapp: "75912345679", responsavel: "Ana Paula", alunos: 89, planos: 2, status: "ativo", dataCadastro: "2024-02-20" },
    { id: 3, nome: "Power Gym", cidade: "Santa Bárbara", endereco: "Praça da Matriz, 12", whatsapp: "75912345680", responsavel: "Roberto Mendes", alunos: 45, planos: 1, status: "pendente", dataCadastro: "2024-03-10" },
  ]);

  const [cidades, setCidades] = useState<Cidade[]>([
    { id: 1, nome: "Valente", estado: "BA", academias: 1, usuarios: 78, ativa: true },
    { id: 2, nome: "Rafael Jambeiro", estado: "BA", academias: 1, usuarios: 23, ativa: true },
    { id: 3, nome: "Santa Bárbara", estado: "BA", academias: 1, usuarios: 12, ativa: true },
    { id: 4, nome: "Santaluz", estado: "BA", academias: 0, usuarios: 8, ativa: true },
  ]);

  const [showCidadeModal, setShowCidadeModal] = useState(false);
  const [novaCidade, setNovaCidade] = useState({ nome: "", estado: "BA" });
  const [showAcademiaModal, setShowAcademiaModal] = useState(false);
  const [novaAcademia, setNovaAcademia] = useState({
    nome: "", cidade: "", endereco: "", whatsapp: "", responsavel: ""
  });
  const [selectedCidade, setSelectedCidade] = useState("todas");
  const [searchTerm, setSearchTerm] = useState("");

  // Carregar cidades do localStorage (cidades adicionadas manualmente)
  useEffect(() => {
    const stored = localStorage.getItem('cidades_adicionadas');
    if (stored) {
      const cidadesAdicionadas = JSON.parse(stored);
      setCidades(prev => [...prev, ...cidadesAdicionadas]);
    }
  }, []);

  const handleAddCidade = () => {
    if (!novaCidade.nome.trim()) {
      alert("Digite o nome da cidade!");
      return;
    }

    const nova: Cidade = {
      id: Date.now(),
      nome: novaCidade.nome,
      estado: novaCidade.estado,
      academias: 0,
      usuarios: 0,
      ativa: true
    };

    const updated = [...cidades, nova];
    setCidades(updated);
    
    // Salvar no localStorage para persistir
    const existing = JSON.parse(localStorage.getItem('cidades_adicionadas') || '[]');
    existing.push(nova);
    localStorage.setItem('cidades_adicionadas', JSON.stringify(existing));
    
    setShowCidadeModal(false);
    setNovaCidade({ nome: "", estado: "BA" });
    alert(`✅ Cidade "${nova.nome}" adicionada com sucesso!`);
  };

  const handleAddAcademia = () => {
    if (!novaAcademia.nome || !novaAcademia.cidade) {
      alert("Preencha nome e cidade!");
      return;
    }

    const nova: Academia = {
      id: Date.now(),
      nome: novaAcademia.nome,
      cidade: novaAcademia.cidade,
      endereco: novaAcademia.endereco,
      whatsapp: novaAcademia.whatsapp,
      responsavel: novaAcademia.responsavel,
      alunos: 0,
      planos: 1,
      status: "pendente",
      dataCadastro: new Date().toISOString().split('T')[0]
    };

    setAcademias([...academias, nova]);
    setShowAcademiaModal(false);
    setNovaAcademia({ nome: "", cidade: "", endereco: "", whatsapp: "", responsavel: "" });
    alert(`✅ Academia "${nova.nome}" adicionada com sucesso!`);
  };

  const updateStatus = (id: number, novoStatus: "ativo" | "pendente" | "inativo") => {
    setAcademias(academias.map(a => a.id === id ? { ...a, status: novoStatus } : a));
    alert(`Status da academia atualizado para ${novoStatus}`);
  };

  const filteredAcademias = academias.filter(a => {
    const matchSearch = a.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        a.cidade.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCity = selectedCidade === "todas" || a.cidade === selectedCidade;
    return matchSearch && matchCity;
  });

  const stats = {
    total: academias.length,
    ativas: academias.filter(a => a.status === "ativo").length,
    pendentes: academias.filter(a => a.status === "pendente").length,
    totalAlunos: academias.reduce((acc, a) => acc + a.alunos, 0),
    cidadesAtivas: cidades.filter(c => c.ativa).length
  };

  return (
    <div className="space-y-6">
      {/* Modais */}
      {showCidadeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Adicionar Nova Cidade</h3>
            <div className="space-y-3">
              <input type="text" value={novaCidade.nome} onChange={(e) => setNovaCidade({...novaCidade, nome: e.target.value})} placeholder="Nome da cidade" className="w-full p-2 border rounded-lg" />
              <input type="text" value={novaCidade.estado} onChange={(e) => setNovaCidade({...novaCidade, estado: e.target.value})} placeholder="Estado (ex: BA)" className="w-full p-2 border rounded-lg" />
              <button onClick={handleAddCidade} className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold">Adicionar Cidade</button>
              <button onClick={() => setShowCidadeModal(false)} className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showAcademiaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Adicionar Nova Academia</h3>
            <div className="space-y-3">
              <input type="text" value={novaAcademia.nome} onChange={(e) => setNovaAcademia({...novaAcademia, nome: e.target.value})} placeholder="Nome da academia" className="w-full p-2 border rounded-lg" />
              <select value={novaAcademia.cidade} onChange={(e) => setNovaAcademia({...novaAcademia, cidade: e.target.value})} className="w-full p-2 border rounded-lg">
                <option value="">Selecione a cidade</option>
                {cidades.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
              </select>
              <input type="text" value={novaAcademia.endereco} onChange={(e) => setNovaAcademia({...novaAcademia, endereco: e.target.value})} placeholder="Endereço" className="w-full p-2 border rounded-lg" />
              <input type="tel" value={novaAcademia.whatsapp} onChange={(e) => setNovaAcademia({...novaAcademia, whatsapp: e.target.value})} placeholder="WhatsApp" className="w-full p-2 border rounded-lg" />
              <input type="text" value={novaAcademia.responsavel} onChange={(e) => setNovaAcademia({...novaAcademia, responsavel: e.target.value})} placeholder="Responsável" className="w-full p-2 border rounded-lg" />
              <button onClick={handleAddAcademia} className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold">Adicionar Academia</button>
              <button onClick={() => setShowAcademiaModal(false)} className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Dumbbell size={28} /> Controle de Academias</h1>
        <p className="text-gray-500 text-sm">Gerencie academias por cidade e acompanhe métricas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl p-3 shadow-sm text-center"><div className="text-2xl font-bold text-indigo-600">{stats.total}</div><div className="text-xs text-gray-500">Academias</div></div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center"><div className="text-2xl font-bold text-green-600">{stats.ativas}</div><div className="text-xs text-gray-500">Ativas</div></div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center"><div className="text-2xl font-bold text-yellow-600">{stats.pendentes}</div><div className="text-xs text-gray-500">Pendentes</div></div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center"><div className="text-2xl font-bold text-blue-600">{stats.totalAlunos}</div><div className="text-xs text-gray-500">Alunos</div></div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center"><div className="text-2xl font-bold text-purple-600">{stats.cidadesAtivas}</div><div className="text-xs text-gray-500">Cidades</div></div>
      </div>

      {/* Botões de ação */}
      <div className="flex gap-3">
        <button onClick={() => setShowAcademiaModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"><Plus size={16} /> Nova Academia</button>
        <button onClick={() => setShowCidadeModal(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"><Globe size={16} /> Nova Cidade</button>
      </div>

      {/* Cidades cadastradas */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><MapPin size={18} /> Cidades Atendidas</h3>
        <div className="flex flex-wrap gap-2">
          {cidades.filter(c => c.ativa).map(cidade => (
            <div key={cidade.id} className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-1">
              <MapPin size={12} /> {cidade.nome} - {cidade.estado}
              <span className="text-xs text-gray-500 ml-1">({cidade.academias} academias)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar academia..." className="w-full pl-9 p-2 border rounded-lg" />
        </div>
        <select value={selectedCidade} onChange={(e) => setSelectedCidade(e.target.value)} className="p-2 border rounded-lg bg-white">
          <option value="todas">Todas as cidades</option>
          {cidades.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
        </select>
      </div>

      {/* Lista de Academias */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 text-xs font-semibold text-gray-500">Academia</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-500">Cidade</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-500">Alunos</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-500">Responsável</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-500">Status</th>
                <th className="text-left p-3 text-xs font-semibold text-gray-500">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredAcademias.map(academia => (
                <tr key={academia.id} className="border-b hover:bg-gray-50">
                  <td className="p-3"><span className="font-medium">{academia.nome}</span></td>
                  <td className="p-3 text-sm">{academia.cidade}</td>
                  <td className="p-3 text-sm">{academia.alunos}</td>
                  <td className="p-3 text-sm">{academia.responsavel}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      academia.status === 'ativo' ? 'bg-green-100 text-green-700' :
                      academia.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {academia.status === 'ativo' ? 'Ativo' : academia.status === 'pendente' ? 'Pendente' : 'Inativo'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {academia.status === 'pendente' && <button onClick={() => updateStatus(academia.id, 'ativo')} className="text-green-600 hover:text-green-800"><CheckCircle size={16} /></button>}
                      {academia.status === 'ativo' && <button onClick={() => updateStatus(academia.id, 'inativo')} className="text-red-600 hover:text-red-800"><XCircle size={16} /></button>}
                      <button className="text-blue-600 hover:text-blue-800"><Eye size={16} /></button>
                      <button className="text-gray-600 hover:text-gray-800"><Edit size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}