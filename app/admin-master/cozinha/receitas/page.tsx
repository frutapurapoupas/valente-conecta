"use client";

import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ItemReceita {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
}

interface Prato {
  id: number;
  name: string;
  price: number;
  partnerPrice: number;
  description: string;
  time: string;
  popular: boolean;
  image: string;
}

interface Receita {
  id: number;
  pratoId: number;
  pratoNome: string;
  itens: ItemReceita[];
}

export default function GerenciarReceitasPage() {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedPrato, setSelectedPrato] = useState<number | null>(null);
  const [showNovoPratoModal, setShowNovoPratoModal] = useState(false);
  const [novoPratoNome, setNovoPratoNome] = useState("");
  const [novoPratoPreco, setNovoPratoPreco] = useState(0);
  const [novoPratoDescricao, setNovoPratoDescricao] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [novoItem, setNovoItem] = useState({ nome: "", quantidade: 0, unidade: "kg" });
  const [itensReceita, setItensReceita] = useState<ItemReceita[]>([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    const storedPratos = localStorage.getItem("cozinha_cardapio");
    if (storedPratos) {
      setPratos(JSON.parse(storedPratos));
    } else {
      const pratosIniciais: Prato[] = [
        { id: 1, name: "Frango com Quiabo", price: 12, partnerPrice: 10, description: "Frango com quiabo, vinagrete, arroz e feijão", time: "20-30min", popular: true, image: "/cozinha/frango-quiabo.jpg" },
        { id: 2, name: "Strogonoff", price: 12, partnerPrice: 10, description: "Strogonoff de frango, arroz e batata palha", time: "20-25min", popular: true, image: "/cozinha/strogonoff.jpg" }
      ];
      setPratos(pratosIniciais);
      localStorage.setItem("cozinha_cardapio", JSON.stringify(pratosIniciais));
    }

    const storedReceitas = localStorage.getItem("cozinha_receitas");
    if (storedReceitas) {
      setReceitas(JSON.parse(storedReceitas));
    }
  };

  const salvarPratos = (novosPratos: Prato[]) => {
    setPratos(novosPratos);
    localStorage.setItem("cozinha_cardapio", JSON.stringify(novosPratos));
  };

  const salvarReceitas = (novas: Receita[]) => {
    setReceitas(novas);
    localStorage.setItem("cozinha_receitas", JSON.stringify(novas));
  };

  const adicionarNovoPrato = () => {
    if (!novoPratoNome.trim()) {
      alert("Digite o nome do prato!");
      return;
    }
    if (novoPratoPreco <= 0) {
      alert("Digite um preço válido!");
      return;
    }

    const novoId = Math.max(...pratos.map(p => p.id), 0) + 1;
    const novoPrato: Prato = {
      id: novoId,
      name: novoPratoNome,
      price: novoPratoPreco,
      partnerPrice: novoPratoPreco * 0.8,
      description: novoPratoDescricao || "Delicioso prato caseiro",
      time: "20-30min",
      popular: false,
      image: "/cozinha/default.jpg"
    };

    const novosPratos = [...pratos, novoPrato];
    salvarPratos(novosPratos);
    setSelectedPrato(novoId);
    setShowNovoPratoModal(false);
    setNovoPratoNome("");
    setNovoPratoPreco(0);
    setNovoPratoDescricao("");
    alert(`✅ Prato "${novoPratoNome}" adicionado! Agora adicione os ingredientes.`);
  };

  const adicionarItem = () => {
    if (!novoItem.nome || novoItem.quantidade <= 0) {
      alert("Preencha nome e quantidade!");
      return;
    }
    setItensReceita([...itensReceita, { ...novoItem, id: Date.now().toString() }]);
    setNovoItem({ nome: "", quantidade: 0, unidade: "kg" });
  };

  const removerItem = (id: string) => {
    setItensReceita(itensReceita.filter(i => i.id !== id));
  };

  const handleSave = () => {
    if (!selectedPrato) {
      alert("Selecione um prato!");
      return;
    }
    if (itensReceita.length === 0) {
      alert("Adicione pelo menos um ingrediente!");
      return;
    }

    const prato = pratos.find(p => p.id === selectedPrato);
    const novaReceita: Receita = {
      id: editingId || Date.now(),
      pratoId: selectedPrato,
      pratoNome: prato?.name || "Prato",
      itens: itensReceita
    };

    let novas: Receita[];
    if (editingId) {
      novas = receitas.map(r => r.id === editingId ? novaReceita : r);
    } else {
      novas = [...receitas, novaReceita];
    }
    salvarReceitas(novas);
    closeModal();
    alert("✅ Receita salva!");
  };

  const excluirPrato = (id: number, nome: string) => {
    if (confirm(`Excluir o prato "${nome}"?\nIsso também removerá todas as receitas associadas.`)) {
      const novosPratos = pratos.filter(p => p.id !== id);
      const novasReceitas = receitas.filter(r => r.pratoId !== id);
      salvarPratos(novosPratos);
      salvarReceitas(novasReceitas);
      alert(`✅ Prato "${nome}" excluído!`);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setSelectedPrato(null);
    setItensReceita([]);
  };

  const openEditModal = (receita: Receita) => {
    setEditingId(receita.id);
    setSelectedPrato(receita.pratoId);
    setItensReceita(receita.itens);
    setShowModal(true);
  };

  const pratosFiltrados = pratos.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Modal Nova Receita */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Nova Receita</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Selecione o prato *</label>
              <div className="flex gap-2">
                <select
                  value={selectedPrato || ""}
                  onChange={(e) => setSelectedPrato(parseInt(e.target.value))}
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-gray-800 bg-white"
                >
                  <option value="">Selecione um prato</option>
                  {pratos.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <button
                  onClick={() => setShowNovoPratoModal(true)}
                  className="bg-green-600 text-white px-3 rounded-lg hover:bg-green-700 flex items-center gap-1"
                >
                  <Plus size={16} /> Novo
                </button>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ingredientes</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={novoItem.nome}
                  onChange={(e) => setNovoItem({ ...novoItem, nome: e.target.value })}
                  placeholder="Nome do ingrediente"
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-gray-800 bg-white"
                />
                <input
                  type="number"
                  step="0.01"
                  value={novoItem.quantidade}
                  onChange={(e) => setNovoItem({ ...novoItem, quantidade: parseFloat(e.target.value) })}
                  placeholder="Qtd"
                  className="w-20 p-2 border border-gray-300 rounded-lg text-gray-800 bg-white"
                />
                <select
                  value={novoItem.unidade}
                  onChange={(e) => setNovoItem({ ...novoItem, unidade: e.target.value })}
                  className="w-24 p-2 border border-gray-300 rounded-lg text-gray-800 bg-white"
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="un">un</option>
                  <option value="lata">lata</option>
                  <option value="pacote">pacote</option>
                  <option value="litro">litro</option>
                  <option value="ml">ml</option>
                </select>
                <button onClick={adicionarItem} className="bg-green-600 text-white px-3 rounded-lg">+</button>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-200 rounded-lg p-2 bg-gray-50">
                {itensReceita.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-2">Nenhum ingrediente adicionado</p>
                ) : (
                  itensReceita.map(i => (
                    <div key={i.id} className="flex justify-between items-center p-2 bg-white rounded-lg border">
                      <span className="text-gray-700">{i.nome} - {i.quantidade} {i.unidade}</span>
                      <button onClick={() => removerItem(i.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button onClick={handleSave} className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700">
              Salvar Receita
            </button>
            <button onClick={closeModal} className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg mt-2 hover:bg-gray-300">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Modal Novo Prato */}
      {showNovoPratoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Novo Prato</h3>
              <button onClick={() => setShowNovoPratoModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={novoPratoNome}
                onChange={(e) => setNovoPratoNome(e.target.value)}
                placeholder="Nome do prato *"
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-800 bg-white"
              />
              <input
                type="number"
                step="0.01"
                value={novoPratoPreco}
                onChange={(e) => setNovoPratoPreco(parseFloat(e.target.value))}
                placeholder="Preço (R$) *"
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-800 bg-white"
              />
              <textarea
                value={novoPratoDescricao}
                onChange={(e) => setNovoPratoDescricao(e.target.value)}
                placeholder="Descrição (opcional)"
                className="w-full p-2 border border-gray-300 rounded-lg text-gray-800 bg-white h-20"
              />
              <button onClick={adicionarNovoPrato} className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700">
                Criar Prato
              </button>
              <button onClick={() => setShowNovoPratoModal(false)} className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Receitas dos Pratos</h1>
          <p className="text-sm text-gray-500">Configure os ingredientes de cada prato que você produz</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowModal(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
            <Plus size={16} /> Nova Receita
          </button>
        </div>
      </div>

      {/* Lista de Pratos */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">Pratos Cadastrados</h3>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar prato..."
              className="pl-9 p-2 border border-gray-300 rounded-lg text-sm w-64 bg-white text-gray-800"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left text-xs font-semibold text-gray-600">Prato</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600">Preço</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600">Receita</th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pratosFiltrados.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Nenhum prato cadastrado</td></tr>
              ) : (
                pratosFiltrados.map(prato => {
                  const receita = receitas.find(r => r.pratoId === prato.id);
                  return (
                    <tr key={prato.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <p className="font-medium text-gray-800">{prato.name}</p>
                        <p className="text-xs text-gray-400">{prato.description.substring(0, 50)}...</p>
                      </td>
                      <td className="p-3 font-semibold text-green-600">R$ {prato.price.toFixed(2)}</td>
                      <td className="p-3">
                        {receita ? (
                          <div className="space-y-1">
                            {receita.itens.slice(0, 2).map(i => (
                              <div key={i.id} className="text-xs text-gray-600">{i.nome}: {i.quantidade} {i.unidade}</div>
                            ))}
                            {receita.itens.length > 2 && (
                              <div className="text-xs text-gray-400">+{receita.itens.length - 2} ingredientes</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Sem receita</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          {receita ? (
                            <button onClick={() => openEditModal(receita)} className="text-blue-500 hover:text-blue-700">
                              <Edit size={16} />
                            </button>
                          ) : (
                            <button onClick={() => { setSelectedPrato(prato.id); setShowModal(true); }} className="text-green-500 hover:text-green-700">
                              <Plus size={16} />
                            </button>
                          )}
                          <button onClick={() => excluirPrato(prato.id, prato.name)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dica */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <h4 className="font-semibold text-blue-800 text-sm mb-2 flex items-center gap-2">
          <Plus size={16} /> Como criar um novo prato
        </h4>
        <p className="text-xs text-blue-700">Clique em "Nova Receita" → depois em "Novo" ao lado do dropdown para criar um novo prato. O prato criado aparecerá automaticamente no catálogo da cozinha e no app dos usuários.</p>
      </div>
    </div>
  );
}