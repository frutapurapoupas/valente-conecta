'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Star,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  Phone,
  Mail,
  Briefcase,
  Search,
  Filter,
  X,
  CheckCircle,
  Award,
  Shield,
  MessageCircle,
  Video,
  Scissors,
  Wrench,
  Stethoscope,
  GraduationCap,
  Paintbrush,
  Camera,
  Mic,
  Code,
  BookOpen
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Profissional {
  id: string;
  nome: string;
  foto: string;
  categoria: string;
  subcategoria: string;
  especialidades: string[];
  descricao: string;
  avaliacao: number;
  totalAvaliacoes: number;
  experiencia: number;
  endereco: string;
  cidade: string;
  telefone: string;
  email: string;
  whatsapp: string;
  planos: {
    basico: number;
    premium: number;
  };
  disponibilidade: string[];
  certificacoes: string[];
  destaque: boolean;
  atendimentoOnline: boolean;
  createdAt: Date;
}

interface Agendamento {
  id: string;
  profissionalId: string;
  profissionalNome: string;
  servico: string;
  data: Date;
  horario: string;
  valor: number;
  status: 'pendente' | 'confirmado' | 'realizado' | 'cancelado';
}

const categorias = [
  { id: 'saude', nome: 'Saúde', icon: Stethoscope, cores: 'bg-green-100 text-green-600' },
  { id: 'beleza', nome: 'Beleza', icon: Scissors, cores: 'bg-pink-100 text-pink-600' },
  { id: 'educacao', nome: 'Educação', icon: GraduationCap, cores: 'bg-blue-100 text-blue-600' },
  { id: 'tecnologia', nome: 'Tecnologia', icon: Code, cores: 'bg-purple-100 text-purple-600' },
  { id: 'construcao', nome: 'Construção', icon: Wrench, cores: 'bg-orange-100 text-orange-600' },
  { id: 'arte', nome: 'Arte', icon: Paintbrush, cores: 'bg-red-100 text-red-600' },
  { id: 'fotografia', nome: 'Fotografia', icon: Camera, cores: 'bg-cyan-100 text-cyan-600' },
  { id: 'musica', nome: 'Música', icon: Mic, cores: 'bg-yellow-100 text-yellow-600' }
];

export default function ProfissionaisPage() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [ordenacao, setOrdenacao] = useState('relevancia');
  const [showModalProfissional, setShowModalProfissional] = useState(false);
  const [showModalAgendamento, setShowModalAgendamento] = useState(false);
  const [showModalPlanos, setShowModalPlanos] = useState(false);
  const [selectedProfissional, setSelectedProfissional] = useState<Profissional | null>(null);
  const [selectedPlano, setSelectedPlano] = useState<'basico' | 'premium'>('basico');
  const [formAgendamento, setFormAgendamento] = useState({
    servico: '',
    data: '',
    horario: '',
    observacoes: ''
  });
  const [formProfissional, setFormProfissional] = useState({
    nome: '',
    categoria: '',
    subcategoria: '',
    especialidades: '',
    descricao: '',
    experiencia: 0,
    endereco: '',
    telefone: '',
    email: '',
    whatsapp: '',
    precoBasico: 0,
    precoPremium: 0,
    atendimentoOnline: false,
    destaque: false
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        const mockProfissionais: Profissional[] = [
          {
            id: '1',
            nome: 'Dra. Ana Maria Souza',
            foto: '',
            categoria: 'saude',
            subcategoria: 'Psicologia',
            especialidades: ['Terapia Cognitivo-Comportamental', 'Ansiedade', 'Depressão'],
            descricao: 'Psicóloga clínica com 10 anos de experiência...',
            avaliacao: 4.9,
            totalAvaliacoes: 128,
            experiencia: 10,
            endereco: 'Rua das Flores, 123, Sala 45',
            cidade: 'Valente',
            telefone: '(75) 99999-1111',
            email: 'ana@psicologia.com',
            whatsapp: '(75) 99999-1111',
            planos: { basico: 80, premium: 120 },
            disponibilidade: ['Segunda 14-18h', 'Quarta 9-12h', 'Sexta 14-18h'],
            certificacoes: ['CRP 05/12345', 'Especialista em TCC'],
            destaque: true,
            atendimentoOnline: true,
            createdAt: new Date('2024-05-01')
          },
          {
            id: '2',
            nome: 'Carlos Mendes',
            foto: '',
            categoria: 'beleza',
            subcategoria: 'Cabeleireiro',
            especialidades: ['Corte Masculino', 'Barba', 'Coloração'],
            descricao: 'Cabeleireiro especialista em cortes masculinos...',
            avaliacao: 4.8,
            totalAvaliacoes: 89,
            experiencia: 8,
            endereco: 'Rua da Beleza, 456',
            cidade: 'Valente',
            telefone: '(75) 99999-2222',
            email: 'carlos@beleza.com',
            whatsapp: '(75) 99999-2222',
            planos: { basico: 50, premium: 80 },
            disponibilidade: ['Terça 9-18h', 'Quinta 9-18h', 'Sábado 9-12h'],
            certificacoes: ['Curso Senac Cabeleireiro'],
            destaque: false,
            atendimentoOnline: false,
            createdAt: new Date('2024-05-15')
          }
        ];

        setProfissionais(mockProfissionais);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar profissionais');
      setLoading(false);
    }
  };

  const cadastrarProfissional = async () => {
    if (!formProfissional.nome || !formProfissional.categoria || !formProfissional.telefone) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      const response = await fetch('/api/profissionais', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formProfissional,
          especialidades: formProfissional.especialidades.split(',').map(e => e.trim()),
          valorPlano: selectedPlano === 'basico' ? 15 : 25
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Profissional cadastrado! Plano ${selectedPlano === 'basico' ? 'Básico (R$15/mês)' : 'Premium (R$25/mês)'}`);
        setShowModalProfissional(false);
        setFormProfissional({
          nome: '',
          categoria: '',
          subcategoria: '',
          especialidades: '',
          descricao: '',
          experiencia: 0,
          endereco: '',
          telefone: '',
          email: '',
          whatsapp: '',
          precoBasico: 0,
          precoPremium: 0,
          atendimentoOnline: false,
          destaque: false
        });
        carregarDados();
      } else {
        toast.error('Erro ao cadastrar profissional');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao processar');
    }
  };

  const agendarServico = (profissional: Profissional) => {
    setSelectedProfissional(profissional);
    setShowModalAgendamento(true);
  };

  const confirmarAgendamento = async () => {
    if (!formAgendamento.data || !formAgendamento.horario || !formAgendamento.servico) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      const response = await fetch('/api/profissionais/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profissionalId: selectedProfissional?.id,
          servico: formAgendamento.servico,
          data: formAgendamento.data,
          horario: formAgendamento.horario,
          observacoes: formAgendamento.observacoes,
          valor: selectedPlano === 'basico' ? selectedProfissional?.planos.basico : selectedProfissional?.planos.premium
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Agendamento realizado com sucesso!');
        setShowModalAgendamento(false);
        setFormAgendamento({ servico: '', data: '', horario: '', observacoes: '' });
      } else {
        toast.error('Erro ao realizar agendamento');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao processar');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const profissionaisFiltrados = profissionais.filter(prof => {
    if (busca && !prof.nome.toLowerCase().includes(busca.toLowerCase()) && !prof.especialidades.some(e => e.toLowerCase().includes(busca.toLowerCase()))) return false;
    if (categoriaSelecionada && prof.categoria !== categoriaSelecionada) return false;
    return true;
  }).sort((a, b) => {
    if (ordenacao === 'avaliacao') return b.avaliacao - a.avaliacao;
    if (ordenacao === 'preco_asc') return a.planos.basico - b.planos.basico;
    if (ordenacao === 'experiencia') return b.experiencia - a.experiencia;
    return 0;
  });

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
              <Briefcase className="w-6 h-6 text-blue-600" />
              Profissionais Liberais
            </h1>
            <p className="text-sm text-gray-500">Encontre profissionais qualificados ou anuncie seus serviços</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowModalPlanos(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
            >
              <Award className="w-4 h-4" />
              Ver Planos
            </button>
            <button
              onClick={() => setShowModalProfissional(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <User className="w-4 h-4" />
              Anunciar Serviços
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Profissionais</p>
                <p className="text-2xl font-bold text-gray-800">{profissionais.length}</p>
              </div>
              <User className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avaliação Média</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {(profissionais.reduce((sum, p) => sum + p.avaliacao, 0) / profissionais.length || 0).toFixed(1)}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Atendimento Online</p>
                <p className="text-2xl font-bold text-gray-800">{profissionais.filter(p => p.atendimentoOnline).length}</p>
              </div>
              <Video className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Preço Médio</p>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(profissionais.reduce((sum, p) => sum + p.planos.basico, 0) / profissionais.length || 0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Busca e Filtros */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar profissional ou especialidade..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <select
              value={categoriaSelecionada}
              onChange={(e) => setCategoriaSelecionada(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Todas as categorias</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
            <select
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="relevancia">Relevância</option>
              <option value="avaliacao">Melhor avaliados</option>
              <option value="preco_asc">Menor preço</option>
              <option value="experiencia">Mais experientes</option>
            </select>
          </div>
        </div>

        {/* Categorias */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
          {categorias.map(cat => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoriaSelecionada(categoriaSelecionada === cat.id ? '' : cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  categoriaSelecionada === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.nome}
              </button>
            );
          })}
        </div>

        {/* Lista de Profissionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profissionaisFiltrados.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow p-12 text-center">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600">Nenhum profissional encontrado</h3>
              <p className="text-gray-400 mt-2">Tente ajustar os filtros ou cadastre seus serviços</p>
            </div>
          ) : (
            profissionaisFiltrados.map((prof) => (
              <div key={prof.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="relative p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-gray-800">{prof.nome}</h3>
                          <p className="text-sm text-gray-500">{prof.subcategoria}</p>
                        </div>
                        {prof.destaque && (
                          <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                            Destaque
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-semibold">{prof.avaliacao}</span>
                        </div>
                        <span className="text-xs text-gray-400">({prof.totalAvaliacoes} avaliações)</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{prof.experiencia} anos</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {prof.cidade}
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {prof.especialidades.slice(0, 3).map((esp, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {esp}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <p className="text-xs text-gray-500">A partir de</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(prof.planos.basico)}</p>
                    </div>
                    {prof.atendimentoOnline && (
                      <div className="flex items-center gap-1 text-xs text-purple-600">
                        <Video className="w-4 h-4" />
                        Atendimento Online
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => agendarServico(prof)}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                  >
                    Agendar Serviço
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Cadastro de Profissional */}
      {showModalProfissional && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Anunciar Serviços</h2>
                <button onClick={() => setShowModalProfissional(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    value={formProfissional.nome}
                    onChange={(e) => setFormProfissional({ ...formProfissional, nome: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Categoria *</label>
                    <select
                      value={formProfissional.categoria}
                      onChange={(e) => setFormProfissional({ ...formProfissional, categoria: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Selecione</option>
                      {categorias.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Subcategoria</label>
                    <input
                      type="text"
                      value={formProfissional.subcategoria}
                      onChange={(e) => setFormProfissional({ ...formProfissional, subcategoria: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Especialidades (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={formProfissional.especialidades}
                    onChange={(e) => setFormProfissional({ ...formProfissional, especialidades: e.target.value })}
                    placeholder="Psicologia clínica, Terapia de casal, Ansiedade"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <textarea
                    rows={3}
                    value={formProfissional.descricao}
                    onChange={(e) => setFormProfissional({ ...formProfissional, descricao: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Anos de Experiência</label>
                    <input
                      type="number"
                      value={formProfissional.experiencia}
                      onChange={(e) => setFormProfissional({ ...formProfissional, experiencia: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Endereço</label>
                    <input
                      type="text"
                      value={formProfissional.endereco}
                      onChange={(e) => setFormProfissional({ ...formProfissional, endereco: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Telefone *</label>
                    <input
                      type="tel"
                      value={formProfissional.telefone}
                      onChange={(e) => setFormProfissional({ ...formProfissional, telefone: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">WhatsApp</label>
                    <input
                      type="tel"
                      value={formProfissional.whatsapp}
                      onChange={(e) => setFormProfissional({ ...formProfissional, whatsapp: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">E-mail</label>
                  <input
                    type="email"
                    value={formProfissional.email}
                    onChange={(e) => setFormProfissional({ ...formProfissional, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Preço Plano Básico (R$)</label>
                    <input
                      type="number"
                      value={formProfissional.precoBasico}
                      onChange={(e) => setFormProfissional({ ...formProfissional, precoBasico: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Preço Plano Premium (R$)</label>
                    <input
                      type="number"
                      value={formProfissional.precoPremium}
                      onChange={(e) => setFormProfissional({ ...formProfissional, precoPremium: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formProfissional.atendimentoOnline}
                      onChange={(e) => setFormProfissional({ ...formProfissional, atendimentoOnline: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Atendimento Online</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formProfissional.destaque}
                      onChange={(e) => setFormProfissional({ ...formProfissional, destaque: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Destaque (+R$10/mês)</span>
                  </label>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-700">
                    📢 Planos disponíveis: Básico (R$15/mês) ou Premium (R$25/mês)
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowModalProfissional(false)}
                    className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={cadastrarProfissional}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Cadastrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Agendamento */}
      {showModalAgendamento && selectedProfissional && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Agendar Serviço</h2>
                <button onClick={() => setShowModalAgendamento(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="font-semibold">{selectedProfissional.nome}</p>
                <p className="text-sm text-gray-500">{selectedProfissional.subcategoria}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Serviço *</label>
                  <select
                    value={formAgendamento.servico}
                    onChange={(e) => setFormAgendamento({ ...formAgendamento, servico: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Selecione</option>
                    <option value="basico">Consulta Básica - {formatCurrency(selectedProfissional.planos.basico)}</option>
                    <option value="premium">Consulta Premium - {formatCurrency(selectedProfissional.planos.premium)}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Data *</label>
                  <input
                    type="date"
                    value={formAgendamento.data}
                    onChange={(e) => setFormAgendamento({ ...formAgendamento, data: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Horário *</label>
                  <select
                    value={formAgendamento.horario}
                    onChange={(e) => setFormAgendamento({ ...formAgendamento, horario: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Selecione</option>
                    {selectedProfissional.disponibilidade.map((disp, idx) => (
                      <option key={idx} value={disp}>{disp}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Observações</label>
                  <textarea
                    rows={3}
                    value={formAgendamento.observacoes}
                    onChange={(e) => setFormAgendamento({ ...formAgendamento, observacoes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModalAgendamento(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarAgendamento}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Planos */}
      {showModalPlanos && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Planos para Profissionais</h2>
                <button onClick={() => setShowModalPlanos(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plano Básico */}
                <div className="border rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Plano Básico</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">R$ 15<span className="text-sm font-normal">/mês</span></p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Perfil profissional completo
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Até 5 especialidades
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Agendamento de clientes
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Avaliações dos clientes
                    </li>
                  </ul>
                  <button
                    onClick={() => {
                      setSelectedPlano('basico');
                      setShowModalPlanos(false);
                      setShowModalProfissional(true);
                    }}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Escolher Plano
                  </button>
                </div>

                {/* Plano Premium */}
                <div className="border-2 border-yellow-500 rounded-xl p-6 hover:shadow-lg transition-shadow relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    RECOMENDADO
                  </div>
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Award className="w-8 h-8 text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Plano Premium</h3>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">R$ 25<span className="text-sm font-normal">/mês</span></p>
                  </div>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Todos os benefícios do Básico
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Destaque na busca
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Certificados verificados
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Atendimento prioritário
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Estatísticas avançadas
                    </li>
                  </ul>
                  <button
                    onClick={() => {
                      setSelectedPlano('premium');
                      setShowModalPlanos(false);
                      setShowModalProfissional(true);
                    }}
                    className="w-full py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600"
                  >
                    Escolher Plano
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}