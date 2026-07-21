// ============================================================================
// ARQUIVO: app/admin/configuracoes/cambio/page.tsx
// Funcionalidade: Tela do Admin Master para ajustar cÃ¢mbio por cidade
// Rota: /admin/configuracoes/cambio
// ============================================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { 
  ArrowLeft, Save, TrendingUp, TrendingDown, 
  Search, Plus, Edit2, Trash2, X, CheckCircle,
  DollarSign, MapPin, Globe
} from "lucide-react";
import toast from "react-hot-toast";

interface CambioConfig {
  id: string;
  cidade: string;
  estado: string;
  taxa_cambio: number;
  taxa_compra: number;
  taxa_venda: number;
  atualizado_em: string;
  atualizado_por: string;
  ativo: boolean;
}

interface Cidade {
  id: string;
  nome: string;
  estado: string;
  regiao: string;
  ativo: boolean;
}

export default function AdminCambioPage() {
  const router = useRouter();
  const { isAdmin } = useApp();
  const [cambios, setCambios] = useState<CambioConfig[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [editandoValor, setEditandoValor] = useState<number>(0);
  const [showModalCidade, setShowModalCidade] = useState(false);
  const [novaCidade, setNovaCidade] = useState({ nome: "", estado: "BA", regiao: "Nordeste" });
  const [estatisticas, setEstatisticas] = useState({ totalCidades: 0, taxaMedia: 0, taxaMin: 0, taxaMax: 0 });

  if (!isAdmin) {
    router.push("/login");
    return null;
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Carregar configuraÃ§Ãµes de cÃ¢mbio
      const response = await fetch('/api/cambio?todas=true');
      const data = await response.json();
      if (data.success) {
        setCambios(data.data);
        
        // Calcular estatÃ­sticas
        const taxas = data.data.map((c: CambioConfig) => c.taxa_cambio);
        setEstatisticas({
          totalCidades: data.data.length,
          taxaMedia: taxas.reduce((a: number, b: number) => a + b, 0) / taxas.length,
          taxaMin: Math.min(...taxas),
          taxaMax: Math.max(...taxas)
        });
      }

      // Carregar cidades
      const cidadesRes = await fetch('/api/cambio?cidades=true');
      const cidadesData = await cidadesRes.json();
      if (cidadesData.success) {
        setCidades(cidadesData.data);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar configuraÃ§Ãµes");
    } finally {
      setLoading(false);
    }
  };

  const salvarCambio = async (cidade: string, taxa: number) => {
    try {
      const response = await fetch('/api/cambio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cidade, taxa_cambio: taxa })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success(`CÃ¢mbio de ${cidade} atualizado!`);
        carregarDados();
      } else {
        toast.error(data.error || "Erro ao salvar");
      }
    } catch (error) {
      toast.error("Erro ao salvar cÃ¢mbio");
    }
    setEditandoId(null);
  };

  const adicionarCidade = async () => {
    if (!novaCidade.nome) {
      toast.error("Nome da cidade Ã© obrigatÃ³rio");
      return;
    }

    try {
      const response = await fetch('/api/admin/cidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaCidade)
      });
      
      if (response.ok) {
        toast.success(`Cidade ${novaCidade.nome} adicionada!`);
        setShowModalCidade(false);
        setNovaCidade({ nome: "", estado: "BA", regiao: "Nordeste" });
        carregarDados();
      } else {
        toast.error("Erro ao adicionar cidade");
      }
    } catch (error) {
      toast.error("Erro ao adicionar cidade");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center gap-3 sticky top-0 z-40">
        <button onClick={() => router.push("/admin/configuracoes")} className="text-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <DollarSign className="w-6 h-6 text-white" />
        <h1 className="text-white font-bold text-xl">ðŸ’± CÃ¢mbio da Moeda Conecta</h1>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Cards de EstatÃ­sticas */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-4 text-white text-center">
            <p className="text-2xl font-bold">{estatisticas.totalCidades}</p>
            <p className="text-sm opacity-90">Cidades</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 text-white text-center">
            <p className="text-2xl font-bold">{estatisticas.taxaMedia.toFixed(4)}</p>
            <p className="text-sm opacity-90">Taxa MÃ©dia</p>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-4 text-white text-center">
            <p className="text-2xl font-bold">{estatisticas.taxaMin.toFixed(4)}</p>
            <p className="text-sm opacity-90">Taxa MÃ­nima</p>
          </div>
          <div className="bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl p-4 text-white text-center">
            <p className="text-2xl font-bold">{estatisticas.taxaMax.toFixed(4)}</p>
            <p className="text-sm opacity-90">Taxa MÃ¡xima</p>
          </div>
        </div>

        {/* InformaÃ§Ã£o */}
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-800">ðŸ’± Sobre o cÃ¢mbio da Moeda Conecta:</p>
              <ul className="text-xs text-gray-600 mt-2 space-y-1">
                <li>â€¢ <strong>1 MC (Moeda Conecta)</strong> = X Reais (configurÃ¡vel por cidade)</li>
                <li>â€¢ O cÃ¢mbio pode ser diferente para cada cidade base</li>
                <li>â€¢ A conversÃ£o Ã© aplicada automaticamente no extrato do usuÃ¡rio</li>
                <li>â€¢ TransaÃ§Ãµes internas (usuÃ¡rio â†’ usuÃ¡rio) usam a taxa da cidade do pagador</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tabela de CÃ¢mbio por Cidade */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-800 px-5 py-3 flex justify-between items-center">
            <h2 className="text-white font-bold">ðŸŒ Taxas de CÃ¢mbio por Cidade</h2>
            <button
              onClick={() => setShowModalCidade(true)}
              className="bg-yellow-500 text-black px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Nova Cidade
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-600">Cidade</th>
                  <th className="px-4 py-3 text-left text-gray-600">Estado</th>
                  <th className="px-4 py-3 text-left text-gray-600">1 MC = R$</th>
                  <th className="px-4 py-3 text-left text-gray-600">Atualizado em</th>
                  <th className="px-4 py-3 text-left text-gray-600">AÃ§Ãµes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cambios.map((cambio) => (
                  <tr key={cambio.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {cambio.cidade}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{cambio.estado}</td>
                    <td className="px-4 py-3">
                      {editandoId === cambio.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.0001"
                            value={editandoValor}
                            onChange={(e) => setEditandoValor(parseFloat(e.target.value))}
                            className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                          />
                          <button
                            onClick={() => salvarCambio(cambio.cidade, editandoValor)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setEditandoId(null)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-lg">R$ {cambio.taxa_cambio.toFixed(4)}</span>
                          <button
                            onClick={() => {
                              setEditandoId(cambio.id);
                              setEditandoValor(cambio.taxa_cambio);
                            }}
                            className="text-gray-400 hover:text-indigo-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(cambio.atualizado_em).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Ativo
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Exemplo de conversÃ£o */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">ðŸ“Š Exemplo de conversÃ£o:</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white rounded-xl p-3 text-center">
              <p className="text-gray-500">100 MC em Valente</p>
              <p className="text-xl font-bold text-green-600">R$ {(100 * (cambios.find(c => c.cidade === 'Valente')?.taxa_cambio || 1)).toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <p className="text-gray-500">100 MC em Salvador</p>
              <p className="text-xl font-bold text-green-600">R$ {(100 * (cambios.find(c => c.cidade === 'Salvador')?.taxa_cambio || 1)).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Nova Cidade */}
      {showModalCidade && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">âž• Nova Cidade</h2>
              <button onClick={() => setShowModalCidade(false)} className="text-gray-400">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Cidade *</label>
                <input
                  type="text"
                  value={novaCidade.nome}
                  onChange={(e) => setNovaCidade({ ...novaCidade, nome: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                  placeholder="Ex: Salvador"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={novaCidade.estado}
                  onChange={(e) => setNovaCidade({ ...novaCidade, estado: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                >
                  <option value="BA">BA - Bahia</option>
                  <option value="SP">SP - SÃ£o Paulo</option>
                  <option value="RJ">RJ - Rio de Janeiro</option>
                  <option value="MG">MG - Minas Gerais</option>
                  <option value="PE">PE - Pernambuco</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RegiÃ£o</label>
                <select
                  value={novaCidade.regiao}
                  onChange={(e) => setNovaCidade({ ...novaCidade, regiao: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl"
                >
                  <option value="Nordeste">Nordeste</option>
                  <option value="Sudeste">Sudeste</option>
                  <option value="Sul">Sul</option>
                  <option value="Centro-Oeste">Centro-Oeste</option>
                  <option value="Norte">Norte</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModalCidade(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={adicionarCidade}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold"
              >
                Adicionar Cidade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

