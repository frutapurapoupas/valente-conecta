// app/admin-master/cardapio/pratos/page.tsx
"use client";

import {
  ArrowLeft,
  Calculator,
  ChefHat,
  Edit,
  Plus,
  Power,
  Save,
  Scale,
  Trash2,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Ingrediente {
  id: number;
  nome: string;
  quantidade: number;  // quantidade por prato (em gramas ou ml)
  unidade: "kg" | "g" | "l" | "ml" | "unidade";
  custoUnitario: number; // preço por kg ou unidade
}

interface Prato {
  id: number;
  nome: string;
  categoria: "carne" | "frango" | "doce" | "bebida";
  descricao: string;
  imagem?: string;
  ingredientes: Ingrediente[];
  precoVenda: number;
  precoRevendedor: number;
  custoTotal: number;
  margemLucro: number;
  ativo: boolean;
}

// Preços de referência para cálculo automático
const precosReferencia: { [key: string]: number } = {
  "carne": 32.00,      // preço médio por kg
  "acém": 32.00,
  "músculo": 30.00,
  "moída": 28.00,
  "frango": 18.00,
  "peito frango": 18.00,
  "arroz": 8.00,
  "feijão": 10.00,
  "batata": 5.00,
  "cenoura": 4.00,
  "cebola": 5.00,
  "tomate": 6.00,
  "farinha": 6.00,
  "açúcar": 4.50,
  "acucar": 4.50,
  "leite": 5.00,
  "ovos": 1.20,
  "chocolate": 25.00,
  "creme leite": 8.00,
  "queijo": 35.00,
  "pão": 12.00,
  "manteiga": 20.00,
  "óleo": 7.00,
  "sal": 2.00,
  "alho": 15.00,
  "pimenta": 30.00,
  "tempero": 25.00,
};

export default function AdminPratosPage() {
  const router = useRouter();
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editandoPrato, setEditandoPrato] = useState<Prato | null>(null);
  const [formPrato, setFormPrato] = useState({
    nome: "",
    categoria: "carne" as Prato["categoria"],
    descricao: "",
    ativo: true
  });
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [novoIngrediente, setNovoIngrediente] = useState({
    nome: "",
    quantidade: 0,
    unidade: "g" as Ingrediente["unidade"],
    custoUnitario: 0
  });
  const [precoVendaManual, setPrecoVendaManual] = useState<number | null>(null);
  const [calculandoPreco, setCalculandoPreco] = useState(false);
  const [margemDesejada, setMargemDesejada] = useState(50); // 50% de margem padrão
  const [mostrarCalculo, setMostrarCalculo] = useState(false);

  const unidades = [
    { value: "kg", label: "Quilograma (kg)", fator: 1 },
    { value: "g", label: "Grama (g)", fator: 0.001 },
    { value: "l", label: "Litro (l)", fator: 1 },
    { value: "ml", label: "Mililitro (ml)", fator: 0.001 },
    { value: "unidade", label: "Unidade", fator: 1 }
  ];

  useEffect(() => {
    carregarPratos();
  }, []);

  const carregarPratos = () => {
    const stored = localStorage.getItem("pratos_cardapio_completo");
    if (stored) {
      setPratos(JSON.parse(stored));
    } else {
      setPratos([]);
      localStorage.setItem("pratos_cardapio_completo", JSON.stringify([]));
      localStorage.setItem("pratos_cardapio", JSON.stringify([]));
    }
  };

  const calcularCustoTotal = (ingredientesList: Ingrediente[]): number => {
    return ingredientesList.reduce((total, ing) => {
      let quantidadeKg = ing.quantidade;
      if (ing.unidade === "g") quantidadeKg = ing.quantidade / 1000;
      if (ing.unidade === "ml") quantidadeKg = ing.quantidade / 1000;
      if (ing.unidade === "unidade") return total + (ing.custoUnitario * ing.quantidade);
      return total + (quantidadeKg * ing.custoUnitario);
    }, 0);
  };

  const calcularPrecoSugerido = (custoTotal: number, margem: number): number => {
    // Preço = Custo / (1 - Margem%)
    if (margem >= 100) return custoTotal * 2;
    return custoTotal / (1 - (margem / 100));
  };

  const sugerirPrecoPorIngrediente = (nomeIngrediente: string): number => {
    const nomeLower = nomeIngrediente.toLowerCase();
    for (const [key, valor] of Object.entries(precosReferencia)) {
      if (nomeLower.includes(key)) {
        return valor;
      }
    }
    return 15.00; // preço padrão
  };

  const calcularCustoIngrediente = (ing: Ingrediente): number => {
    if (ing.unidade === "g") return (ing.quantidade / 1000) * ing.custoUnitario;
    if (ing.unidade === "ml") return (ing.quantidade / 1000) * ing.custoUnitario;
    if (ing.unidade === "unidade") return ing.quantidade * ing.custoUnitario;
    return ing.quantidade * ing.custoUnitario;
  };

  const adicionarIngrediente = () => {
    if (!novoIngrediente.nome.trim()) {
      alert("Preencha o nome do ingrediente");
      return;
    }
    if (novoIngrediente.quantidade <= 0) {
      alert("Preencha a quantidade");
      return;
    }

    // Sugerir preço automaticamente baseado no nome
    const precoSugerido = sugerirPrecoPorIngrediente(novoIngrediente.nome);

    setIngredientes([
      ...ingredientes,
      {
        ...novoIngrediente,
        id: Date.now(),
        custoUnitario: novoIngrediente.custoUnitario || precoSugerido
      }
    ]);
    setNovoIngrediente({ nome: "", quantidade: 0, unidade: "g", custoUnitario: 0 });
  };

  const removerIngrediente = (id: number) => {
    setIngredientes(ingredientes.filter(i => i.id !== id));
  };

  const atualizarCustoIngrediente = (id: number, novoCusto: number) => {
    setIngredientes(ingredientes.map(i =>
      i.id === id ? { ...i, custoUnitario: novoCusto } : i
    ));
  };

  const calcularPrecoAutomatico = () => {
    setCalculandoPreco(true);
    setTimeout(() => {
      const custoTotal = calcularCustoTotal(ingredientes);
      const precoSugerido = calcularPrecoSugerido(custoTotal, margemDesejada);
      setPrecoVendaManual(precoSugerido);
      setMostrarCalculo(true);
      setCalculandoPreco(false);

      setTimeout(() => setMostrarCalculo(false), 5000);
    }, 500);
  };

  const salvarPrato = () => {
    if (!formPrato.nome.trim()) {
      alert("Preencha o nome do prato");
      return;
    }
    if (ingredientes.length === 0) {
      alert("Adicione pelo menos um ingrediente");
      return;
    }

    const custoTotal = calcularCustoTotal(ingredientes);
    let precoVenda = precoVendaManual || calcularPrecoSugerido(custoTotal, margemDesejada);

    // Arredondar para valores comerciais
    precoVenda = Math.ceil(precoVenda * 2) / 2;

    const precoRevendedor = precoVenda * 0.7; // 30% de desconto
    const margemLucro = ((precoVenda - custoTotal) / precoVenda) * 100;

    const novoPrato: Prato = {
      id: editandoPrato?.id || Date.now(),
      nome: formPrato.nome,
      categoria: formPrato.categoria,
      descricao: formPrato.descricao,
      ativo: formPrato.ativo,
      ingredientes: ingredientes,
      precoVenda: precoVenda,
      precoRevendedor: precoRevendedor,
      custoTotal: custoTotal,
      margemLucro: margemLucro
    };

    let novosPratos: Prato[];
    if (editandoPrato) {
      novosPratos = pratos.map(p => p.id === editandoPrato.id ? novoPrato : p);
    } else {
      novosPratos = [...pratos, novoPrato];
    }

    // Salvar nos dois locais
    localStorage.setItem("pratos_cardapio_completo", JSON.stringify(novosPratos));

    // Salvar versão simplificada para cardápios (sem ingredientes)
    const pratosSimples = novosPratos.map(p => ({
      id: p.id,
      nome: p.nome,
      categoria: p.categoria,
      descricao: p.descricao,
      precoVenda: p.precoVenda,
      precoRevendedor: p.precoRevendedor,
      ativo: p.ativo
    }));
    localStorage.setItem("pratos_cardapio", JSON.stringify(pratosSimples));

    setPratos(novosPratos);
    closeModal();
    alert(`✅ Prato "${formPrato.nome}" salvo com sucesso!\n\nCusto: R$ ${custoTotal.toFixed(2)}\nPreço Venda: R$ ${precoVenda.toFixed(2)}\nMargem: ${margemLucro.toFixed(0)}%`);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditandoPrato(null);
    setFormPrato({ nome: "", categoria: "carne", descricao: "", ativo: true });
    setIngredientes([]);
    setPrecoVendaManual(null);
    setMostrarCalculo(false);
  };

  const openEditModal = (prato: Prato) => {
    setEditandoPrato(prato);
    setFormPrato({
      nome: prato.nome,
      categoria: prato.categoria,
      descricao: prato.descricao,
      ativo: prato.ativo
    });
    setIngredientes([...prato.ingredientes]);
    setPrecoVendaManual(prato.precoVenda);
    setShowModal(true);
  };

  const toggleAtivo = (prato: Prato) => {
    const novosPratos = pratos.map(p =>
      p.id === prato.id ? { ...p, ativo: !p.ativo } : p
    );
    localStorage.setItem("pratos_cardapio_completo", JSON.stringify(novosPratos));

    const pratosSimples = novosPratos.map(p => ({
      id: p.id,
      nome: p.nome,
      categoria: p.categoria,
      descricao: p.descricao,
      precoVenda: p.precoVenda,
      precoRevendedor: p.precoRevendedor,
      ativo: p.ativo
    }));
    localStorage.setItem("pratos_cardapio", JSON.stringify(pratosSimples));
    setPratos(novosPratos);
  };

  const excluirPrato = (id: number) => {
    const prato = pratos.find(p => p.id === id);
    if (confirm(`Excluir "${prato?.nome}" permanentemente?`)) {
      const novosPratos = pratos.filter(p => p.id !== id);
      localStorage.setItem("pratos_cardapio_completo", JSON.stringify(novosPratos));

      const pratosSimples = novosPratos.map(p => ({
        id: p.id,
        nome: p.nome,
        categoria: p.categoria,
        descricao: p.descricao,
        precoVenda: p.precoVenda,
        precoRevendedor: p.precoRevendedor,
        ativo: p.ativo
      }));
      localStorage.setItem("pratos_cardapio", JSON.stringify(pratosSimples));
      setPratos(novosPratos);
      alert("✅ Prato excluído com sucesso!");
    }
  };

  const getCategoriaCor = (categoria: string) => {
    switch (categoria) {
      case "carne": return "bg-red-100 text-red-700";
      case "frango": return "bg-orange-100 text-orange-700";
      case "doce": return "bg-pink-100 text-pink-700";
      case "bebida": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getCategoriaIcone = (categoria: string) => {
    switch (categoria) {
      case "carne": return "🥩";
      case "frango": return "ðŸ—";
      case "doce": return "ðŸ°";
      case "bebida": return "🥤";
      default: return "ðŸ½ï¸";
    }
  };

  const custoTotalAtual = calcularCustoTotal(ingredientes);
  const precoSugeridoAtual = calcularPrecoSugerido(custoTotalAtual, margemDesejada);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Botão Voltar */}
        <button
          onClick={() => router.back()}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-600 transition mb-4"
        >
          <ArrowLeft size={18} /> Voltar
        </button>

        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">ðŸ½ï¸ Gerenciar Pratos</h1>
            <p className="text-sm text-gray-500">Cadastre pratos com ingredientes e custos para cálculo automático</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition"
          >
            <Plus size={18} /> Novo Prato
          </button>
        </div>

        {/* Lista de Pratos */}
        {pratos.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <ChefHat size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum prato cadastrado</h3>
            <p className="text-gray-500 mb-4">Clique em "Novo Prato" para começar a cadastrar</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <Plus size={18} /> Cadastrar Primeiro Prato
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pratos.map(prato => (
              <div key={prato.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoriaIcone(prato.categoria)}</span>
                      <div>
                        <h3 className="font-bold text-gray-800">{prato.nome}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoriaCor(prato.categoria)}`}>
                          {prato.categoria}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleAtivo(prato)}
                      className={`p-1 rounded ${prato.ativo ? "text-green-500" : "text-gray-400"}`}
                      title={prato.ativo ? "Desativar" : "Ativar"}
                    >
                      <Power size={16} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{prato.descricao || "Sem descrição"}</p>

                  {/* Custos e Preços */}
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-400 text-xs">Custo Total</p>
                        <p className="font-medium text-red-500">R$ {prato.custoTotal.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Margem</p>
                        <p className={`font-medium ${prato.margemLucro >= 50 ? "text-green-500" : "text-yellow-500"}`}>
                          {prato.margemLucro.toFixed(0)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Venda Normal</p>
                        <p className="font-bold text-orange-500">R$ {prato.precoVenda.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Revendedor</p>
                        <p className="font-bold text-green-600">R$ {prato.precoRevendedor.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t flex justify-between items-center">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Scale size={12} /> {prato.ingredientes.length} ingredientes
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(prato)} className="text-blue-500 hover:text-blue-700">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => excluirPrato(prato.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Cadastro/Edição de Prato */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">
                {editandoPrato ? "âœï¸ Editar Prato" : "âž• Novo Prato"}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Informações Básicas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Prato *
                  </label>
                  <input
                    type="text"
                    value={formPrato.nome}
                    onChange={(e) => setFormPrato({ ...formPrato, nome: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Ex: Strogonoff de Frango"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={formPrato.categoria}
                    onChange={(e) => setFormPrato({ ...formPrato, categoria: e.target.value as any })}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="carne">🥩 Carne</option>
                    <option value="frango">ðŸ— Frango</option>
                    <option value="doce">ðŸ° Doce</option>
                    <option value="bebida">🥤 Bebida</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formPrato.descricao}
                  onChange={(e) => setFormPrato({ ...formPrato, descricao: e.target.value })}
                  className="w-full p-2 border rounded-lg h-20"
                  placeholder="Descreva o prato..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formPrato.ativo}
                  onChange={(e) => setFormPrato({ ...formPrato, ativo: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm text-gray-700">Prato disponível no cardápio</label>
              </div>

              {/* Ingredientes */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Scale size={18} /> Ingredientes (porção individual)
                </h4>

                {/* Lista de ingredientes cadastrados */}
                <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                  {ingredientes.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">
                      Nenhum ingrediente adicionado
                    </p>
                  ) : (
                    ingredientes.map(ing => (
                      <div key={ing.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                        <div className="flex-1">
                          <span className="font-medium">{ing.nome}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {ing.quantidade} {ing.unidade}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">R$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={ing.custoUnitario}
                              onChange={(e) => atualizarCustoIngrediente(ing.id, parseFloat(e.target.value))}
                              className="w-20 p-1 border rounded text-sm text-right"
                            />
                            <span className="text-xs text-gray-400">/{ing.unidade === "g" ? "kg" : ing.unidade}</span>
                          </div>
                          <span className="text-sm text-green-600 w-20 text-right">
                            R$ {calcularCustoIngrediente(ing).toFixed(2)}
                          </span>
                          <button onClick={() => removerIngrediente(ing.id)} className="text-red-500">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Formulário para novo ingrediente */}
                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">+ Adicionar Ingrediente</p>
                  <div className="grid grid-cols-6 gap-2">
                    <input
                      type="text"
                      placeholder="Ingrediente"
                      value={novoIngrediente.nome}
                      onChange={(e) => setNovoIngrediente({ ...novoIngrediente, nome: e.target.value })}
                      className="col-span-2 p-2 border rounded-lg text-sm"
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Qtd"
                      value={novoIngrediente.quantidade || ""}
                      onChange={(e) => setNovoIngrediente({ ...novoIngrediente, quantidade: parseFloat(e.target.value) })}
                      className="p-2 border rounded-lg text-sm"
                    />
                    <select
                      value={novoIngrediente.unidade}
                      onChange={(e) => setNovoIngrediente({ ...novoIngrediente, unidade: e.target.value as any })}
                      className="p-2 border rounded-lg text-sm"
                    >
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="l">l</option>
                      <option value="unidade">un</option>
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="R$/kg"
                      value={novoIngrediente.custoUnitario || ""}
                      onChange={(e) => setNovoIngrediente({ ...novoIngrediente, custoUnitario: parseFloat(e.target.value) })}
                      className="p-2 border rounded-lg text-sm"
                    />
                    <button
                      onClick={adicionarIngrediente}
                      className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-1"
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    * Deixe o preço em branco para sugestão automática baseada no nome
                  </p>
                </div>
              </div>

              {/* Cálculo de Preço */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Calculator size={18} /> Cálculo de Preço
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Margem Desejada (%)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="20"
                        max="80"
                        value={margemDesejada}
                        onChange={(e) => setMargemDesejada(parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="w-12 text-center font-bold text-orange-600">{margemDesejada}%</span>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={calcularPrecoAutomatico}
                      disabled={ingredientes.length === 0 || calculandoPreco}
                      className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {calculandoPreco ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      ) : (
                        <Calculator size={18} />
                      )}
                      Calcular Preço
                    </button>
                  </div>
                </div>

                {mostrarCalculo && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg animate-pulse">
                    <p className="text-sm text-green-800">
                      💰 Preço sugerido: <strong>R$ {precoSugeridoAtual.toFixed(2)}</strong>
                      <br />
                      <span className="text-xs">(Custo: R$ {custoTotalAtual.toFixed(2)} + Margem: {margemDesejada}%)</span>
                    </p>
                  </div>
                )}

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço de Venda (R$) - pode editar manualmente
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={precoVendaManual !== null ? precoVendaManual : precoSugeridoAtual}
                    onChange={(e) => setPrecoVendaManual(parseFloat(e.target.value))}
                    className="w-full p-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Custo total do prato: <strong>R$ {custoTotalAtual.toFixed(2)}</strong>
                  </p>
                </div>
              </div>

              {/* Botão Salvar */}
              <button
                onClick={salvarPrato}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-orange-600 transition"
              >
                <Save size={18} /> {editandoPrato ? "Salvar Alterações" : "Cadastrar Prato"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

