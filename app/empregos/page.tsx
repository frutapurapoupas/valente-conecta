'use client';

import { useState, useEffect } from 'react';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  GraduationCap,
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Calendar,
  Phone,
  Mail,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Award
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Vaga {
  id: string;
  titulo: string;
  empresa: string;
  logo: string;
  local: string;
  tipo: 'CLT' | 'PJ' | 'Freelancer' | 'Temporario';
  modalidade: 'Presencial' | 'Remoto' | 'Hibrido';
  salario: number;
  descricao: string;
  requisitos: string[];
  beneficios: string[];
  dataPublicacao: Date;
  dataLimite: Date;
  vagas: number;
  status: 'ativa' | 'pausada' | 'encerrada';
  contatoEmail: string;
  contatoTelefone: string;
}

interface Candidatura {
  id: string;
  vagaId: string;
  vagaTitulo: string;
  empresa: string;
  nome: string;
  telefone: string;
  email: string;
  experiencia: string;
  data: Date;
  status: 'pendente' | 'analisando' | 'aprovado' | 'reprovado';
}

interface Curriculo {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  endereco: string;
  experiencia: string[];
  formacao: string[];
  habilidades: string[];
  pretensaoSalarial: number;
  disponibilidade: string;
  dataCadastro: Date;
}

export default function EmpregosPage() {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [candidaturas, setCandidaturas] = useState<Candidatura[]>([]);
  const [curriculos, setCurriculos] = useState<Curriculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [modalidadeFilter, setModalidadeFilter] = useState('');
  const [showModalVaga, setShowModalVaga] = useState(false);
  const [showModalCurriculo, setShowModalCurriculo] = useState(false);
  const [showModalCandidatura, setShowModalCandidatura] = useState(false);
  const [selectedVaga, setSelectedVaga] = useState<Vaga | null>(null);
  const [tipoPlano, setTipoPlano] = useState<'curriculo' | 'vaga'>('curriculo');
  const [formVaga, setFormVaga] = useState({
    titulo: '',
    empresa: '',
    local: '',
    tipo: 'CLT',
    modalidade: 'Presencial',
    salario: 0,
    descricao: '',
    requisitos: '',
    beneficios: '',
    vagas: 1,
    contatoEmail: '',
    contatoTelefone: '',
    dataLimite: ''
  });
  const [formCurriculo, setFormCurriculo] = useState({
    nome: '',
    telefone: '',
    email: '',
    endereco: '',
    experiencia: '',
    formacao: '',
    habilidades: '',
    pretensaoSalarial: 0,
    disponibilidade: ''
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        const mockVagas: Vaga[] = [
          {
            id: '1',
            titulo: 'Desenvolvedor Full Stack',
            empresa: 'Tech Solutions',
            logo: '',
            local: 'Valente, BA (Remoto)',
            tipo: 'CLT',
            modalidade: 'Remoto',
            salario: 5000,
            descricao: 'Desenvolvimento de sistemas web e mobile...',
            requisitos: ['React', 'Node.js', 'TypeScript', 'Banco de dados'],
            beneficios: ['Vale alimentação', 'Plano de saúde', 'Home office'],
            dataPublicacao: new Date('2024-06-01'),
            dataLimite: new Date('2024-07-01'),
            vagas: 2,
            status: 'ativa',
            contatoEmail: 'rh@techsolutions.com',
            contatoTelefone: '(75) 99999-1111'
          },
          {
            id: '2',
            titulo: 'Vendedor',
            empresa: 'Supermercado Central',
            logo: '',
            local: 'Centro, Valente/BA',
            tipo: 'CLT',
            modalidade: 'Presencial',
            salario: 1800,
            descricao: 'Atendimento ao cliente, reposição de estoque...',
            requisitos: ['Ensino médio completo', 'Experiência em vendas'],
            beneficios: ['Vale transporte', 'Comissão'],
            dataPublicacao: new Date('2024-06-05'),
            dataLimite: new Date('2024-06-30'),
            vagas: 3,
            status: 'ativa',
            contatoEmail: 'rh@supermercadocentral.com',
            contatoTelefone: '(75) 99999-2222'
          }
        ];

        const mockCandidaturas: Candidatura[] = [
          {
            id: '1',
            vagaId: '1',
            vagaTitulo: 'Desenvolvedor Full Stack',
            empresa: 'Tech Solutions',
            nome: 'João Silva',
            telefone: '(75) 99999-3333',
            email: 'joao@email.com',
            experiencia: '5 anos com desenvolvimento web',
            data: new Date('2024-06-02'),
            status: 'analisando'
          }
        ];

        const mockCurriculos: Curriculo[] = [
          {
            id: '1',
            nome: 'João Silva',
            telefone: '(75) 99999-3333',
            email: 'joao@email.com',
            endereco: 'Rua A, 123 - Centro',
            experiencia: ['Desenvolvedor Pleno - 2 anos', 'Desenvolvedor Junior - 3 anos'],
            formacao: ['Bacharel em Ciência da Computação - UFBA'],
            habilidades: ['React', 'Node.js', 'TypeScript'],
            pretensaoSalarial: 5000,
            disponibilidade: 'Imediata',
            dataCadastro: new Date('2024-06-01')
          }
        ];

        setVagas(mockVagas);
        setCandidaturas(mockCandidaturas);
        setCurriculos(mockCurriculos);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar dados');
      setLoading(false);
    }
  };

  const publicarVaga = async () => {
    if (!formVaga.titulo || !formVaga.empresa || !formVaga.descricao) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      const response = await fetch('/api/empregos/vagas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formVaga,
          requisitos: formVaga.requisitos.split(',').map(r => r.trim()),
          beneficios: formVaga.beneficios.split(',').map(b => b.trim()),
          tipoPlano: 'vaga',
          valor: 20.00
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Vaga publicada com sucesso!');
        setShowModalVaga(false);
        setFormVaga({
          titulo: '',
          empresa: '',
          local: '',
          tipo: 'CLT',
          modalidade: 'Presencial',
          salario: 0,
          descricao: '',
          requisitos: '',
          beneficios: '',
          vagas: 1,
          contatoEmail: '',
          contatoTelefone: '',
          dataLimite: ''
        });
        carregarDados();
      } else {
        toast.error('Erro ao publicar vaga');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao processar pagamento');
    }
  };

  const cadastrarCurriculo = async () => {
    if (!formCurriculo.nome || !formCurriculo.telefone || !formCurriculo.email) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      const response = await fetch('/api/empregos/curriculos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formCurriculo,
          experiencia: formCurriculo.experiencia.split('\n').filter(e => e.trim()),
          formacao: formCurriculo.formacao.split('\n').filter(f => f.trim()),
          habilidades: formCurriculo.habilidades.split(',').map(h => h.trim()),
          tipoPlano: 'curriculo',
          valor: 10.00
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Currículo cadastrado com sucesso!');
        setShowModalCurriculo(false);
        setFormCurriculo({
          nome: '',
          telefone: '',
          email: '',
          endereco: '',
          experiencia: '',
          formacao: '',
          habilidades: '',
          pretensaoSalarial: 0,
          disponibilidade: ''
        });
        carregarDados();
      } else {
        toast.error('Erro ao cadastrar currículo');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao processar pagamento');
    }
  };

  const candidatar = (vaga: Vaga) => {
    setSelectedVaga(vaga);
    setShowModalCandidatura(true);
  };

  const enviarCandidatura = async () => {
    if (!selectedVaga) return;

    try {
      const response = await fetch('/api/empregos/candidaturas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vagaId: selectedVaga.id,
          nome: formCurriculo.nome,
          telefone: formCurriculo.telefone,
          email: formCurriculo.email,
          experiencia: formCurriculo.experiencia
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Candidatura enviada com sucesso!');
        setShowModalCandidatura(false);
        carregarDados();
      } else {
        toast.error('Erro ao enviar candidatura');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao enviar candidatura');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const vagasFiltradas = vagas.filter(vaga => {
    if (vaga.status !== 'ativa') return false;
    if (busca && !vaga.titulo.toLowerCase().includes(busca.toLowerCase()) && !vaga.empresa.toLowerCase().includes(busca.toLowerCase())) return false;
    if (tipoFilter && vaga.tipo !== tipoFilter) return false;
    if (modalidadeFilter && vaga.modalidade !== modalidadeFilter) return false;
    return true;
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
              Empregos
            </h1>
            <p className="text-sm text-gray-500">Encontre a vaga ideal ou divulgue sua empresa</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setTipoPlano('curriculo');
                setShowModalCurriculo(true);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
            >
              <FileText className="w-4 h-4" />
              Cadastrar Currículo - R$10
            </button>
            <button
              onClick={() => {
                setTipoPlano('vaga');
                setShowModalVaga(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Publicar Vaga - R$20
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Vagas Ativas</p>
                <p className="text-2xl font-bold text-gray-800">{vagas.filter(v => v.status === 'ativa').length}</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Candidaturas</p>
                <p className="text-2xl font-bold text-gray-800">{candidaturas.length}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Currículos Cadastrados</p>
                <p className="text-2xl font-bold text-gray-800">{curriculos.length}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Salário Médio</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(vagas.reduce((sum, v) => sum + v.salario, 0) / vagas.length || 0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Busca e Filtros */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar vaga ou empresa..."
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
              <option value="CLT">CLT</option>
              <option value="PJ">PJ</option>
              <option value="Freelancer">Freelancer</option>
              <option value="Temporario">Temporário</option>
            </select>
            <select
              value={modalidadeFilter}
              onChange={(e) => setModalidadeFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Todas as modalidades</option>
              <option value="Presencial">Presencial</option>
              <option value="Remoto">Remoto</option>
              <option value="Hibrido">Híbrido</option>
            </select>
            <button
              onClick={() => {
                setBusca('');
                setTipoFilter('');
                setModalidadeFilter('');
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm"
            >
              Limpar filtros
            </button>
          </div>
        </div>

        {/* Lista de Vagas */}
        <div className="space-y-4">
          {vagasFiltradas.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600">Nenhuma vaga encontrada</h3>
              <p className="text-gray-400 mt-2">Tente ajustar os filtros ou publique uma vaga</p>
            </div>
          ) : (
            vagasFiltradas.map((vaga) => (
              <div key={vaga.id} className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-gray-500" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-800">{vaga.titulo}</h2>
                        <p className="text-gray-600">{vaga.empresa}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                      <div className="flex items-center gap-1 text-gray-500">
                        <MapPin className="w-4 h-4" />
                        {vaga.local}
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Briefcase className="w-4 h-4" />
                        {vaga.tipo}
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <DollarSign className="w-4 h-4" />
                        {formatCurrency(vaga.salario)}
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-4 h-4" />
                        Até {formatDate(vaga.dataLimite)}
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{vaga.descricao}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {vaga.requisitos.slice(0, 3).map((req, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {req}
                        </span>
                      ))}
                      {vaga.requisitos.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{vaga.requisitos.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        {vaga.vagas} vaga(s)
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[120px]">
                    <button
                      onClick={() => candidatar(vaga)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700"
                    >
                      Candidatar-se
                    </button>
                    <button
                      onClick={() => {
                        setSelectedVaga(vaga);
                        setShowModalCandidatura(true);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50"
                    >
                      Ver detalhes
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Publicar Vaga */}
      {showModalVaga && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Publicar Vaga - R$20,00</h2>
                <button onClick={() => setShowModalVaga(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Título da Vaga *</label>
                    <input
                      type="text"
                      value={formVaga.titulo}
                      onChange={(e) => setFormVaga({ ...formVaga, titulo: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Empresa *</label>
                    <input
                      type="text"
                      value={formVaga.empresa}
                      onChange={(e) => setFormVaga({ ...formVaga, empresa: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Local</label>
                  <input
                    type="text"
                    value={formVaga.local}
                    onChange={(e) => setFormVaga({ ...formVaga, local: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo</label>
                    <select
                      value={formVaga.tipo}
                      onChange={(e) => setFormVaga({ ...formVaga, tipo: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="CLT">CLT</option>
                      <option value="PJ">PJ</option>
                      <option value="Freelancer">Freelancer</option>
                      <option value="Temporario">Temporário</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Modalidade</label>
                    <select
                      value={formVaga.modalidade}
                      onChange={(e) => setFormVaga({ ...formVaga, modalidade: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="Presencial">Presencial</option>
                      <option value="Remoto">Remoto</option>
                      <option value="Hibrido">Híbrido</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Salário</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                      <input
                        type="number"
                        value={formVaga.salario}
                        onChange={(e) => setFormVaga({ ...formVaga, salario: parseFloat(e.target.value) })}
                        className="w-full pl-8 pr-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Número de Vagas</label>
                    <input
                      type="number"
                      min="1"
                      value={formVaga.vagas}
                      onChange={(e) => setFormVaga({ ...formVaga, vagas: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descrição *</label>
                  <textarea
                    rows={4}
                    value={formVaga.descricao}
                    onChange={(e) => setFormVaga({ ...formVaga, descricao: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Requisitos (separados por vírgula)</label>
                  <input
                    type="text"
                    value={formVaga.requisitos}
                    onChange={(e) => setFormVaga({ ...formVaga, requisitos: e.target.value })}
                    placeholder="React, Node.js, TypeScript"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Benefícios (separados por vírgula)</label>
                  <input
                    type="text"
                    value={formVaga.beneficios}
                    onChange={(e) => setFormVaga({ ...formVaga, beneficios: e.target.value })}
                    placeholder="Vale alimentação, Plano de saúde"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">E-mail para contato</label>
                    <input
                      type="email"
                      value={formVaga.contatoEmail}
                      onChange={(e) => setFormVaga({ ...formVaga, contatoEmail: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Telefone para contato</label>
                    <input
                      type="tel"
                      value={formVaga.contatoTelefone}
                      onChange={(e) => setFormVaga({ ...formVaga, contatoTelefone: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Data Limite</label>
                  <input
                    type="date"
                    value={formVaga.dataLimite}
                    onChange={(e) => setFormVaga({ ...formVaga, dataLimite: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    ⚠️ Valor da publicação: R$20,00 - Válido por 30 dias
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowModalVaga(false)}
                    className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={publicarVaga}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Publicar (R$20,00)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cadastrar Currículo */}
      {showModalCurriculo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Cadastrar Currículo - R$10,00</h2>
                <button onClick={() => setShowModalCurriculo(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      value={formCurriculo.nome}
                      onChange={(e) => setFormCurriculo({ ...formCurriculo, nome: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Telefone *</label>
                    <input
                      type="tel"
                      value={formCurriculo.telefone}
                      onChange={(e) => setFormCurriculo({ ...formCurriculo, telefone: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">E-mail *</label>
                    <input
                      type="email"
                      value={formCurriculo.email}
                      onChange={(e) => setFormCurriculo({ ...formCurriculo, email: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Endereço</label>
                    <input
                      type="text"
                      value={formCurriculo.endereco}
                      onChange={(e) => setFormCurriculo({ ...formCurriculo, endereco: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Experiência Profissional (uma por linha)</label>
                  <textarea
                    rows={3}
                    value={formCurriculo.experiencia}
                    onChange={(e) => setFormCurriculo({ ...formCurriculo, experiencia: e.target.value })}
                    placeholder="Desenvolvedor Pleno - Empresa X (2022-2024)"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Formação Acadêmica (uma por linha)</label>
                  <textarea
                    rows={2}
                    value={formCurriculo.formacao}
                    onChange={(e) => setFormCurriculo({ ...formCurriculo, formacao: e.target.value })}
                    placeholder="Bacharel em Ciência da Computação - UFBA"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Habilidades (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={formCurriculo.habilidades}
                    onChange={(e) => setFormCurriculo({ ...formCurriculo, habilidades: e.target.value })}
                    placeholder="React, Node.js, TypeScript"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Pretensão Salarial</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                      <input
                        type="number"
                        value={formCurriculo.pretensaoSalarial}
                        onChange={(e) => setFormCurriculo({ ...formCurriculo, pretensaoSalarial: parseFloat(e.target.value) })}
                        className="w-full pl-8 pr-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Disponibilidade</label>
                    <select
                      value={formCurriculo.disponibilidade}
                      onChange={(e) => setFormCurriculo({ ...formCurriculo, disponibilidade: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="">Selecione</option>
                      <option value="Imediata">Imediata</option>
                      <option value="15 dias">15 dias</option>
                      <option value="30 dias">30 dias</option>
                    </select>
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-700">
                    ✅ Valor do cadastro: R$10,00 - Válido por 30 dias
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowModalCurriculo(false)}
                    className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={cadastrarCurriculo}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Cadastrar (R$10,00)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Candidatura */}
      {showModalCandidatura && selectedVaga && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Candidatar-se</h2>
                <button onClick={() => setShowModalCandidatura(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="font-semibold">{selectedVaga.titulo}</p>
                <p className="text-sm text-gray-500">{selectedVaga.empresa}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Seu Nome</label>
                  <input
                    type="text"
                    value={formCurriculo.nome}
                    onChange={(e) => setFormCurriculo({ ...formCurriculo, nome: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={formCurriculo.telefone}
                    onChange={(e) => setFormCurriculo({ ...formCurriculo, telefone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">E-mail</label>
                  <input
                    type="email"
                    value={formCurriculo.email}
                    onChange={(e) => setFormCurriculo({ ...formCurriculo, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mensagem/Observações</label>
                  <textarea
                    rows={3}
                    value={formCurriculo.experiencia}
                    onChange={(e) => setFormCurriculo({ ...formCurriculo, experiencia: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModalCandidatura(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={enviarCandidatura}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Enviar Candidatura
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}