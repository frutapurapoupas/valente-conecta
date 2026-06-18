// app/admin-master/configuracoes/page.tsx
"use client";

import {
  AlertCircle, CheckCircle,
  Edit,
  Plus,
  Power,
  Save,
  Store,
  Trash2,
  TrendingDown,
  X
} from "lucide-react";
import { useEffect, useState } from "react";

interface ConfiguracoesRevendedor {
  descontoPercentual: number;
  loteMinimoMarmitas: number;
  loteMinimoDoces: number;
  ativo: boolean;
  permitePedidoPersonalizado: boolean;
}

interface RevendedorCadastrado {
  id: number;
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  ativo: boolean;  // PROPRIEDADE ATIVO ADICIONADA
  dataCadastro: string;
}

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<ConfiguracoesRevendedor>({
    descontoPercentual: 30,
    loteMinimoMarmitas: 10,
    loteMinimoDoces: 5,
    ativo: true,
    permitePedidoPersonalizado: false
  });

  const [revendedores, setRevendedores] = useState<RevendedorCadastrado[]>([]);
  const [showModalRevendedor, setShowModalRevendedor] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editandoRevendedor, setEditandoRevendedor] = useState<RevendedorCadastrado | null>(null);
  const [novoRevendedor, setNovoRevendedor] = useState({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
    endereco: ""
  });
  const [salvando, setSalvando] = useState(false);
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  const [filtroAtivo, setFiltroAtivo] = useState<"todos" | "ativos" | "inativos">("todos");

  useEffect(() => {
    // Carregar configurações
    const storedConfig = localStorage.getItem("config_revendedor");
    if (storedConfig) {
      setConfig(JSON.parse(storedConfig));
    }

    // Carregar revendedores cadastrados
    const storedRevendedores = localStorage.getItem("revendedores_cadastrados");
    if (storedRevendedores) {
      setRevendedores(JSON.parse(storedRevendedores));
    } else {
      // Revendedores de exemplo com propriedade ativo
      const revendedoresExemplo: RevendedorCadastrado[] = [
        {
          id: 1,
          nome: "Cantina da Escola",
          cnpj: "12.345.678/0001-90",
          telefone: "(75) 98888-1111",
          email: "cantina@escola.com",
          endereco: "Rua da Escola, 123",
          ativo: true,
          dataCadastro: new Date().toLocaleDateString()
        },
        {
          id: 2,
          nome: "Mercado do João",
          cnpj: "98.765.432/0001-21",
          telefone: "(75) 97777-2222",
          email: "mercado@joao.com",
          endereco: "Av. Central, 456",
          ativo: true,
          dataCadastro: new Date().toLocaleDateString()
        },
        {
          id: 3,
          nome: "Padaria do Centro",
          cnpj: "45.678.901/0001-32",
          telefone: "(75) 96666-3333",
          email: "padaria@centro.com",
          endereco: "Praça Central, 789",
          ativo: false,
          dataCadastro: new Date().toLocaleDateString()
        }
      ];
      setRevendedores(revendedoresExemplo);
      localStorage.setItem("revendedores_cadastrados", JSON.stringify(revendedoresExemplo));
    }
  }, []);

  const salvarConfiguracoes = () => {
    setSalvando(true);
    localStorage.setItem("config_revendedor", JSON.stringify(config));

    setTimeout(() => {
      setSalvando(false);
      setShowConfirmacao(true);
      setTimeout(() => setShowConfirmacao(false), 3000);
    }, 500);
  };

  const adicionarRevendedor = () => {
    if (!novoRevendedor.nome || !novoRevendedor.cnpj || !novoRevendedor.telefone) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    const novo: RevendedorCadastrado = {
      id: Date.now(),
      ...novoRevendedor,
      ativo: true,
      dataCadastro: new Date().toLocaleDateString()
    };

    const novosRevendedores = [...revendedores, novo];
    setRevendedores(novosRevendedores);
    localStorage.setItem("revendedores_cadastrados", JSON.stringify(novosRevendedores));
    setNovoRevendedor({ nome: "", cnpj: "", telefone: "", email: "", endereco: "" });
    setShowModalRevendedor(false);
    alert("✅ Revendedor cadastrado com sucesso!");
  };

  const editarRevendedor = () => {
    if (editandoRevendedor && editandoRevendedor.nome) {
      const novosRevendedores = revendedores.map(r =>
        r.id === editandoRevendedor.id ? editandoRevendedor : r
      );
      setRevendedores(novosRevendedores);
      localStorage.setItem("revendedores_cadastrados", JSON.stringify(novosRevendedores));
      setShowEditModal(false);
      setEditandoRevendedor(null);
      alert("✅ Revendedor atualizado com sucesso!");
    }
  };

  const toggleAtivoRevendedor = (id: number) => {
    const novos = revendedores.map(r =>
      r.id === id ? { ...r, ativo: !r.ativo } : r
    );
    setRevendedores(novos);
    localStorage.setItem("revendedores_cadastrados", JSON.stringify(novos));

    const revendedor = revendedores.find(r => r.id === id);
    alert(`✅ Revendedor ${revendedor?.nome} ${!revendedor?.ativo ? "ativado" : "desativado"} com sucesso!`);
  };

  const removerRevendedor = (id: number) => {
    const revendedor = revendedores.find(r => r.id === id);
    if (confirm(`Remover revendedor "${revendedor?.nome}" permanentemente?`)) {
      const novos = revendedores.filter(r => r.id !== id);
      setRevendedores(novos);
      localStorage.setItem("revendedores_cadastrados", JSON.stringify(novos));
      alert("✅ Revendedor removido com sucesso!");
    }
  };

  const revendedoresFiltrados = revendedores.filter(r => {
    if (filtroAtivo === "ativos") return r.ativo === true;
    if (filtroAtivo === "inativos") return r.ativo === false;
    return true;
  });

  const totalAtivos = revendedores.filter(r => r.ativo).length;
  const totalInativos = revendedores.filter(r => !r.ativo).length;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">⚙️ Configurações do Sistema</h1>
            <p className="text-sm text-gray-500">Configure as regras para parceiros revendedores</p>
          </div>
          <button
            onClick={salvarConfiguracoes}
            disabled={salvando}
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 disabled:opacity-50"
          >
            {salvando ? <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" /> : <Save size={18} />}
            {salvando ? "Salvando..." : "Salvar Configurações"}
          </button>
        </div>

        {showConfirmacao && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3 animate-bounce">
            <CheckCircle size={20} className="text-green-600" />
            <span className="text-green-800">Configurações salvas com sucesso!</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configurações de Desconto */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown size={24} className="text-green-600" />
              <h2 className="text-lg font-bold text-gray-800">Configurações de Desconto</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Desconto para Revendedores (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={config.descontoPercentual}
                    onChange={(e) => setConfig({ ...config, descontoPercentual: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="w-12 text-center font-bold text-green-600">{config.descontoPercentual}%</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Valor aplicado sobre o preço normal do cardápio</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lote Mínimo - Marmitas
                </label>
                <input
                  type="number"
                  min="1"
                  value={config.loteMinimoMarmitas}
                  onChange={(e) => setConfig({ ...config, loteMinimoMarmitas: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded-lg"
                />
                <p className="text-xs text-gray-400 mt-1">Quantidade mínima por pedido para marmitas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lote Mínimo - Doces/Bolos
                </label>
                <input
                  type="number"
                  min="1"
                  value={config.loteMinimoDoces}
                  onChange={(e) => setConfig({ ...config, loteMinimoDoces: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded-lg"
                />
                <p className="text-xs text-gray-400 mt-1">Quantidade mínima por pedido para doces e bolos</p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  checked={config.ativo}
                  onChange={(e) => setConfig({ ...config, ativo: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm text-gray-700">Habilitar compra para revendedores</label>
              </div>
            </div>
          </div>

          {/* Lista de Revendedores Cadastrados */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Store size={24} className="text-orange-600" />
                <h2 className="text-lg font-bold text-gray-800">Revendedores Autorizados</h2>
              </div>
              <div className="flex gap-2">
                <select
                  value={filtroAtivo}
                  onChange={(e) => setFiltroAtivo(e.target.value as any)}
                  className="text-sm border rounded-lg px-2 py-1"
                >
                  <option value="todos">Todos ({revendedores.length})</option>
                  <option value="ativos">Ativos ({totalAtivos})</option>
                  <option value="inativos">Inativos ({totalInativos})</option>
                </select>
                <button
                  onClick={() => setShowModalRevendedor(true)}
                  className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 hover:bg-blue-600"
                >
                  <Plus size={14} /> Adicionar
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {revendedoresFiltrados.map(rev => (
                <div key={rev.id} className={`border rounded-lg p-3 transition ${!rev.ativo ? "bg-gray-50 opacity-70" : ""}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-800">{rev.nome}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${rev.ativo ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                          {rev.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">CNPJ: {rev.cnpj}</p>
                      <p className="text-xs text-gray-500">Telefone: {rev.telefone}</p>
                      {rev.email && <p className="text-xs text-gray-500">Email: {rev.email}</p>}
                      {rev.endereco && <p className="text-xs text-gray-500">Endereço: {rev.endereco}</p>}
                      <p className="text-xs text-gray-400 mt-1">Cadastro: {rev.dataCadastro}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleAtivoRevendedor(rev.id)}
                        className={`p-1 rounded ${rev.ativo ? "text-green-500 hover:text-green-700" : "text-gray-400 hover:text-gray-600"}`}
                        title={rev.ativo ? "Desativar" : "Ativar"}
                      >
                        <Power size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEditandoRevendedor(rev);
                          setShowEditModal(true);
                        }}
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => removerRevendedor(rev.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remover"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {revendedoresFiltrados.length === 0 && (
                <div className="text-center py-8">
                  <Store size={40} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">Nenhum revendedor cadastrado</p>
                  <button
                    onClick={() => setShowModalRevendedor(true)}
                    className="mt-3 text-blue-500 text-sm hover:underline"
                  >
                    + Adicionar revendedor
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="mt-6 bg-blue-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={18} className="text-blue-600" />
            <h3 className="font-medium text-blue-800">Informações importantes</h3>
          </div>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Os revendedores cadastrados podem acessar a área exclusiva com CNPJ e telefone</li>
            <li>O desconto é aplicado automaticamente sobre o valor do cardápio</li>
            <li>Pedidos abaixo do lote mínimo não serão permitidos</li>
            <li>Para ser revendedor, é necessário CNPJ e cadastro prévio</li>
            <li>Revendedores inativos não conseguem fazer login</li>
            <li>As configurações de desconto afetam todos os revendedores igualmente</li>
          </ul>
        </div>

        {/* Resumo rápido */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-xs text-gray-500">Desconto Atual</p>
            <p className="text-xl font-bold text-green-600">{config.descontoPercentual}%</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-xs text-gray-500">Revendedores Ativos</p>
            <p className="text-xl font-bold text-blue-600">{totalAtivos}</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-xs text-gray-500">Lote Mínimo Marmitas</p>
            <p className="text-xl font-bold text-orange-600">{config.loteMinimoMarmitas} un</p>
          </div>
        </div>
      </div>

      {/* Modal Adicionar Revendedor */}
      {showModalRevendedor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Store size={20} /> Novo Revendedor
              </h3>
              <button onClick={() => setShowModalRevendedor(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome do estabelecimento *"
                value={novoRevendedor.nome}
                onChange={(e) => setNovoRevendedor({ ...novoRevendedor, nome: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="CNPJ *"
                value={novoRevendedor.cnpj}
                onChange={(e) => setNovoRevendedor({ ...novoRevendedor, cnpj: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="tel"
                placeholder="Telefone *"
                value={novoRevendedor.telefone}
                onChange={(e) => setNovoRevendedor({ ...novoRevendedor, telefone: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="email"
                placeholder="E-mail"
                value={novoRevendedor.email}
                onChange={(e) => setNovoRevendedor({ ...novoRevendedor, email: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Endereço"
                value={novoRevendedor.endereco}
                onChange={(e) => setNovoRevendedor({ ...novoRevendedor, endereco: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
              <button
                onClick={adicionarRevendedor}
                className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600"
              >
                Cadastrar Revendedor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Revendedor */}
      {showEditModal && editandoRevendedor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Edit size={20} /> Editar Revendedor
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome do estabelecimento"
                value={editandoRevendedor.nome}
                onChange={(e) => setEditandoRevendedor({ ...editandoRevendedor, nome: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="CNPJ"
                value={editandoRevendedor.cnpj}
                onChange={(e) => setEditandoRevendedor({ ...editandoRevendedor, cnpj: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="tel"
                placeholder="Telefone"
                value={editandoRevendedor.telefone}
                onChange={(e) => setEditandoRevendedor({ ...editandoRevendedor, telefone: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="email"
                placeholder="E-mail"
                value={editandoRevendedor.email}
                onChange={(e) => setEditandoRevendedor({ ...editandoRevendedor, email: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Endereço"
                value={editandoRevendedor.endereco}
                onChange={(e) => setEditandoRevendedor({ ...editandoRevendedor, endereco: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  checked={editandoRevendedor.ativo}
                  onChange={(e) => setEditandoRevendedor({ ...editandoRevendedor, ativo: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm text-gray-700">Revendedor ativo (pode fazer login)</label>
              </div>
              <button
                onClick={editarRevendedor}
                className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}