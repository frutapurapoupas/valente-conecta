"use client";

import { Building, CheckCircle, MapPin, Plus, Users, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Cidade {
  id: number;
  nome: string;
  estado: string;
  usuarios: number;
  academias: number;
  empresas: number;
  dataAdicao: string;
}

export default function AdminUsuariosCidadesPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [novaCidade, setNovaCidade] = useState({ nome: "", estado: "BA" });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    const storedUsuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const storedEmpresas = JSON.parse(localStorage.getItem('empresas') || '[]');
    const storedCidades = JSON.parse(localStorage.getItem('cidades_adicionadas') || '[]');

    setUsuarios(storedUsuarios);
    setEmpresas(storedEmpresas);

    // Processar cidades existentes
    const usuariosPorCidade = new Map<string, number>();
    const empresasPorCidade = new Map<string, number>();

    storedUsuarios.forEach((u: any) => {
      const cidade = u.cidade || 'Valente';
      usuariosPorCidade.set(cidade, (usuariosPorCidade.get(cidade) || 0) + 1);
    });

    storedEmpresas.forEach((e: any) => {
      const cidade = e.cidade || 'Valente';
      empresasPorCidade.set(cidade, (empresasPorCidade.get(cidade) || 0) + 1);
    });

    // Combinar com cidades já cadastradas
    const todasCidades = new Map<string, Cidade>();

    storedCidades.forEach((c: any) => {
      todasCidades.set(c.nome, {
        id: c.id,
        nome: c.nome,
        estado: c.estado,
        usuarios: usuariosPorCidade.get(c.nome) || 0,
        academias: c.academias || 0,
        empresas: empresasPorCidade.get(c.nome) || 0,
        dataAdicao: c.dataAdicao || new Date().toISOString()
      });
    });

    // Adicionar cidades que têm usuários mas não estão cadastradas
    usuariosPorCidade.forEach((qtde, cidade) => {
      if (!todasCidades.has(cidade)) {
        todasCidades.set(cidade, {
          id: Date.now(),
          nome: cidade,
          estado: "BA",
          usuarios: qtde,
          academias: 0,
          empresas: empresasPorCidade.get(cidade) || 0,
          dataAdicao: new Date().toISOString()
        });
      }
    });

    setCidades(Array.from(todasCidades.values()).sort((a, b) => b.usuarios - a.usuarios));
  };

  const handleAddCidade = () => {
    if (!novaCidade.nome.trim()) {
      alert("Digite o nome da cidade!");
      return;
    }

    const nova: Cidade = {
      id: Date.now(),
      nome: novaCidade.nome,
      estado: novaCidade.estado,
      usuarios: 0,
      academias: 0,
      empresas: 0,
      dataAdicao: new Date().toISOString()
    };

    const updated = [...cidades, nova];
    setCidades(updated);

    const existing = JSON.parse(localStorage.getItem('cidades_adicionadas') || '[]');
    existing.push(nova);
    localStorage.setItem('cidades_adicionadas', JSON.stringify(existing));

    setShowAddModal(false);
    setNovaCidade({ nome: "", estado: "BA" });
    alert(`✅ Cidade "${nova.nome}" adicionada com sucesso!`);
  };

  const stats = {
    totalCidades: cidades.length,
    totalUsuarios: usuarios.length,
    totalEmpresas: empresas.length,
    cidadesComUsuarios: cidades.filter(c => c.usuarios > 0).length
  };

  return (
    <div className="space-y-6">
      {/* Modal para adicionar cidade */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Adicionar Cidade</h3>
              <button onClick={() => setShowAddModal(false)}><X size={20} className="text-gray-500" /></button>
            </div>
            <div className="space-y-3">
              <input type="text" value={novaCidade.nome} onChange={(e) => setNovaCidade({ ...novaCidade, nome: e.target.value })} placeholder="Nome da cidade" className="w-full p-2 border rounded-lg text-gray-800" />
              <input type="text" value={novaCidade.estado} onChange={(e) => setNovaCidade({ ...novaCidade, estado: e.target.value })} placeholder="Estado (ex: BA)" className="w-full p-2 border rounded-lg text-gray-800" />
              <button onClick={handleAddCidade} className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold">Adicionar</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-gray-800">📍 Usuários por Cidade</h1><p className="text-gray-500 text-sm">Distribuição geográfica dos usuários</p></div>
        <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"><Plus size={16} /> Nova Cidade</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3 shadow-sm text-center"><div className="text-2xl font-bold text-indigo-600">{stats.totalCidades}</div><div className="text-sm text-gray-500">Cidades</div></div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center"><div className="text-2xl font-bold text-blue-600">{stats.totalUsuarios}</div><div className="text-sm text-gray-500">Usuários</div></div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center"><div className="text-2xl font-bold text-purple-600">{stats.totalEmpresas}</div><div className="text-sm text-gray-500">Empresas</div></div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center"><div className="text-2xl font-bold text-green-600">{stats.cidadesComUsuarios}</div><div className="text-sm text-gray-500">Cidades ativas</div></div>
      </div>

      {/* Cards de cidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cidades.map(cidade => (
          <div key={cidade.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin size={18} />
                  <h3 className="font-bold text-lg">{cidade.nome}</h3>
                  <span className="text-sm bg-white/20 px-2 py-0.5 rounded-full">{cidade.estado}</span>
                </div>
                {cidade.usuarios > 0 && <CheckCircle size={16} className="text-green-300" />}
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <Users size={20} className="mx-auto text-blue-500 mb-1" />
                  <p className="text-2xl font-bold text-gray-800">{cidade.usuarios}</p>
                  <p className="text-sm text-gray-500">Usuários</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <Building size={20} className="mx-auto text-purple-500 mb-1" />
                  <p className="text-2xl font-bold text-gray-800">{cidade.empresas}</p>
                  <p className="text-sm text-gray-500">Empresas</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(100, (cidade.usuarios / stats.totalUsuarios) * 100)}%` }}></div>
              </div>
              <p className="text-sm text-gray-500 text-center mt-2">Adicionada em {new Date(cidade.dataAdicao).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>

      {cidades.length === 0 && (
        <div className="bg-white rounded-xl p-8 text-center">
          <MapPin size={48} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500">Nenhuma cidade cadastrada</p>
          <button onClick={() => setShowAddModal(true)} className="mt-2 text-indigo-600 text-sm">Adicionar primeira cidade</button>
        </div>
      )}
    </div>
  );
}

