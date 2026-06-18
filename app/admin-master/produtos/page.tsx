"use client";

import {
  ArrowLeft,
  Cake,
  Edit2,
  Image as ImageIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
  Utensils,
  X
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Ingrediente {
  id: string;
  nome: string;
  quantidade: number;
  unidade: "kg" | "g" | "L" | "ml" | "un" | "cx";
  tipo: "peso" | "volume" | "unidade";
}

interface Produto {
  id: string;
  nome: string;
  foto: string;
  descricao: string;
  precoCliente: number;
  precoParceiro: number;
  tempoPreparo: string;
  popular: boolean;
  ingredientes: Ingrediente[];
  categoria: "prato" | "doce";
  tamanhos?: { nome: string; peso: number; preco: number }[];
}

const pratosPadrao: Produto[] = [
  { id: "1", nome: "Picadinho de carne + arroz + legumes", foto: "", descricao: "Picadinho de carne acompanhado de arroz e legumes selecionados", precoCliente: 12, precoParceiro: 10, tempoPreparo: "20-30min", popular: false, ingredientes: [], categoria: "prato" },
  { id: "2", nome: "Carne moída + arroz + brócolis/cenoura", foto: "", descricao: "Carne moída com arroz, brócolis e cenoura", precoCliente: 14, precoParceiro: 11, tempoPreparo: "20-25min", popular: false, ingredientes: [], categoria: "prato" },
  { id: "3", nome: "Carne de panela + arroz + purê mandioca", foto: "", descricao: "Carne de panela com arroz e purê de mandioca", precoCliente: 15, precoParceiro: 12, tempoPreparo: "30-40min", popular: false, ingredientes: [], categoria: "prato" },
  { id: "4", nome: "Frango em cubos + arroz + purê", foto: "", descricao: "Frango em cubos com arroz e purê", precoCliente: 13, precoParceiro: 10, tempoPreparo: "20-25min", popular: false, ingredientes: [], categoria: "prato" },
  { id: "5", nome: "Strogonoff de frango + arroz", foto: "", descricao: "Strogonoff de frango com arroz", precoCliente: 12, precoParceiro: 10, tempoPreparo: "20-25min", popular: true, ingredientes: [], categoria: "prato" },
  { id: "6", nome: "Frango à milanesa + arroz + legumes", foto: "", descricao: "Frango à milanesa com arroz e legumes", precoCliente: 14, precoParceiro: 11, tempoPreparo: "20-25min", popular: false, ingredientes: [], categoria: "prato" },
  { id: "7", nome: "Escondidinho de frango (purê batata)", foto: "", descricao: "Escondidinho de frango com purê de batata", precoCliente: 15, precoParceiro: 12, tempoPreparo: "25-30min", popular: false, ingredientes: [], categoria: "prato" },
];

const docesPadrao: Produto[] = [
  { id: "101", nome: "Pudim", foto: "", descricao: "Pudim de leite condensado", precoCliente: 8, precoParceiro: 6, tempoPreparo: "10min", popular: true, ingredientes: [], tamanhos: [{ nome: "700g", peso: 700, preco: 8 }, { nome: "150g", peso: 150, preco: 3 }], categoria: "doce" },
  { id: "102", nome: "Bolo Tradicional Formigueiro", foto: "", descricao: "Bolo formigueiro tradicional", precoCliente: 12, precoParceiro: 9, tempoPreparo: "15min", popular: true, ingredientes: [], tamanhos: [{ nome: "700g", peso: 700, preco: 12 }, { nome: "150g", peso: 150, preco: 5 }], categoria: "doce" },
  { id: "103", nome: "Bolo de Banana", foto: "", descricao: "Bolo de banana macio", precoCliente: 10, precoParceiro: 7, tempoPreparo: "15min", popular: false, ingredientes: [], tamanhos: [{ nome: "700g", peso: 700, preco: 10 }, { nome: "150g", peso: 150, preco: 4 }], categoria: "doce" },
  { id: "104", nome: "Bolo Tradicional", foto: "", descricao: "Bolo simples tradicional", precoCliente: 10, precoParceiro: 7, tempoPreparo: "15min", popular: false, ingredientes: [], tamanhos: [{ nome: "700g", peso: 700, preco: 10 }, { nome: "150g", peso: 150, preco: 4 }], categoria: "doce" },
  { id: "105", nome: "Bolo de Cenoura", foto: "", descricao: "Bolo de cenoura com cobertura", precoCliente: 12, precoParceiro: 9, tempoPreparo: "15min", popular: false, ingredientes: [], tamanhos: [{ nome: "700g", peso: 700, preco: 12 }, { nome: "150g", peso: 150, preco: 5 }], categoria: "doce" },
  { id: "106", nome: "Bolo de Chocolate", foto: "", descricao: "Bolo de chocolate fofinho", precoCliente: 12, precoParceiro: 9, tempoPreparo: "15min", popular: true, ingredientes: [], tamanhos: [{ nome: "700g", peso: 700, preco: 12 }, { nome: "150g", peso: 150, preco: 5 }], categoria: "doce" },
  { id: "107", nome: "Torta de Abacaxi", foto: "", descricao: "Torta de abacaxi", precoCliente: 10, precoParceiro: 7, tempoPreparo: "10min", popular: false, ingredientes: [], tamanhos: [{ nome: "700g", peso: 700, preco: 10 }, { nome: "150g", peso: 150, preco: 4 }], categoria: "doce" },
  { id: "108", nome: "Torta de Frango", foto: "", descricao: "Torta salgada de frango", precoCliente: 15, precoParceiro: 12, tempoPreparo: "20min", popular: false, ingredientes: [], categoria: "doce" },
];

export default function ProdutosAdminPage() {
  const [abaAtiva, setAbaAtiva] = useState<"pratos" | "doces">("pratos");
  const [pratos, setPratos] = useState<Produto[]>([]);
  const [doces, setDoces] = useState<Produto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [expandedIngredientes, setExpandedIngredientes] = useState<string | null>(null);
  const [novoIngrediente, setNovoIngrediente] = useState<Partial<Ingrediente>>({});
  const [previewFoto, setPreviewFoto] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    const pratosSalvos = localStorage.getItem("admin_produtos_pratos");
    const docesSalvos = localStorage.getItem("admin_produtos_doces");

    if (pratosSalvos) {
      setPratos(JSON.parse(pratosSalvos));
    } else {
      setPratos(pratosPadrao);
    }

    if (docesSalvos) {
      setDoces(JSON.parse(docesSalvos));
    } else {
      setDoces(docesPadrao);
    }
  };

  const salvarDados = () => {
    localStorage.setItem("admin_produtos_pratos", JSON.stringify(pratos));
    localStorage.setItem("admin_produtos_doces", JSON.stringify(doces));
    alert("✅ Produtos salvos com sucesso!");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setPreviewFoto(data.url);
        if (editando) {
          setEditando({ ...editando, foto: data.url });
        }
        alert("✅ Imagem enviada com sucesso!");
      } else {
        alert("❌ Erro ao enviar imagem: " + data.error);
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("❌ Erro ao fazer upload da imagem");
    } finally {
      setUploading(false);
    }
  };

  const adicionarProduto = () => {
    const novoId = Date.now().toString();
    const novoProduto: Produto = {
      id: novoId,
      nome: "Novo Produto",
      foto: "",
      descricao: "Descrição do produto",
      precoCliente: 10,
      precoParceiro: 8,
      tempoPreparo: "20min",
      popular: false,
      ingredientes: [],
      categoria: abaAtiva
    };

    if (abaAtiva === "pratos") {
      setPratos([...pratos, novoProduto]);
    } else {
      setDoces([...doces, novoProduto]);
    }
  };

  const editarProduto = (produto: Produto) => {
    setEditando(produto);
    setPreviewFoto(produto.foto);
    setShowModal(true);
  };

  const salvarEdicao = () => {
    if (editando) {
      if (abaAtiva === "pratos") {
        setPratos(pratos.map(p => p.id === editando.id ? editando : p));
      } else {
        setDoces(doces.map(d => d.id === editando.id ? editando : d));
      }
    }
    setShowModal(false);
    setEditando(null);
    setPreviewFoto("");
  };

  const excluirProduto = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      if (abaAtiva === "pratos") {
        setPratos(pratos.filter(p => p.id !== id));
      } else {
        setDoces(doces.filter(d => d.id !== id));
      }
    }
  };

  const adicionarIngrediente = (produtoId: string) => {
    if (!novoIngrediente.nome || !novoIngrediente.quantidade) return;

    const novoIngredienteObj: Ingrediente = {
      id: Date.now().toString(),
      nome: novoIngrediente.nome || "",
      quantidade: novoIngrediente.quantidade || 0,
      unidade: novoIngrediente.unidade || "g",
      tipo: novoIngrediente.tipo || "peso"
    };

    const atualizarProduto = (produto: Produto) => {
      if (produto.id === produtoId) {
        return {
          ...produto,
          ingredientes: [...produto.ingredientes, novoIngredienteObj]
        };
      }
      return produto;
    };

    if (abaAtiva === "pratos") {
      setPratos(pratos.map(atualizarProduto));
    } else {
      setDoces(doces.map(atualizarProduto));
    }

    setNovoIngrediente({});
  };

  const removerIngrediente = (produtoId: string, ingredienteId: string) => {
    const atualizarProduto = (produto: Produto) => {
      if (produto.id === produtoId) {
        return {
          ...produto,
          ingredientes: produto.ingredientes.filter(i => i.id !== ingredienteId)
        };
      }
      return produto;
    };

    if (abaAtiva === "pratos") {
      setPratos(pratos.map(atualizarProduto));
    } else {
      setDoces(doces.map(atualizarProduto));
    }
  };

  const produtosAtuais = abaAtiva === "pratos" ? pratos : doces;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <Link href="/admin-master/dashboard" className="flex items-center gap-2 text-purple-600 font-medium">
            <ArrowLeft size={20} /> Voltar ao Painel
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">📦 Catálogo de Produtos</h1>
          <button onClick={salvarDados} className="bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-green-700">
            <Save size={18} /> Salvar Tudo
          </button>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button onClick={() => setAbaAtiva("pratos")} className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${abaAtiva === "pratos" ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-500 hover:text-gray-700"}`}>
            <Utensils size={18} /> Pratos ({pratos.length})
          </button>
          <button onClick={() => setAbaAtiva("doces")} className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${abaAtiva === "doces" ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-500 hover:text-gray-700"}`}>
            <Cake size={18} /> Doces ({doces.length})
          </button>
        </div>

        <div className="space-y-3">
          {produtosAtuais.map((produto, index) => (
            <div key={produto.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 flex items-center justify-between bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm">{index + 1}</span>
                  <h3 className="font-bold text-gray-800">{produto.nome}</h3>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editarProduto(produto)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                  <button onClick={() => excluirProduto(produto.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                </div>
              </div>

              <div className="p-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="w-full h-32 bg-gray-100 rounded-xl overflow-hidden">
                    {produto.foto ? (
                      <img src={produto.foto} alt={produto.nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={32} /></div>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 line-clamp-2">{produto.descricao}</p>
                    <div className="flex gap-3 mt-2">
                      <span className="text-sm font-semibold text-green-600">R$ {produto.precoCliente}</span>
                      <span className="text-sm text-gray-500">Parceiro: R$ {produto.precoParceiro}</span>
                      <span className="text-sm text-gray-500">{produto.tempoPreparo}</span>
                      {produto.popular && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Popular</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={adicionarProduto} className="fixed bottom-8 right-8 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-all">
          <Plus size={24} />
        </button>

        {showModal && editando && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b sticky top-0 bg-white flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Editar Produto</h2>
                <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-500" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input type="text" value={editando.nome} onChange={(e) => setEditando({ ...editando, nome: e.target.value })} className="w-full p-2 border rounded-lg text-gray-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea value={editando.descricao} onChange={(e) => setEditando({ ...editando, descricao: e.target.value })} rows={3} className="w-full p-2 border rounded-lg text-gray-800" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço Cliente</label>
                    <input type="number" step="0.01" value={editando.precoCliente} onChange={(e) => setEditando({ ...editando, precoCliente: parseFloat(e.target.value) })} className="w-full p-2 border rounded-lg text-gray-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço Parceiro</label>
                    <input type="number" step="0.01" value={editando.precoParceiro} onChange={(e) => setEditando({ ...editando, precoParceiro: parseFloat(e.target.value) })} className="w-full p-2 border rounded-lg text-gray-800" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tempo de preparo</label>
                  <input type="text" value={editando.tempoPreparo} onChange={(e) => setEditando({ ...editando, tempoPreparo: e.target.value })} className="w-full p-2 border rounded-lg text-gray-800" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={editando.popular} onChange={(e) => setEditando({ ...editando, popular: e.target.checked })} id="popular" />
                  <label htmlFor="popular" className="text-sm text-gray-700">Marcar como Popular</label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Foto do Produto</label>
                  <div className="flex gap-4 items-start">
                    <div className="w-28 h-28 bg-gray-100 rounded-xl overflow-hidden border-2">
                      {previewFoto ? (
                        <img src={previewFoto} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><ImageIcon size={32} className="text-gray-400" /></div>
                      )}
                    </div>
                    <label className={`flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer ${uploading ? "opacity-50" : "hover:bg-gray-200"}`}>
                      {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                      <span className="text-sm text-gray-700">{uploading ? "Enviando..." : "Escolher imagem"}</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">As imagens são salvas na pasta public/uploads/cozinha/</p>
                </div>
              </div>
              <div className="p-6 border-t flex gap-3">
                <button onClick={salvarEdicao} className="flex-1 bg-purple-600 text-white py-2 rounded-xl font-semibold">Salvar</button>
                <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl font-semibold">Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}