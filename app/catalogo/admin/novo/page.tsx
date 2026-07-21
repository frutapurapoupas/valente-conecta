'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Upload, 
  X,
  Package,
  Tag,
  Image as ImageIcon,
  MapPin,
  Phone,
  Store,
  DollarSign,
  FileText,
  Star,
  Shield
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface ProdutoData {
  // Passo 1 - Informações básicas
  nome: string;
  descricao: string;
  categoria: string;
  subcategoria: string;
  
  // Passo 2 - Preço e estoque
  preco: number;
  precoOriginal: number;
  desconto: number;
  estoque: number;
  
  // Passo 3 - Imagens
  imagens: string[];
  
  // Passo 4 - Fornecedor
  fornecedorNome: string;
  fornecedorEndereco: string;
  fornecedorTelefone: string;
  fornecedorWhatsapp: string;
  fornecedorEmail: string;
  
  // Passo 5 - Detalhes adicionais
  destaque: boolean;
  peso: number;
  dimensoes: string;
  garantia: string;
  observacoes: string;
}

const categorias = [
  { id: 'alimentacao', nome: 'Alimentação', subcategorias: ['Mercearia', 'Bebidas', 'Congelados', 'Padaria', 'Açougue', 'Hortifruti'] },
  { id: 'higiene', nome: 'Higiene', subcategorias: ['Banho', 'Cabelo', 'Oral', 'Facial', 'Perfumaria'] },
  { id: 'limpeza', nome: 'Limpeza', subcategorias: ['Multiuso', 'Lavanderia', 'Cozinha', 'Banheiro', 'Automotivo'] },
  { id: 'eletronicos', nome: 'Eletrônicos', subcategorias: ['Celulares', 'Acessórios', 'Informática', 'Áudio', 'TV'] },
  { id: 'moda', nome: 'Moda', subcategorias: ['Masculino', 'Feminino', 'Infantil', 'Calçados', 'Acessórios'] },
  { id: 'veiculos', nome: 'Veículos', subcategorias: ['Carros', 'Motos', 'Peças', 'Acessórios', 'Serviços'] },
  { id: 'imoveis', nome: 'Imóveis', subcategorias: ['Apartamentos', 'Casas', 'Terrenos', 'Comercial', 'Rural'] },
  { id: 'servicos', nome: 'Serviços', subcategorias: ['Consultoria', 'Manutenção', 'Limpeza', 'Segurança', 'Eventos'] }
];

export default function NovoProdutoWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [produto, setProduto] = useState<ProdutoData>({
    nome: '',
    descricao: '',
    categoria: '',
    subcategoria: '',
    preco: 0,
    precoOriginal: 0,
    desconto: 0,
    estoque: 0,
    imagens: [],
    fornecedorNome: '',
    fornecedorEndereco: '',
    fornecedorTelefone: '',
    fornecedorWhatsapp: '',
    fornecedorEmail: '',
    destaque: false,
    peso: 0,
    dimensoes: '',
    garantia: '',
    observacoes: ''
  });

  const steps: Step[] = [
    { id: 1, title: 'Informações Básicas', description: 'Nome, descrição e categoria', icon: <FileText className="w-5 h-5" /> },
    { id: 2, title: 'Preço e Estoque', description: 'Valores e disponibilidade', icon: <DollarSign className="w-5 h-5" /> },
    { id: 3, title: 'Imagens', description: 'Fotos do produto', icon: <ImageIcon className="w-5 h-5" /> },
    { id: 4, title: 'Fornecedor', description: 'Quem está vendendo', icon: <Store className="w-5 h-5" /> },
    { id: 5, title: 'Detalhes', description: 'Informações adicionais', icon: <Star className="w-5 h-5" /> }
  ];

  const updateProduto = (field: keyof ProdutoData, value: any) => {
    setProduto(prev => ({ ...prev, [field]: value }));
  };

  const calcularDesconto = () => {
    if (produto.precoOriginal > 0 && produto.preco > 0) {
      const desc = ((produto.precoOriginal - produto.preco) / produto.precoOriginal) * 100;
      updateProduto('desconto', Math.round(desc));
    }
  };

  const handlePrecoChange = (preco: number) => {
    updateProduto('preco', preco);
    calcularDesconto();
  };

  const handlePrecoOriginalChange = (precoOriginal: number) => {
    updateProduto('precoOriginal', precoOriginal);
    calcularDesconto();
  };

  const handleImagemUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Simular upload - em produção, enviar para API
    const novasImagens = Array.from(files).map(file => URL.createObjectURL(file));
    updateProduto('imagens', [...produto.imagens, ...novasImagens]);
    toast.success(`${files.length} imagem(ns) adicionada(s)`);
  };

  const removerImagem = (index: number) => {
    const novasImagens = [...produto.imagens];
    novasImagens.splice(index, 1);
    updateProduto('imagens', novasImagens);
    toast.success('Imagem removida');
  };

  const proximoStep = () => {
    // Validação por passo
    if (step === 1) {
      if (!produto.nome.trim()) {
        toast.error('Digite o nome do produto');
        return;
      }
      if (!produto.categoria) {
        toast.error('Selecione uma categoria');
        return;
      }
    }
    
    if (step === 2) {
      if (produto.preco <= 0) {
        toast.error('Digite um preço válido');
        return;
      }
    }
    
    if (step === 4) {
      if (!produto.fornecedorNome.trim()) {
        toast.error('Digite o nome do fornecedor');
        return;
      }
    }

    setStep(prev => Math.min(prev + 1, steps.length));
  };

  const stepAnterior = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const salvarProduto = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/catalogo/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(produto)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Produto cadastrado com sucesso!');
        router.push('/catalogo/admin');
      } else {
        throw new Error(data.error || 'Erro ao salvar');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Novo Produto</h1>
            <span className="text-sm text-gray-500">Passo {step} de {steps.length}</span>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {steps.map((s) => (
              <div
                key={s.id}
                className={`flex items-center gap-2 ${
                  s.id === step 
                    ? 'text-blue-600' 
                    : s.id < step 
                      ? 'text-green-600' 
                      : 'text-gray-400'
                }`}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${s.id === step ? 'bg-blue-100' : s.id < step ? 'bg-green-100' : 'bg-gray-100'}
                `}>
                  {s.id < step ? <Check className="w-4 h-4" /> : s.icon}
                </div>
                <div className="hidden md:block">
                  <p className="text-xs font-medium">{s.title}</p>
                  <p className="text-xs text-gray-400">{s.description}</p>
                </div>
                {s.id < steps.length && (
                  <div className="w-8 h-px bg-gray-200 mx-2 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Step 1 - Informações Básicas */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Informações do Produto</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  value={produto.nome}
                  onChange={(e) => updateProduto('nome', e.target.value)}
                  placeholder="Ex: Pizza de Calabresa"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={produto.descricao}
                  onChange={(e) => updateProduto('descricao', e.target.value)}
                  rows={4}
                  placeholder="Descreva o produto em detalhes..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    value={produto.categoria}
                    onChange={(e) => {
                      updateProduto('categoria', e.target.value);
                      updateProduto('subcategoria', '');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Selecione</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subcategoria
                  </label>
                  <select
                    value={produto.subcategoria}
                    onChange={(e) => updateProduto('subcategoria', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    disabled={!produto.categoria}
                  >
                    <option value="">Selecione</option>
                    {produto.categoria && categorias
                      .find(c => c.id === produto.categoria)
                      ?.subcategorias.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 - Preço e Estoque */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Preço e Estoque</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço de Venda *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={produto.preco}
                      onChange={(e) => handlePrecoChange(parseFloat(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço Original (Opcional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={produto.precoOriginal}
                      onChange={(e) => handlePrecoOriginalChange(parseFloat(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {produto.desconto > 0 && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-700">
                    ?? Desconto aplicado: {produto.desconto}% OFF
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade em Estoque
                </label>
                <input
                  type="number"
                  min="0"
                  value={produto.estoque}
                  onChange={(e) => updateProduto('estoque', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Deixe 0 para estoque ilimitado
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 - Imagens */}
        {step === 3 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Imagens do Produto</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagemUpload}
                className="hidden"
                id="imagem-upload"
              />
              <label
                htmlFor="imagem-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-12 h-12 text-gray-400" />
                <p className="text-gray-500">Clique para selecionar imagens</p>
                <p className="text-xs text-gray-400">PNG, JPG até 5MB</p>
              </label>
            </div>

            {produto.imagens.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Imagens adicionadas ({produto.imagens.length})
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {produto.imagens.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Produto ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removerImagem(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4 - Fornecedor */}
        {step === 4 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Dados do Fornecedor</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Fornecedor/Empresa *
                </label>
                <input
                  type="text"
                  value={produto.fornecedorNome}
                  onChange={(e) => updateProduto('fornecedorNome', e.target.value)}
                  placeholder="Ex: Mercado do João"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  value={produto.fornecedorEndereco}
                  onChange={(e) => updateProduto('fornecedorEndereco', e.target.value)}
                  placeholder="Rua, número, bairro, cidade"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={produto.fornecedorTelefone}
                    onChange={(e) => updateProduto('fornecedorTelefone', e.target.value)}
                    placeholder="(75) 99999-9999"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={produto.fornecedorWhatsapp}
                    onChange={(e) => updateProduto('fornecedorWhatsapp', e.target.value)}
                    placeholder="(75) 99999-9999"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={produto.fornecedorEmail}
                  onChange={(e) => updateProduto('fornecedorEmail', e.target.value)}
                  placeholder="contato@empresa.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="mt-4 bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Os dados do fornecedor ficarão bloqueados até o cliente pagar R$0,50
              </p>
            </div>
          </div>
        )}

        {/* Step 5 - Detalhes Adicionais */}
        {step === 5 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Detalhes Adicionais</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={produto.peso}
                    onChange={(e) => updateProduto('peso', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dimensões
                  </label>
                  <input
                    type="text"
                    value={produto.dimensoes}
                    onChange={(e) => updateProduto('dimensoes', e.target.value)}
                    placeholder="Alt x Larg x Comp"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Garantia
                </label>
                <input
                  type="text"
                  value={produto.garantia}
                  onChange={(e) => updateProduto('garantia', e.target.value)}
                  placeholder="Ex: 90 dias, 1 ano"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={produto.observacoes}
                  onChange={(e) => updateProduto('observacoes', e.target.value)}
                  rows={3}
                  placeholder="Informações adicionais para o cliente..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={produto.destaque}
                  onChange={(e) => updateProduto('destaque', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Destacar este produto na home</span>
              </label>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <button
              onClick={stepAnterior}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4 inline mr-1" />
              Voltar
            </button>
          ) : (
            <div />
          )}
          
          {step < steps.length ? (
            <button
              onClick={proximoStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Próximo
              <ChevronRight className="w-4 h-4 inline ml-1" />
            </button>
          ) : (
            <button
              onClick={salvarProduto}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Salvar Produto
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

