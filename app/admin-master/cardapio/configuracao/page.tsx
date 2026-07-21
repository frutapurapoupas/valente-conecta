// app/admin-master/cardapio/configuracao/page.tsx
"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChefHat,
  Clock,
  Save,
  TrendingUp
} from "lucide-react";
import { useEffect, useState } from "react";

interface Prato {
  id: number;
  nome: string;
  categoria: "carne" | "frango" | "acompanhamento" | "doce" | "bebida";
  descricao: string;
  precoVenda: number;
  ativo: boolean;
  ingredientes?: any[];
}

interface CardapioConfig {
  dia: string;
  pratoCarneId: number | null;
  pratoFrangoId: number | null;
}

export default function ConfigurarCardapioPage() {
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [configuracoes, setConfiguracoes] = useState<CardapioConfig[]>([]);
  const [previsaoVendas, setPrevisaoVendas] = useState<{ [key: string]: number }>({});
  const [salvando, setSalvando] = useState(false);
  const [showResumo, setShowResumo] = useState(false);

  const diasSemana = ["Segunda", "TerÃ§a", "Quarta", "Quinta", "Sexta", "SÃ¡bado"];

  useEffect(() => {
    // Carregar pratos
    const storedPratos = localStorage.getItem("pratos_cardapio");
    if (storedPratos) {
      const todosPratos: Prato[] = JSON.parse(storedPratos);
      setPratos(todosPratos.filter(p => p.ativo));
    } else {
      // Dados iniciais
      const pratosIniciais: Prato[] = [
        { id: 1, nome: "Picadinho de Carne", categoria: "carne", descricao: "Picadinho de carne com arroz e legumes", precoVenda: 28.90, ativo: true },
        { id: 2, nome: "Carne MoÃ­da", categoria: "carne", descricao: "Carne moÃ­da com arroz e brÃ³colis/cenoura", precoVenda: 26.90, ativo: true },
        { id: 3, nome: "Carne de Panela", categoria: "carne", descricao: "Carne de panela com arroz e purÃª de mandioca", precoVenda: 32.90, ativo: true },
        { id: 4, nome: "Frango em Cubos", categoria: "frango", descricao: "Frango em cubos com arroz e purÃª", precoVenda: 24.90, ativo: true },
        { id: 5, nome: "Strogonoff de Frango", categoria: "frango", descricao: "Strogonoff de frango com arroz", precoVenda: 27.90, ativo: true },
        { id: 6, nome: "Frango Ã  Milanesa", categoria: "frango", descricao: "Frango Ã  milanesa com arroz e legumes", precoVenda: 26.90, ativo: true },
        { id: 7, nome: "Escondidinho de Frango", categoria: "frango", descricao: "Escondidinho de frango com purÃª de batata", precoVenda: 29.90, ativo: true },
        { id: 8, nome: "Frango em Cubos Colorido", categoria: "frango", descricao: "Frango em cubos com arroz colorido", precoVenda: 25.90, ativo: true }
      ];
      setPratos(pratosIniciais);
      localStorage.setItem("pratos_cardapio", JSON.stringify(pratosIniciais));
    }

    // Carregar configuraÃ§Ã£o do cardÃ¡pio
    const storedConfig = localStorage.getItem("cardapio_config");
    if (storedConfig) {
      setConfiguracoes(JSON.parse(storedConfig));
    } else {
      const configInicial: CardapioConfig[] = diasSemana.map(dia => ({
        dia,
        pratoCarneId: null,
        pratoFrangoId: null
      }));
      setConfiguracoes(configInicial);
    }

    // Carregar previsÃ£o de vendas
    const storedPrevisao = localStorage.getItem("previsao_vendas");
    if (storedPrevisao) {
      setPrevisaoVendas(JSON.parse(storedPrevisao));
    } else {
      const previsaoInicial: { [key: string]: number } = {};
      diasSemana.forEach(dia => { previsaoInicial[dia] = 20; });
      setPrevisaoVendas(previsaoInicial);
    }
  }, [diasSemana]);

  const atualizarConfig = (dia: string, campo: "pratoCarneId" | "pratoFrangoId", value: string) => {
    setConfiguracoes(configuracoes.map(c =>
      c.dia === dia ? { ...c, [campo]: value ? parseInt(value) : null } : c
    ));
  };

  const atualizarPrevisao = (dia: string, valor: number) => {
    setPrevisaoVendas({ ...previsaoVendas, [dia]: valor });
  };

  const salvarConfiguracoes = () => {
    setSalvando(true);

    // Salvar configuraÃ§Ãµes
    localStorage.setItem("cardapio_config", JSON.stringify(configuracoes));
    localStorage.setItem("previsao_vendas", JSON.stringify(previsaoVendas));

    // Gerar cardÃ¡pio para o cliente
    const cardapioCliente = diasSemana.map(dia => {
      const config = configuracoes.find(c => c.dia === dia);
      const pratoCarne = pratos.find(p => p.id === config?.pratoCarneId);
      const pratoFrango = pratos.find(p => p.id === config?.pratoFrangoId);

      return {
        dia: dia,
        data: new Date().toLocaleDateString(),
        pratos: [
          pratoCarne ? {
            id: pratoCarne.id,
            nome: pratoCarne.nome,
            descricao: pratoCarne.descricao,
            preco: pratoCarne.precoVenda,
            disponivel: true
          } : null,
          pratoFrango ? {
            id: pratoFrango.id,
            nome: pratoFrango.nome,
            descricao: pratoFrango.descricao,
            preco: pratoFrango.precoVenda,
            disponivel: true
          } : null
        ].filter(p => p !== null)
      };
    });

    localStorage.setItem("cardapio_cliente", JSON.stringify(cardapioCliente));

    setTimeout(() => {
      setSalvando(false);
      setShowResumo(true);
      setTimeout(() => setShowResumo(false), 3000);
    }, 500);
  };

  const pratosCarne = pratos.filter(p => p.categoria === "carne");
  const pratosFrango = pratos.filter(p => p.categoria === "frango");

  const totalSemanal = Object.values(previsaoVendas).reduce((a, b) => a + b, 0);
  const mediaDiaria = Math.round(totalSemanal / 6);
  const faturamentoEstimado = totalSemanal * 25; // MÃ©dia de R$25 por marmita

  // Verificar se hÃ¡ pratos nÃ£o configurados
  const configuracaoIncompleta = configuracoes.some(c => !c.pratoCarneId || !c.pratoFrangoId);
  const diasIncompletos = configuracoes.filter(c => !c.pratoCarneId || !c.pratoFrangoId).map(c => c.dia);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* CabeÃ§alho */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">ðŸ“… Configurar CardÃ¡pio Semanal</h1>
            <p className="text-sm text-gray-500">Defina quais pratos serÃ£o servidos cada dia da semana</p>
          </div>
          <button
            onClick={salvarConfiguracoes}
            disabled={salvando}
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 disabled:opacity-50"
          >
            {salvando ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save size={18} />
            )}
            {salvando ? "Salvando..." : "Salvar ConfiguraÃ§Ã£o"}
          </button>
        </div>

        {/* Alerta de configuraÃ§Ã£o incompleta */}
        {configuracaoIncompleta && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center gap-3">
            <AlertCircle size={20} className="text-yellow-600" />
            <div>
              <p className="text-sm text-yellow-800 font-medium">ConfiguraÃ§Ã£o incompleta</p>
              <p className="text-xs text-yellow-600">
                Faltam pratos para os dias: {diasIncompletos.join(", ")}
              </p>
            </div>
          </div>
        )}

        {/* NotificaÃ§Ã£o de sucesso */}
        {showResumo && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3 animate-bounce">
            <CheckCircle size={20} className="text-green-600" />
            <div>
              <p className="text-sm text-green-800 font-medium">CardÃ¡pio salvo com sucesso!</p>
              <p className="text-xs text-green-600">O cardÃ¡pio do cliente foi atualizado automaticamente</p>
            </div>
          </div>
        )}

        {/* Tabela de ConfiguraÃ§Ã£o */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 text-left font-semibold text-gray-700 w-24">Dia</th>
                  <th className="p-4 text-left font-semibold text-gray-700">
                    <span className="flex items-center gap-2">
                      ðŸ¥© Prato de Carne
                    </span>
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700">
                    <span className="flex items-center gap-2">
                      ðŸ— Prato de Frango
                    </span>
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700">
                    <span className="flex items-center gap-2">
                      ðŸ“Š PrevisÃ£o de Vendas
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {diasSemana.map(dia => {
                  const config = configuracoes.find(c => c.dia === dia);
                  const pratoCarneSelecionado = pratosCarne.find(p => p.id === config?.pratoCarneId);
                  const pratoFrangoSelecionado = pratosFrango.find(p => p.id === config?.pratoFrangoId);

                  return (
                    <tr key={dia} className={`border-b hover:bg-gray-50 ${(!config?.pratoCarneId || !config?.pratoFrangoId) ? "bg-yellow-50" : ""
                      }`}>
                      <td className="p-4 font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          {dia}
                        </div>
                      </td>
                      <td className="p-4">
                        <select
                          value={config?.pratoCarneId || ""}
                          onChange={(e) => atualizarConfig(dia, "pratoCarneId", e.target.value)}
                          className={`w-64 p-2 border rounded-lg text-sm ${!config?.pratoCarneId ? "border-yellow-400 bg-yellow-50" : ""
                            }`}
                        >
                          <option value="">Selecione um prato</option>
                          {pratosCarne.map(prato => (
                            <option key={prato.id} value={prato.id}>
                              {prato.nome} - R$ {prato.precoVenda.toFixed(2)}
                            </option>
                          ))}
                        </select>
                        {pratoCarneSelecionado && (
                          <p className="text-xs text-gray-400 mt-1">
                            {pratoCarneSelecionado.descricao.substring(0, 50)}...
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <select
                          value={config?.pratoFrangoId || ""}
                          onChange={(e) => atualizarConfig(dia, "pratoFrangoId", e.target.value)}
                          className={`w-64 p-2 border rounded-lg text-sm ${!config?.pratoFrangoId ? "border-yellow-400 bg-yellow-50" : ""
                            }`}
                        >
                          <option value="">Selecione um prato</option>
                          {pratosFrango.map(prato => (
                            <option key={prato.id} value={prato.id}>
                              {prato.nome} - R$ {prato.precoVenda.toFixed(2)}
                            </option>
                          ))}
                        </select>
                        {pratoFrangoSelecionado && (
                          <p className="text-xs text-gray-400 mt-1">
                            {pratoFrangoSelecionado.descricao.substring(0, 50)}...
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={previsaoVendas[dia] || 0}
                            onChange={(e) => atualizarPrevisao(dia, parseInt(e.target.value) || 0)}
                            className="w-24 p-2 border rounded-lg text-center"
                            min="0"
                          />
                          <span className="text-sm text-gray-500">marmitas</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Faturamento estimado: R$ {((previsaoVendas[dia] || 0) * 25).toFixed(2)}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumo da Semana */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={20} className="text-blue-500" />
              <h3 className="font-semibold text-blue-800">Resumo Semanal</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg font-bold text-blue-600">{totalSemanal} marmitas</p>
              </div>
              <div className="bg-white rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">MÃ©dia DiÃ¡ria</p>
                <p className="text-lg font-bold text-green-600">{mediaDiaria} marmitas</p>
              </div>
              <div className="bg-white rounded-lg p-2 text-center">
                <p className="text-xs text-gray-500">Faturamento</p>
                <p className="text-lg font-bold text-purple-600">R$ {faturamentoEstimado.toFixed(0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
            <div className="flex items-center gap-2 mb-3">
              <ChefHat size={20} className="text-orange-500" />
              <h3 className="font-semibold text-orange-800">Dicas de CardÃ¡pio</h3>
            </div>
            <ul className="text-sm text-orange-700 space-y-1 list-disc list-inside">
              <li>Varie os pratos entre dias da semana</li>
              <li>Considere a sazonalidade dos ingredientes</li>
              <li>Pratos com maior margem de lucro</li>
              <li>Utilize ingredientes que podem ser compartilhados</li>
            </ul>
          </div>
        </div>

        {/* Preview do CardÃ¡pio do Cliente */}
        <div className="mt-6 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Clock size={18} /> Preview do CardÃ¡pio do Cliente
            </h3>
            <p className="text-xs text-gray-500">Como ficarÃ¡ visÃ­vel para o cliente</p>
          </div>
          <div className="p-4 overflow-x-auto">
            <div className="flex gap-4">
              {diasSemana.map(dia => {
                const config = configuracoes.find(c => c.dia === dia);
                const pratoCarne = pratos.find(p => p.id === config?.pratoCarneId);
                const pratoFrango = pratos.find(p => p.id === config?.pratoFrangoId);

                return (
                  <div key={dia} className="min-w-[200px] bg-gray-50 rounded-lg p-3">
                    <p className="font-bold text-center text-gray-700">{dia}</p>
                    <div className="mt-2 space-y-2">
                      {pratoCarne ? (
                        <div className="text-xs p-2 bg-white rounded">
                          <span className="text-red-500">ðŸ¥©</span> {pratoCarne.nome}
                        </div>
                      ) : (
                        <div className="text-xs p-2 bg-gray-200 rounded text-gray-400 text-center">
                          Aguardando configuraÃ§Ã£o
                        </div>
                      )}
                      {pratoFrango ? (
                        <div className="text-xs p-2 bg-white rounded">
                          <span className="text-orange-500">ðŸ—</span> {pratoFrango.nome}
                        </div>
                      ) : (
                        <div className="text-xs p-2 bg-gray-200 rounded text-gray-400 text-center">
                          Aguardando configuraÃ§Ã£o
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

