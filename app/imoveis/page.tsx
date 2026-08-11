'use client';

import { useState, useEffect } from 'react';
import {
  Home,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Square,
  Building2,
  Plus,
  Search,
  Filter,
  Eye,
  Phone,
  Mail,
  X,
  CheckCircle,
  Calendar,
  Car,
  TreePine,
  Wifi,
  Coffee,
  Lock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { obterUsuarioLocalId } from '@/lib/usuarioLocal';

interface Imovel {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'casa' | 'apartamento' | 'terreno' | 'comercial';
  operacao: 'venda' | 'aluguel';
  preco: number;
  precoCondominio?: number;
  area: number;
  quartos: number;
  banheiros: number;
  vagas: number;
  endereco: string;
  cidade: string;
  bairro: string;
  imagens: string[];
  caracteristicas: string[];
  contatoNome: string;
  contatoTelefone: string;
  contatoEmail: string;
  dataPublicacao: Date;
  destaque: boolean;
  status: 'disponivel' | 'vendido' | 'alugado';
}

export default function ImoveisPage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [operacaoFilter, setOperacaoFilter] = useState('');
  const [bairroFilter, setBairroFilter] = useState('');
  const [precoMin, setPrecoMin] = useState(0);
  const [precoMax, setPrecoMax] = useState(1000000);
  const [showModalImovel, setShowModalImovel] = useState(false);
  const [showModalContato, setShowModalContato] = useState(false);
  const [selectedImovel, setSelectedImovel] = useState<Imovel | null>(null);
  const [formContato, setFormContato] = useState({
    nome: '',
    telefone: '',
    email: '',
    mensagem: ''
  });
  const [formImovel, setFormImovel] = useState({
    titulo: '',
    descricao: '',
    tipo: 'casa',
    operacao: 'venda',
    preco: 0,
    precoCondominio: 0,
    area: 0,
    quartos: 0,
    banheiros: 0,
    vagas: 0,
    endereco: '',
    cidade: 'Valente',
    bairro: '',
    caracteristicas: '',
    contatoNome: '',
    contatoTelefone: '',
    contatoEmail: '',
    destaque: false
  });

  useEffect(() => {
    carregarImoveis();
  }, []);

  const carregarImoveis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/imoveis');
      const data = await response.json();
      setImoveis(data.success ? data.data : []);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar imóveis');
      setImoveis([]);
    } finally {
      setLoading(false);
    }
  };

  const publicarImovel = async () => {
    if (!formImovel.titulo || !formImovel.descricao || !formImovel.endereco || !formImovel.contatoNome) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      const response = await fetch('/api/imoveis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formImovel,
          caracteristicas: formImovel.caracteristicas.split(',').map(c => c.trim()),
          valorPublicacao: formImovel.operacao === 'venda' ? 50 : 20,
          donoId: obterUsuarioLocalId()
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Imóvel publicado! Valor: R$ ${formImovel.operacao === 'venda' ? '50,00' : '20,00'}`);
        setShowModalImovel(false);
        setFormImovel({
          titulo: '',
          descricao: '',
          tipo: 'casa',
          operacao: 'venda',
          preco: 0,
          precoCondominio: 0,
          area: 0,
          quartos: 0,
          banheiros: 0,
          vagas: 0,
          endereco: '',
          cidade: 'Valente',
          bairro: '',
          caracteristicas: '',
          contatoNome: '',
          contatoTelefone: '',
          contatoEmail: '',
          destaque: false
        });
        carregarImoveis();
      } else {
        toast.error('Erro ao publicar imóvel');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao processar');
    }
  };

  const entrarEmContato = (imovel: Imovel) => {
    setSelectedImovel(imovel);
    setShowModalContato(true);
  };

  const enviarContato = async () => {
    if (!formContato.nome || !formContato.telefone || !formContato.mensagem) {
      toast.error('Preencha nome, telefone e mensagem');
      return;
    }

    try {
      const response = await fetch('/api/imoveis/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imovelId: selectedImovel?.id,
          compradorId: obterUsuarioLocalId(),
          nome: formContato.nome,
          telefone: formContato.telefone,
          email: formContato.email,
          mensagem: formContato.mensagem
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Mensagem enviada! O proprietário entrará em contato');
        setShowModalContato(false);
        setFormContato({ nome: '', telefone: '', email: '', mensagem: '' });
      } else {
        toast.error('Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao enviar mensagem');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'casa': return <Home className="w-5 h-5" />;
      case 'apartamento': return <Building2 className="w-5 h-5" />;
      case 'terreno': return <TreePine className="w-5 h-5" />;
      default: return <Building2 className="w-5 h-5" />;
    }
  };

  const imoveisFiltrados = imoveis.filter(imovel => {
    if (imovel.status !== 'disponivel') return false;
    if (busca && !imovel.titulo.toLowerCase().includes(busca.toLowerCase()) && !imovel.bairro.toLowerCase().includes(busca.toLowerCase())) return false;
    if (tipoFilter && imovel.tipo !== tipoFilter) return false;
    if (operacaoFilter && imovel.operacao !== operacaoFilter) return false;
    if (bairroFilter && imovel.bairro !== bairroFilter) return false;
    if (imovel.preco < precoMin || imovel.preco > precoMax) return false;
    return true;
  });

  const bairrosUnicos = Array.from(new Set(imoveis.map(i => i.bairro)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Home className="w-6 h-6 text-blue-600" />
              Imóveis
            </h1>
            <p className="text-sm text-gray-500">Encontre o imóvel ideal ou anuncie o seu</p>
          </div>
          <button
            onClick={() => setShowModalImovel(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Anunciar Imóvel
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Imóveis Disponíveis</p>
                <p className="text-2xl font-bold text-gray-800">{imoveis.filter(i => i.status === 'disponivel').length}</p>
              </div>
              <Home className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Para Venda</p>
                <p className="text-2xl font-bold text-gray-800">{imoveis.filter(i => i.operacao === 'venda' && i.status === 'disponivel').length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Para Alugar</p>
                <p className="text-2xl font-bold text-gray-800">{imoveis.filter(i => i.operacao === 'aluguel' && i.status === 'disponivel').length}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Preço Médio</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(imoveis.reduce((sum, i) => sum + i.preco, 0) / imoveis.length || 0)}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Busca e Filtros */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por título ou bairro..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Todos os tipos</option>
              <option value="casa">Casa</option>
              <option value="apartamento">Apartamento</option>
              <option value="terreno">Terreno</option>
              <option value="comercial">Comercial</option>
            </select>
            <select
              value={operacaoFilter}
              onChange={(e) => setOperacaoFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Venda ou Aluguel</option>
              <option value="venda">Venda</option>
              <option value="aluguel">Aluguel</option>
            </select>
            <select
              value={bairroFilter}
              onChange={(e) => setBairroFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Todos os bairros</option>
              {bairrosUnicos.map(bairro => (
                <option key={bairro} value={bairro}>{bairro}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
              <input
                type="number"
                placeholder="Preço mínimo"
                value={precoMin}
                onChange={(e) => setPrecoMin(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
              <input
                type="number"
                placeholder="Preço máximo"
                value={precoMax}
                onChange={(e) => setPrecoMax(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Lista de Imóveis */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {imoveisFiltrados.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
              <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600">Nenhum imóvel encontrado</h3>
              <p className="text-gray-400 mt-2">Tente ajustar os filtros ou anuncie seu imóvel</p>
            </div>
          ) : (
            imoveisFiltrados.map((imovel) => (
              <div key={imovel.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                {/* Imagem */}
                <div className="relative h-48 bg-gray-200">
                  {imovel.imagens.length > 0 ? (
                    <img src={imovel.imagens[0]} alt={imovel.titulo} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getTipoIcon(imovel.tipo)}
                    </div>
                  )}
                  {imovel.destaque && (
                    <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Destaque
                    </span>
                  )}
                  <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold text-white ${imovel.operacao === 'venda' ? 'bg-green-600' : 'bg-blue-600'}`}>
                    {imovel.operacao === 'venda' ? 'VENDA' : 'ALUGUEL'}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">{imovel.titulo}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                    <MapPin className="w-4 h-4" />
                    {imovel.bairro}, {imovel.cidade}
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-3 text-sm">
                      {imovel.quartos > 0 && (
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4 text-gray-400" />
                          <span>{imovel.quartos}</span>
                        </div>
                      )}
                      {imovel.banheiros > 0 && (
                        <div className="flex items-center gap-1">
                          <Bath className="w-4 h-4 text-gray-400" />
                          <span>{imovel.banheiros}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Square className="w-4 h-4 text-gray-400" />
                        <span>{imovel.area}m²</span>
                      </div>
                      {imovel.vagas > 0 && (
                        <div className="flex items-center gap-1">
                          <Car className="w-4 h-4 text-gray-400" />
                          <span>{imovel.vagas}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(imovel.preco)}</p>
                    {imovel.operacao === 'aluguel' && imovel.precoCondominio && (
                      <p className="text-xs text-gray-500">+ Condomínio {formatCurrency(imovel.precoCondominio)}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {imovel.caracteristicas.slice(0, 3).map((car, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {car}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => entrarEmContato(imovel)}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                  >
                    Tenho Interesse
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Anunciar Imóvel */}
      {showModalImovel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Anunciar Imóvel</h2>
                <button onClick={() => setShowModalImovel(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título do Anúncio *</label>
                  <input
                    type="text"
                    value={formImovel.titulo}
                    onChange={(e) => setFormImovel({ ...formImovel, titulo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descrição *</label>
                  <textarea
                    rows={3}
                    value={formImovel.descricao}
                    onChange={(e) => setFormImovel({ ...formImovel, descricao: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo</label>
                    <select
                      value={formImovel.tipo}
                      onChange={(e) => setFormImovel({ ...formImovel, tipo: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="casa">Casa</option>
                      <option value="apartamento">Apartamento</option>
                      <option value="terreno">Terreno</option>
                      <option value="comercial">Comercial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Operação</label>
                    <select
                      value={formImovel.operacao}
                      onChange={(e) => setFormImovel({ ...formImovel, operacao: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="venda">Venda (R$50,00)</option>
                      <option value="aluguel">Aluguel (R$20,00)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Preço</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                      <input
                        type="number"
                        value={formImovel.preco}
                        onChange={(e) => setFormImovel({ ...formImovel, preco: parseFloat(e.target.value) })}
                        className="w-full pl-8 pr-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                  {formImovel.operacao === 'aluguel' && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Condomínio</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                        <input
                          type="number"
                          value={formImovel.precoCondominio}
                          onChange={(e) => setFormImovel({ ...formImovel, precoCondominio: parseFloat(e.target.value) })}
                          className="w-full pl-8 pr-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Área (m²)</label>
                    <input
                      type="number"
                      value={formImovel.area}
                      onChange={(e) => setFormImovel({ ...formImovel, area: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Quartos</label>
                    <input
                      type="number"
                      value={formImovel.quartos}
                      onChange={(e) => setFormImovel({ ...formImovel, quartos: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Banheiros</label>
                    <input
                      type="number"
                      value={formImovel.banheiros}
                      onChange={(e) => setFormImovel({ ...formImovel, banheiros: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Vagas</label>
                    <input
                      type="number"
                      value={formImovel.vagas}
                      onChange={(e) => setFormImovel({ ...formImovel, vagas: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Endereço *</label>
                  <input
                    type="text"
                    value={formImovel.endereco}
                    onChange={(e) => setFormImovel({ ...formImovel, endereco: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Bairro</label>
                    <input
                      type="text"
                      value={formImovel.bairro}
                      onChange={(e) => setFormImovel({ ...formImovel, bairro: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Cidade</label>
                    <input
                      type="text"
                      value={formImovel.cidade}
                      onChange={(e) => setFormImovel({ ...formImovel, cidade: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Características (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={formImovel.caracteristicas}
                    onChange={(e) => setFormImovel({ ...formImovel, caracteristicas: e.target.value })}
                    placeholder="Piscina, Churrasqueira, Jardim"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome para contato *</label>
                    <input
                      type="text"
                      value={formImovel.contatoNome}
                      onChange={(e) => setFormImovel({ ...formImovel, contatoNome: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Telefone *</label>
                    <input
                      type="tel"
                      value={formImovel.contatoTelefone}
                      onChange={(e) => setFormImovel({ ...formImovel, contatoTelefone: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">E-mail</label>
                  <input
                    type="email"
                    value={formImovel.contatoEmail}
                    onChange={(e) => setFormImovel({ ...formImovel, contatoEmail: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formImovel.destaque}
                    onChange={(e) => setFormImovel({ ...formImovel, destaque: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Destaque o anúncio (+R$30,00)</span>
                </label>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-700">
                    ?? Valor da publicação: 
                    {formImovel.operacao === 'venda' ? ' R$50,00' : ' R$20,00'}
                    {formImovel.destaque && ' + R$30,00 (destaque)'}
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowModalImovel(false)}
                    className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={publicarImovel}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Publicar Anúncio
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Contato */}
      {showModalContato && selectedImovel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Tenho Interesse</h2>
                <button onClick={() => setShowModalContato(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-semibold">{selectedImovel.titulo}</p>
                <p className="text-sm text-gray-500">{selectedImovel.bairro}, {selectedImovel.cidade}</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(selectedImovel.preco)}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Seu Nome *</label>
                  <input
                    type="text"
                    value={formContato.nome}
                    onChange={(e) => setFormContato({ ...formContato, nome: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Telefone *</label>
                  <input
                    type="tel"
                    value={formContato.telefone}
                    onChange={(e) => setFormContato({ ...formContato, telefone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">E-mail</label>
                  <input
                    type="email"
                    value={formContato.email}
                    onChange={(e) => setFormContato({ ...formContato, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mensagem *</label>
                  <textarea
                    rows={3}
                    value={formContato.mensagem}
                    onChange={(e) => setFormContato({ ...formContato, mensagem: e.target.value })}
                    placeholder="Gostaria de mais informações sobre este imóvel..."
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModalContato(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={enviarContato}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Enviar Mensagem
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

