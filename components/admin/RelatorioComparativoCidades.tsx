// components/admin/RelatorioComparativoCidades.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Store, 
  ShoppingBag, 
  Star,
  Download,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DadosCidade {
  cidade: string;
  populacao: number;
  totalUsuarios: number;
  totalEmpresas: number;
  totalProfissionais: number;
  totalVendas: number;
  volumeFinanceiro: number;
  avaliacaoMedia: number;
  crescimentoMensal: number;
  usuariosAtivos: number;
  taxaPenetracao: number;
  principaisSetores: { setor: string; quantidade: number }[];
}

interface RelatorioComparativoCidadesProps {
  cidades: string[];
}

const cores = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export function RelatorioComparativoCidades({ cidades }: RelatorioComparativoCidadesProps) {
  const [dados, setDados] = useState<DadosCidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<'mensal' | 'trimestral' | 'anual'>('mensal');
  const [dadosEvolucao, setDadosEvolucao] = useState<any[]>([]);

  // Mock data
  useEffect(() => {
    const mockDados: DadosCidade[] = [
      {
        cidade: 'Valente',
        populacao: 25000,
        totalUsuarios: 8750,
        totalEmpresas: 320,
        totalProfissionais: 180,
        totalVendas: 12450,
        volumeFinanceiro: 875000,
        avaliacaoMedia: 4.7,
        crescimentoMensal: 12.5,
        usuariosAtivos: 5200,
        taxaPenetracao: 35.0,
        principaisSetores: [
          { setor: 'Alimentação', quantidade: 85 },
          { setor: 'Vestuário', quantidade: 62 },
          { setor: 'Serviços', quantidade: 48 },
        ],
      },
      {
        cidade: 'Conceição do Coité',
        populacao: 62000,
        totalUsuarios: 18600,
        totalEmpresas: 580,
        totalProfissionais: 320,
        totalVendas: 22300,
        volumeFinanceiro: 1560000,
        avaliacaoMedia: 4.5,
        crescimentoMensal: 8.2,
        usuariosAtivos: 11200,
        taxaPenetracao: 30.0,
        principaisSetores: [
          { setor: 'Alimentação', quantidade: 145 },
          { setor: 'Vestuário', quantidade: 110 },
          { setor: 'Serviços', quantidade: 95 },
        ],
      },
      {
        cidade: 'Santa Luiz',
        populacao: 18000,
        totalUsuarios: 5400,
        totalEmpresas: 150,
        totalProfissionais: 85,
        totalVendas: 6850,
        volumeFinanceiro: 412000,
        avaliacaoMedia: 4.6,
        crescimentoMensal: 15.3,
        usuariosAtivos: 3200,
        taxaPenetracao: 30.0,
        principaisSetores: [
          { setor: 'Alimentação', quantidade: 42 },
          { setor: 'Serviços', quantidade: 35 },
          { setor: 'Vestuário', quantidade: 28 },
        ],
      },
      {
        cidade: 'São Domingos',
        populacao: 12000,
        totalUsuarios: 3120,
        totalEmpresas: 85,
        totalProfissionais: 42,
        totalVendas: 4120,
        volumeFinanceiro: 247000,
        avaliacaoMedia: 4.4,
        crescimentoMensal: 18.7,
        usuariosAtivos: 1850,
        taxaPenetracao: 26.0,
        principaisSetores: [
          { setor: 'Alimentação', quantidade: 28 },
          { setor: 'Serviços', quantidade: 22 },
          { setor: 'Comércio', quantidade: 18 },
        ],
      },
    ];

    // Dados de evolução (últimos 6 meses)
    const mockEvolucao = [
      { mes: 'Nov', Valente: 11200, 'Conceição do Coité': 19800, 'Santa Luiz': 5100, 'São Domingos': 2850 },
      { mes: 'Dez', Valente: 11800, 'Conceição do Coité': 20500, 'Santa Luiz': 5250, 'São Domingos': 2980 },
      { mes: 'Jan', Valente: 12400, 'Conceição do Coité': 21200, 'Santa Luiz': 5380, 'São Domingos': 3120 },
      { mes: 'Fev', Valente: 13000, 'Conceição do Coité': 21800, 'Santa Luiz': 5520, 'São Domingos': 3240 },
      { mes: 'Mar', Valente: 13500, 'Conceição do Coité': 22400, 'Santa Luiz': 5650, 'São Domingos': 3180 },
      { mes: 'Abr', Valente: 14200, 'Conceição do Coité': 23200, 'Santa Luiz': 5780, 'São Domingos': 3320 },
    ];

    setDados(mockDados);
    setDadosEvolucao(mockEvolucao);
    setLoading(false);
  }, []);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    };
    
    const formatarNumero = (valor: number) => {
      return new Intl.NumberFormat('pt-BR').format(valor);
    };
    
    const getVariacaoIcone = (valor: number) => {
      if (valor > 0) return <ArrowUp size={14} className="text-green-500" />;
      if (valor < 0) return <ArrowDown size={14} className="text-red-500" />;
      return <Minus size={14} className="text-gray-400" />;
    };
    
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando relatórios...</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-8">
        {/* Header com exportação */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 size={24} />
              Comparativo entre Cidades
            </h2>
            <p className="text-gray-500 text-sm">Análise de desempenho por município</p>
          </div>
          <div className="flex gap-3">
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value as any)}
              className="px-4 py-2 border rounded-lg bg-white"
            >
              <option value="mensal">Mensal</option>
              <option value="trimestral">Trimestral</option>
              <option value="anual">Anual</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
              <Download size={18} /> Exportar
            </button>
          </div>
        </div>
        
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-sm">Média de Usuários</p>
              <Users size={20} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold">
              {formatarNumero(dados.reduce((s, c) => s + c.totalUsuarios, 0) / dados.length)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Total: {formatarNumero(dados.reduce((s, c) => s + c.totalUsuarios, 0))}</p>
          </div>
          
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-sm">Média Empresas/Profissionais</p>
              <Store size={20} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold">
              {formatarNumero((dados.reduce((s, c) => s + c.totalEmpresas + c.totalProfissionais, 0) / dados.length))}
            </p>
            <p className="text-xs text-gray-400 mt-1">Empresas: {formatarNumero(dados.reduce((s, c) => s + c.totalEmpresas, 0))}</p>
          </div>
          
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-sm">Volume Financeiro</p>
              <TrendingUp size={20} className="text-purple-500" />
            </div>
            <p className="text-2xl font-bold">{formatarMoeda(dados.reduce((s, c) => s + c.volumeFinanceiro, 0))}</p>
            <p className="text-xs text-gray-400 mt-1">Total de transações</p>
          </div>
          
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-sm">Avaliação Média</p>
              <Star size={20} className="text-yellow-500" />
            </div>
            <p className="text-2xl font-bold">{dados.reduce((s, c) => s + c.avaliacaoMedia, 0) / dados.length}</p>
            <p className="text-xs text-gray-400 mt-1">⭐ Baseado em avaliações de usuários</p>
          </div>
        </div>
        
        {/* Gráfico de Evolução */}
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold mb-4">📈 Evolução de Usuários por Cidade</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={dadosEvolucao}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              {cidades.map((cidade, idx) => (
                <Line
                  key={cidade}
                  type="monotone"
                  dataKey={cidade}
                  stroke={cores[idx % cores.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Gráfico de Barras Comparativo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold mb-4">👥 Usuários vs População</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dados}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cidade" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="populacao" name="População" fill="#3b82f6" />
                <Bar dataKey="totalUsuarios" name="Usuários App" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold mb-4">💰 Volume Financeiro</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dados}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cidade" />
                <YAxis />
                <Tooltip formatter={(value) => formatarMoeda(value as number)} />
                <Legend />
                <Bar dataKey="volumeFinanceiro" name="Volume Financeiro" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Tabela Comparativa */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-left">Cidade</th>
                  <th className="p-4 text-center">Usuários</th>
                  <th className="p-4 text-center">Empresas</th>
                  <th className="p-4 text-center">Profissionais</th>
                  <th className="p-4 text-center">Vendas</th>
                  <th className="p-4 text-center">Volume</th>
                  <th className="p-4 text-center">Crescimento</th>
                  <th className="p-4 text-center">Avaliação</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dados.map(cidade => (
                  <tr key={cidade.cidade} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">{cidade.cidade}</td>
                    <td className="p-4 text-center">{formatarNumero(cidade.totalUsuarios)}</td>
                    <td className="p-4 text-center">{formatarNumero(cidade.totalEmpresas)}</td>
                    <td className="p-4 text-center">{formatarNumero(cidade.totalProfissionais)}</td>
                    <td className="p-4 text-center">{formatarNumero(cidade.totalVendas)}</td>
                    <td className="p-4 text-center">{formatarMoeda(cidade.volumeFinanceiro)}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {getVariacaoIcone(cidade.crescimentoMensal)}
                        <span className={cidade.crescimentoMensal >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {Math.abs(cidade.crescimentoMensal)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span>{cidade.avaliacaoMedia}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Principais Setores por Cidade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dados.map((cidade, idx) => (
            <div key={cidade.cidade} className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold mb-4">🏢 Principais Setores - {cidade.cidade}</h3>
              <div className="space-y-3">
                {cidade.principaisSetores.map((setor, i) => (
                  <div key={setor.setor}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{setor.setor}</span>
                      <span className="text-gray-500">{setor.quantidade} estabelecimentos</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${(setor.quantidade / cidade.principaisSetores[0].quantidade) * 100}%`,
                          backgroundColor: cores[i % cores.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
}