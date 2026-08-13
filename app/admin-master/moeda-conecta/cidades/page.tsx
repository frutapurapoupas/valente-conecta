"use client";

// Caminho: C:\valente_conecta\app\admin-master\moeda-conecta\cidades\page.tsx
// Nome/prefixo da Moeda Conecta por cidade + capacidades do CDL (selo,
// curadoria, relatórios agregados) + cadastro de representantes do CDL.

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Coins, Check, ChevronDown, ChevronUp, UserPlus, Building2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

interface CidadeConfig {
  cidade: string;
  moeda_nome: string;
  moeda_prefixo: string;
  aprovado: boolean;
  sugestao?: boolean;
  cdl_selo_ativo?: boolean;
  cdl_curadoria_ativa?: boolean;
  cdl_relatorios_ativo?: boolean;
}

interface Representante {
  id: string;
  nome: string;
  whatsapp: string | null;
  ativo: boolean;
}

export default function CidadesMoedaPage() {
  const [admin, setAdmin] = useState<any>(null);
  const [cidades, setCidades] = useState<CidadeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvandoCidade, setSalvandoCidade] = useState<string | null>(null);
  const [expandida, setExpandida] = useState<string | null>(null);
  const [representantes, setRepresentantes] = useState<Record<string, Representante[]>>({});
  const [novoNome, setNovoNome] = useState("");
  const [novoWhatsapp, setNovoWhatsapp] = useState("");
  const [novoPin, setNovoPin] = useState("");
  const [cadastrando, setCadastrando] = useState(false);

  useEffect(() => {
    setAdmin(getCurrentUser());
    carregar();
  }, []);

  const carregar = () => {
    fetch("/api/admin-master/moeda-conecta/cidades-config", { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => res.success && setCidades(res.data))
      .finally(() => setLoading(false));
  };

  const carregarRepresentantes = (cidade: string) => {
    fetch(`/api/admin-master/cdl/representantes?cidade=${encodeURIComponent(cidade)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((res) => res.success && setRepresentantes((prev) => ({ ...prev, [cidade]: res.data })));
  };

  const alternarExpandida = (cidade: string) => {
    if (expandida === cidade) {
      setExpandida(null);
      return;
    }
    setExpandida(cidade);
    if (!representantes[cidade]) carregarRepresentantes(cidade);
  };

  const atualizarCampo = (cidade: string, campo: keyof CidadeConfig, valor: any) => {
    setCidades((prev) => prev.map((c) => (c.cidade === cidade ? { ...c, [campo]: valor } : c)));
  };

  const salvar = async (config: CidadeConfig) => {
    if (!admin?.id) {
      toast.error("Faça o cadastro do Admin Master neste navegador pra poder aprovar");
      return;
    }
    setSalvandoCidade(config.cidade);
    try {
      const resp = await fetch("/api/admin-master/moeda-conecta/cidades-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cidade: config.cidade,
          moedaNome: config.moeda_nome,
          moedaPrefixo: config.moeda_prefixo,
          adminId: admin.id,
          cdlSeloAtivo: !!config.cdl_selo_ativo,
          cdlCuradoriaAtiva: !!config.cdl_curadoria_ativa,
          cdlRelatoriosAtivo: !!config.cdl_relatorios_ativo,
        }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success(`Configuração de ${config.cidade} salva`);
      carregar();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar");
    } finally {
      setSalvandoCidade(null);
    }
  };

  const cadastrarRepresentante = async (cidade: string) => {
    if (!novoNome.trim() || novoPin.trim().length < 4) {
      toast.error("Nome e PIN (mínimo 4 dígitos) são obrigatórios");
      return;
    }
    setCadastrando(true);
    try {
      const resp = await fetch("/api/admin-master/cdl/representantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cidade, nome: novoNome.trim(), whatsapp: novoWhatsapp.trim(), pin: novoPin.trim() }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Representante cadastrado");
      setNovoNome("");
      setNovoWhatsapp("");
      setNovoPin("");
      carregarRepresentantes(cidade);
    } catch (error: any) {
      toast.error(error.message || "Erro ao cadastrar");
    } finally {
      setCadastrando(false);
    }
  };

  const alternarAtivo = async (cidade: string, rep: Representante) => {
    const resp = await fetch("/api/admin-master/cdl/representantes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: rep.id, ativo: !rep.ativo }),
    });
    const resultado = await resp.json();
    if (resultado.success) carregarRepresentantes(cidade);
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
        <Coins className="w-6 h-6 text-blue-600" /> Moeda Conecta por cidade
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Nome/prefixo da moeda, capacidades do CDL e representantes de acesso — tudo por cidade.
      </p>

      <div className="bg-white border rounded-lg divide-y">
        {loading ? (
          <p className="p-4 text-sm text-gray-400">Carregando...</p>
        ) : cidades.length === 0 ? (
          <p className="p-4 text-sm text-gray-400">Nenhuma cidade com usuários ainda.</p>
        ) : (
          cidades.map((c) => (
            <div key={c.cidade}>
              <div className="p-4 flex flex-wrap items-center gap-2">
                <div className="w-28 shrink-0">
                  <p className="font-medium text-gray-800">{c.cidade}</p>
                  {c.aprovado ? (
                    <span className="text-[10px] text-green-600 flex items-center gap-1"><Check className="w-3 h-3" /> Aprovada</span>
                  ) : (
                    <span className="text-[10px] text-amber-600">Sugestão, não aprovada</span>
                  )}
                </div>
                <input
                  value={c.moeda_nome}
                  onChange={(e) => atualizarCampo(c.cidade, "moeda_nome", e.target.value)}
                  placeholder="Nome da moeda"
                  className="flex-1 min-w-[160px] px-2.5 py-1.5 border rounded-lg text-sm"
                />
                <input
                  value={c.moeda_prefixo}
                  onChange={(e) => atualizarCampo(c.cidade, "moeda_prefixo", e.target.value.toUpperCase())}
                  placeholder="Prefixo"
                  maxLength={6}
                  className="w-24 px-2.5 py-1.5 border rounded-lg text-sm uppercase"
                />
                <button
                  onClick={() => salvar(c)}
                  disabled={salvandoCidade === c.cidade}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-xs font-medium"
                >
                  {salvandoCidade === c.cidade ? "Salvando..." : c.aprovado ? "Salvar edição" : "Aprovar"}
                </button>
                <button onClick={() => alternarExpandida(c.cidade)} className="p-1.5 text-gray-400 hover:text-gray-600">
                  {expandida === c.cidade ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {expandida === c.cidade && (
                <div className="px-4 pb-4 bg-gray-50 space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" /> Capacidades do CDL nessa cidade
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <label className="flex items-center gap-1.5 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={!!c.cdl_selo_ativo}
                          onChange={(e) => atualizarCampo(c.cidade, "cdl_selo_ativo", e.target.checked)}
                        />
                        Selo de apoio institucional
                      </label>
                      <label className="flex items-center gap-1.5 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={!!c.cdl_curadoria_ativa}
                          onChange={(e) => atualizarCampo(c.cidade, "cdl_curadoria_ativa", e.target.checked)}
                        />
                        Curadoria de comércios
                      </label>
                      <label className="flex items-center gap-1.5 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={!!c.cdl_relatorios_ativo}
                          onChange={(e) => atualizarCampo(c.cidade, "cdl_relatorios_ativo", e.target.checked)}
                        />
                        Relatórios agregados
                      </label>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Lembre de clicar em "Salvar edição" acima depois de marcar/desmarcar.</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">Representantes com acesso</p>
                    <div className="space-y-1.5 mb-3">
                      {(representantes[c.cidade] || []).map((rep) => (
                        <div key={rep.id} className="flex items-center justify-between bg-white border rounded-lg px-3 py-1.5 text-sm">
                          <span>{rep.nome} {rep.whatsapp && <span className="text-gray-400">· {rep.whatsapp}</span>}</span>
                          <button
                            onClick={() => alternarAtivo(c.cidade, rep)}
                            className={`text-xs px-2 py-0.5 rounded-full ${rep.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                          >
                            {rep.ativo ? "Ativo" : "Inativo"}
                          </button>
                        </div>
                      ))}
                      {(representantes[c.cidade] || []).length === 0 && (
                        <p className="text-xs text-gray-400">Nenhum representante cadastrado.</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <input
                        value={novoNome}
                        onChange={(e) => setNovoNome(e.target.value)}
                        placeholder="Nome"
                        className="flex-1 min-w-[120px] px-2.5 py-1.5 border rounded-lg text-sm"
                      />
                      <input
                        value={novoWhatsapp}
                        onChange={(e) => setNovoWhatsapp(e.target.value)}
                        placeholder="WhatsApp (opcional)"
                        className="flex-1 min-w-[120px] px-2.5 py-1.5 border rounded-lg text-sm"
                      />
                      <input
                        value={novoPin}
                        onChange={(e) => setNovoPin(e.target.value)}
                        placeholder="PIN (4+ dígitos)"
                        className="w-32 px-2.5 py-1.5 border rounded-lg text-sm"
                      />
                      <button
                        onClick={() => cadastrarRepresentante(c.cidade)}
                        disabled={cadastrando}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-xs font-medium"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Cadastrar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
