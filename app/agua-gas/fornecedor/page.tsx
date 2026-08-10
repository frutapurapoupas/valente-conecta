"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { 
  ArrowLeft, Save, Truck, Package, DollarSign, 
  User, MapPin, Phone, Mail, Building, Clock,
  Plus, Trash2, Edit2, Check, X, AlertCircle,
  FileText, ClipboardList, CheckCircle, Loader2
} from "lucide-react";
import toast from "react-hot-toast";

// ============================================================================
// TIPOS
// ============================================================================

type Step = 'dados' | 'produtos';

interface Fornecedor {
  id: string;
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface ProdutoFornecedor {
  id: string;
  fornecedor_id: string;
  nome: string;
  descricao: string;
  preco: number;
  unidade: string;
  categoria: string;
  ativo: boolean;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function FornecedorPage() {
  const router = useRouter();
  const { isAdmin } = useApp();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>('dados');
  const [fornecedor, setFornecedor] = useState<Partial<Fornecedor>>({
    nome: "",
    cnpj: "",
    telefone: "",
    email: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    ativo: true
  });
  const [produtos, setProdutos] = useState<ProdutoFornecedor[]>([]);
  const [produtoEditando, setProdutoEditando] = useState<ProdutoFornecedor | null>(null);
  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    descricao: "",
    preco: 0,
    unidade: "L",
    categoria: "agua"
  });
  const [mostrarFormProduto, setMostrarFormProduto] = useState(false);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAdmin) {
      router.push("/login");
    }
  }, [mounted, isAdmin, router]);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  if (!mounted || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto" />
          <p className="text-white mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  const handleSalvarFornecedor = async () => {
    if (!fornecedor.nome || !fornecedor.cnpj) {
      toast.error("Preencha nome e CNPJ do fornecedor");
      return;
    }

    setLoading(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("✅ Fornecedor salvo com sucesso!");
      setStep('produtos');
    } catch (error) {
      toast.error("Erro ao salvar fornecedor");
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionarProduto = () => {
    if (!novoProduto.nome || novoProduto.preco <= 0) {
      toast.error("Preencha nome e preço do produto");
      return;
    }

    const novo: ProdutoFornecedor = {
      id: Date.now().toString(),
      fornecedor_id: "temp",
      ...novoProduto,
      ativo: true
    };

    setProdutos([...produtos, novo]);
    setNovoProduto({ nome: "", descricao: "", preco: 0, unidade: "L", categoria: "agua" });
    setMostrarFormProduto(false);
    toast.success("✅ Produto adicionado!");
  };

  const handleRemoverProduto = (id: string) => {
    setProdutos(produtos.filter(p => p.id !== id));
    toast.success("ðŸ—‘ï¸ Produto removido!");
  };

  const handleFinalizar = async () => {
    if (produtos.length === 0) {
      toast.error("Adicione pelo menos um produto");
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("🎉 Fornecedor cadastrado com sucesso!");
      router.push("/admin/agua-gas");
    } catch (error) {
      toast.error("Erro ao finalizar cadastro");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => router.push("/admin/agua-gas")} 
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Truck className="text-blue-400" />
              Cadastrar Fornecedor
            </h1>
            <p className="text-sm text-gray-400">Água e Gás</p>
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-4 mb-8 bg-white/5 rounded-xl p-4 border border-white/10">
          {(['dados', 'produtos'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              {/* ============================================================
                  🔴 CORREÇÃO AQUI: Removida a comparação com 'sucesso'
                  ============================================================ */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === s ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-400'}`}>
                {i + 1}
              </div>
              <span className={`text-sm ${step === s ? 'text-white font-semibold' : 'text-gray-500'}`}>
                {s === 'dados' ? '📋 Dados' : '📦 Produtos'}
              </span>
              {i < 1 && (
                <div className="w-8 h-0.5 bg-white/10 mx-2"></div>
              )}
            </div>
          ))}
        </div>

        {/* Conteúdo */}
        {step === 'dados' && (
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6 space-y-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Building className="text-blue-400" />
              Dados do Fornecedor
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">Nome do Fornecedor *</label>
                <input
                  type="text"
                  value={fornecedor.nome}
                  onChange={(e) => setFornecedor({ ...fornecedor, nome: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 text-white"
                  placeholder="Ex: Água Mineral da Serra"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">CNPJ *</label>
                <input
                  type="text"
                  value={fornecedor.cnpj}
                  onChange={(e) => setFornecedor({ ...fornecedor, cnpj: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 text-white"
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Telefone</label>
                <input
                  type="tel"
                  value={fornecedor.telefone}
                  onChange={(e) => setFornecedor({ ...fornecedor, telefone: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 text-white"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">E-mail</label>
                <input
                  type="email"
                  value={fornecedor.email}
                  onChange={(e) => setFornecedor({ ...fornecedor, email: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 text-white"
                  placeholder="contato@fornecedor.com"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">Endereço</label>
                <input
                  type="text"
                  value={fornecedor.endereco}
                  onChange={(e) => setFornecedor({ ...fornecedor, endereco: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 text-white"
                  placeholder="Rua, Número, Bairro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Cidade</label>
                <input
                  type="text"
                  value={fornecedor.cidade}
                  onChange={(e) => setFornecedor({ ...fornecedor, cidade: e.target.value })}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 text-white"
                  placeholder="São Paulo"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Estado</label>
                  <input
                    type="text"
                    value={fornecedor.estado}
                    onChange={(e) => setFornecedor({ ...fornecedor, estado: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 text-white"
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">CEP</label>
                  <input
                    type="text"
                    value={fornecedor.cep}
                    onChange={(e) => setFornecedor({ ...fornecedor, cep: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 text-white"
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSalvarFornecedor}
              disabled={loading}
              className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Salvar e Continuar
            </button>
          </div>
        )}

        {step === 'produtos' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="text-green-400" />
                  Produtos do Fornecedor
                </h2>
                <button
                  onClick={() => setMostrarFormProduto(!mostrarFormProduto)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium flex items-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Produto
                </button>
              </div>

              {/* Formulário de produto */}
              {mostrarFormProduto && (
                <div className="bg-white/5 rounded-xl p-4 space-y-3 mb-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Nome do Produto *</label>
                      <input
                        type="text"
                        value={novoProduto.nome}
                        onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-green-500 text-white"
                        placeholder="Ex: Água Mineral 20L"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Preço (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={novoProduto.preco}
                        onChange={(e) => setNovoProduto({ ...novoProduto, preco: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-green-500 text-white"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Unidade</label>
                      <select
                        value={novoProduto.unidade}
                        onChange={(e) => setNovoProduto({ ...novoProduto, unidade: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-green-500 text-white"
                      >
                        <option value="L">Litro (L)</option>
                        <option value="kg">Quilograma (kg)</option>
                        <option value="un">Unidade</option>
                        <option value="botijao">Botijão</option>
                        <option value="galão">Galão</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Descrição</label>
                      <input
                        type="text"
                        value={novoProduto.descricao}
                        onChange={(e) => setNovoProduto({ ...novoProduto, descricao: e.target.value })}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-green-500 text-white"
                        placeholder="Descrição opcional do produto"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAdicionarProduto}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium flex items-center gap-2 transition"
                    >
                      <Check className="w-4 h-4" />
                      Adicionar
                    </button>
                    <button
                      onClick={() => setMostrarFormProduto(false)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de produtos */}
              <div className="space-y-2">
                {produtos.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum produto cadastrado</p>
                    <p className="text-sm">Clique em "Adicionar Produto" para começar</p>
                  </div>
                ) : (
                  produtos.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{p.nome}</span>
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                            {p.unidade}
                          </span>
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                            R$ {p.preco.toFixed(2)}
                          </span>
                        </div>
                        {p.descricao && (
                          <p className="text-sm text-gray-400 mt-1">{p.descricao}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoverProduto(p.id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Botões finais */}
            <div className="flex gap-4">
              <button
                onClick={() => setStep('dados')}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium flex items-center gap-2 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
              <button
                onClick={handleFinalizar}
                disabled={loading || produtos.length === 0}
                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                Finalizar Cadastro
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

