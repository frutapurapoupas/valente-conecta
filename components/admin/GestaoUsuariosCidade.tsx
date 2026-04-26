// components/admin/GestaoUsuariosCidade.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Ban,
  Shield,
  UserCheck,
  UserX,
  MoreVertical,
  Eye,
  Mail,
  Phone,
  Calendar,
  Activity,
  AlertTriangle
} from 'lucide-react';

interface UsuarioCidade {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  tipo: 'usuario' | 'profissional' | 'empresa' | 'admin';
  status: 'ativo' | 'inativo' | 'bloqueado' | 'pendente';
  dataCadastro: Date;
  ultimoAcesso?: Date;
  totalVisitas: number;
  totalCompras: number;
  totalAvaliacoes: number;
  verificado: boolean;
}

interface GestaoUsuariosCidadeProps {
  cidadeSelecionada: string;
  onUsuarioSelecionado?: (usuario: UsuarioCidade) => void;
}

export function GestaoUsuariosCidade({ cidadeSelecionada, onUsuarioSelecionado }: GestaoUsuariosCidadeProps) {
  const [usuarios, setUsuarios] = useState<UsuarioCidade[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<UsuarioCidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<UsuarioCidade | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Mock data
  useEffect(() => {
    const mockUsuarios: UsuarioCidade[] = [
      {
        id: '1',
        nome: 'João Silva',
        email: 'joao.silva@email.com',
        telefone: '(75) 98888-1111',
        cidade: 'Valente',
        tipo: 'usuario',
        status: 'ativo',
        dataCadastro: new Date(2024, 0, 15),
        ultimoAcesso: new Date(2024, 3, 23, 14, 30),
        totalVisitas: 45,
        totalCompras: 12,
        totalAvaliacoes: 5,
        verificado: true,
      },
      {
        id: '2',
        nome: 'Maria Santos',
        email: 'maria.santos@email.com',
        telefone: '(75) 97777-2222',
        cidade: 'Valente',
        tipo: 'profissional',
        status: 'ativo',
        dataCadastro: new Date(2024, 1, 10),
        ultimoAcesso: new Date(2024, 3, 24, 9, 15),
        totalVisitas: 128,
        totalCompras: 0,
        totalAvaliacoes: 23,
        verificado: true,
      },
      {
        id: '3',
        nome: 'Empresa ABC Ltda',
        email: 'contato@abc.com',
        telefone: '(75) 96666-3333',
        cidade: 'Valente',
        tipo: 'empresa',
        status: 'ativo',
        dataCadastro: new Date(2024, 2, 5),
        ultimoAcesso: new Date(2024, 3, 22, 11, 0),
        totalVisitas: 89,
        totalCompras: 0,
        totalAvaliacoes: 8,
        verificado: true,
      },
      {
        id: '4',
        nome: 'Carlos Oliveira',
        email: 'carlos.oliveira@email.com',
        telefone: '(75) 95555-4444',
        cidade: 'Santa Luiz',
        tipo: 'usuario',
        status: 'bloqueado',
        dataCadastro: new Date(2024, 2, 20),
        ultimoAcesso: new Date(2024, 3, 10, 16, 45),
        totalVisitas: 23,
        totalCompras: 3,
        totalAvaliacoes: 2,
        verificado: false,
      },
      {
        id: '5',
        nome: 'Ana Costa',
        email: 'ana.costa@email.com',
        telefone: '(75) 94444-5555',
        cidade: 'Conceição do Coité',
        tipo: 'usuario',
        status: 'pendente',
        dataCadastro: new Date(2024, 3, 1),
        totalVisitas: 12,
        totalCompras: 0,
        totalAvaliacoes: 0,
        verificado: false,
      },
    ];
    setUsuarios(mockUsuarios);
    setFilteredUsuarios(mockUsuarios);
    setLoading(false);
  }, [cidadeSelecionada]);

  // Filtrar usuários
  useEffect(() => {
    let filtered = usuarios.filter(u => u.cidade === cidadeSelecionada);
    
    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.telefone.includes(searchTerm)
      );
    }
    
    if (filtroTipo !== 'todos') {
      filtered = filtered.filter(u => u.tipo === filtroTipo);
    }
    
    if (filtroStatus !== 'todos') {
      filtered = filtered.filter(u => u.status === filtroStatus);
    }
    
    setFilteredUsuarios(filtered);
  }, [usuarios, cidadeSelecionada, searchTerm, filtroTipo, filtroStatus]);

  const alterarStatus = (usuarioId: string, novoStatus: UsuarioCidade['status']) => {
    setUsuarios(prev =>
      prev.map(u =>
        u.id === usuarioId ? { ...u, status: novoStatus } : u
      )
    );
    alert(`Status do usuário alterado para ${novoStatus}`);
  };

  const verificarUsuario = (usuarioId: string) => {
    setUsuarios(prev =>
      prev.map(u =>
        u.id === usuarioId ? { ...u, verificado: true } : u
      )
    );
    alert('Usuário verificado com sucesso!');
  };

  const getTipoIcone = (tipo: string) => {
    switch (tipo) {
      case 'usuario': return <Users size={16} className="text-blue-500" />;
      case 'profissional': return <Shield size={16} className="text-green-500" />;
      case 'empresa': return <Activity size={16} className="text-purple-500" />;
      case 'admin': return <Shield size={16} className="text-red-500" />;
      default: return <Users size={16} />;
    }
  };

  const getStatusCor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-700';
      case 'inativo': return 'bg-gray-100 text-gray-700';
      case 'bloqueado': return 'bg-red-100 text-red-700';
      case 'pendente': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100';
    }
  };

  const getStatusTexto = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'inativo': return 'Inativo';
      case 'bloqueado': return 'Bloqueado';
      case 'pendente': return 'Pendente';
      default: return status;
    }
  };

  const getTipoTexto = (tipo: string) => {
    switch (tipo) {
      case 'usuario': return 'Usuário Comum';
      case 'profissional': return 'Profissional';
      case 'empresa': return 'Empresa';
      case 'admin': return 'Administrador';
      default: return tipo;
    }
  };

  const formatarData = (data?: Date) => {
    if (!data) return 'Nunca';
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatarHorario = (data?: Date) => {
    if (!data) return '';
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const estatisticas = {
    total: filteredUsuarios.length,
    ativos: filteredUsuarios.filter(u => u.status === 'ativo').length,
    pendentes: filteredUsuarios.filter(u => u.status === 'pendente').length,
    bloqueados: filteredUsuarios.filter(u => u.status === 'bloqueado').length,
    usuarios: filteredUsuarios.filter(u => u.tipo === 'usuario').length,
    profissionais: filteredUsuarios.filter(u => u.tipo === 'profissional').length,
    empresas: filteredUsuarios.filter(u => u.tipo === 'empresa').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-600">Total</p>
          <p className="text-2xl font-bold text-blue-700">{estatisticas.total}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-600">Ativos</p>
          <p className="text-2xl font-bold text-green-700">{estatisticas.ativos}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <p className="text-sm text-yellow-600">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-700">{estatisticas.pendentes}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-sm text-red-600">Bloqueados</p>
          <p className="text-2xl font-bold text-red-700">{estatisticas.bloqueados}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-purple-600">Profissionais/Empresas</p>
          <p className="text-2xl font-bold text-purple-700">{estatisticas.profissionais + estatisticas.empresas}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos os tipos</option>
            <option value="usuario">Usuários</option>
            <option value="profissional">Profissionais</option>
            <option value="empresa">Empresas</option>
          </select>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos os status</option>
            <option value="ativo">Ativos</option>
            <option value="pendente">Pendentes</option>
            <option value="inativo">Inativos</option>
            <option value="bloqueado">Bloqueados</option>
          </select>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Usuário</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Contato</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Tipo</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Atividade</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsuarios.map(usuario => (
                <tr key={usuario.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-gray-800">{usuario.nome}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin size={12} className="text-gray-400" />
                        <p className="text-xs text-gray-500">{usuario.cidade}</p>
                        {usuario.verificado && (
                          <CheckCircle size={12} className="text-green-500 ml-1" />
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm">{usuario.email}</p>
                    <p className="text-xs text-gray-500">{usuario.telefone}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getTipoIcone(usuario.tipo)}
                      <span className="text-sm">{getTipoTexto(usuario.tipo)}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusCor(usuario.status)}`}>
                      {getStatusTexto(usuario.status)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar size={12} />
                        Cadastro: {formatarData(usuario.dataCadastro)}
                      </div>
                      {usuario.ultimoAcesso && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Activity size={12} />
                          Último acesso: {formatarData(usuario.ultimoAcesso)} às {formatarHorario(usuario.ultimoAcesso)}
                        </div>
                      )}
                      <div className="flex gap-3 text-xs text-gray-500">
                        <span>📊 {usuario.totalVisitas} visitas</span>
                        <span>🛒 {usuario.totalCompras} compras</span>
                        <span>⭐ {usuario.totalAvaliacoes} avaliações</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setUsuarioSelecionado(usuario);
                          setShowModal(true);
                          onUsuarioSelecionado?.(usuario);
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye size={18} />
                      </button>
                      
                      {usuario.status === 'bloqueado' && (
                        <button
                          onClick={() => alterarStatus(usuario.id, 'ativo')}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Desbloquear"
                        >
                          <UserCheck size={18} />
                        </button>
                      )}
                      
                      {usuario.status === 'ativo' && (
                        <button
                          onClick={() => alterarStatus(usuario.id, 'bloqueado')}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Bloquear"
                        >
                          <Ban size={18} />
                        </button>
                      )}
                      
                      {!usuario.verificado && (
                        <button
                          onClick={() => verificarUsuario(usuario.id)}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Verificar"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsuarios.length === 0 && (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Nenhum usuário encontrado</p>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {showModal && usuarioSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users size={20} />
                Detalhes do Usuário
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {usuarioSelecionado.nome.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg">{usuarioSelecionado.nome}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusCor(usuarioSelecionado.status)}`}>
                      {getStatusTexto(usuarioSelecionado.status)}
                    </span>
                    {usuarioSelecionado.verificado && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                        Verificado
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-400" />
                  <span>{usuarioSelecionado.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-gray-400" />
                  <span>{usuarioSelecionado.telefone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-gray-400" />
                  <span>Cidade: {usuarioSelecionado.cidade}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-gray-400" />
                  <span>Cadastrado em: {formatarData(usuarioSelecionado.dataCadastro)}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium mb-2">📊 Estatísticas</h5>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{usuarioSelecionado.totalVisitas}</p>
                    <p className="text-xs text-gray-500">Visitas</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{usuarioSelecionado.totalCompras}</p>
                    <p className="text-xs text-gray-500">Compras</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{usuarioSelecionado.totalAvaliacoes}</p>
                    <p className="text-xs text-gray-500">Avaliações</p>
                  </div>
                </div>
              </div>

              {usuarioSelecionado.status === 'pendente' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-700">
                    Este usuário está pendente de verificação. Recomenda-se verificar seus dados antes de liberar acesso total.
                  </p>
                </div>
              )}
            </div>
            <div className="p-4 border-t flex gap-3">
              {usuarioSelecionado.status === 'bloqueado' && (
                <button
                  onClick={() => {
                    alterarStatus(usuarioSelecionado.id, 'ativo');
                    setShowModal(false);
                  }}
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg font-medium hover:bg-green-600"
                >
                  Desbloquear Usuário
                </button>
              )}
              {usuarioSelecionado.status === 'ativo' && (
                <button
                  onClick={() => {
                    alterarStatus(usuarioSelecionado.id, 'bloqueado');
                    setShowModal(false);
                  }}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600"
                >
                  Bloquear Usuário
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}