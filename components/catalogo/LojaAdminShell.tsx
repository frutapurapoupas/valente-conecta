"use client";

// Caminho: C:\valente_conecta\components\catalogo\LojaAdminShell.tsx
//
// Painel interno reutilizavel do dono da loja/servico — camada 2 das 3
// interfaces pedidas (publico / admin da loja / admin master). Cada modulo
// vertical monta sua pagina de admin so passando modulo + categorias:
//
//   <LojaAdminShell modulo="agua-gas" labelModulo="Gás e Água" categorias={[...]} />
//
// Ver MASTER_SPEC secao 2 ("interface unica reutilizavel para todos os
// modulos") e MODULO_MARKETPLACE_MONETIZACAO.md secao 2.

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { Package, User, Bell, Plus, Pencil, Trash2, PauseCircle, PlayCircle, Sparkles, Calendar } from "lucide-react";
import { useMeuCatalogo } from "@/lib/catalogo/useCatalogoModulo";
import { ItemForm } from "./ItemForm";
import { HorarioSemanaEditor } from "./HorarioSemanaEditor";
import { horariosPadrao } from "@/lib/catalogo/horarios";
import { AgendaConstrucaoTab } from "@/components/construcao/AgendaConstrucaoTab";
import type { CatalogoItem, Interesse, PerfilFornecedor } from "@/lib/catalogo/marketplaceTypes";

interface LojaAdminShellProps {
  modulo: string;
  labelModulo: string;
  categorias: string[];
}

type Aba = "catalogo" | "perfil" | "interesses" | "agenda";

export function LojaAdminShell({ modulo, labelModulo, categorias }: LojaAdminShellProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const demandaId = searchParams?.get("demanda") || "";
  const termoDemanda = searchParams?.get("termo") || "";

  const [aba, setAba] = useState<Aba>("catalogo");
  const { itens, loading, donoId, criar, atualizar, remover } = useMeuCatalogo(modulo);
  const [editando, setEditando] = useState<CatalogoItem | null>(null);
  const [criandoNovo, setCriandoNovo] = useState(false);
  const [perfilExiste, setPerfilExiste] = useState<boolean | null>(null);

  // Chegou aqui a partir do aviso de uma demanda de busca (push ou
  // WhatsApp): confere se ja tem perfil de fornecedor salvo — se nao tiver
  // (primeira vez usando o app), pede o cadastro da loja primeiro; se ja
  // tiver, vai direto pro formulario do produto com o titulo pre-preenchido.
  useEffect(() => {
    if (!donoId) return;
    if (!demandaId) { setPerfilExiste(true); return; }
    fetch(`/api/catalogo/perfil-fornecedor?usuario_id=${donoId}`)
      .then((r) => r.json())
      .then((res) => {
        const existe = !!(res.success && res.data);
        setPerfilExiste(existe);
        setAba(existe ? "catalogo" : "perfil");
        if (existe) setCriandoNovo(true);
      })
      .catch(() => setPerfilExiste(true));
  }, [donoId, demandaId]);

  const limparContextoDemanda = () => {
    router.replace(pathname || "");
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-1">Painel · {labelModulo}</h1>
      <p className="text-sm text-gray-500 mb-6">Gerencie seu catálogo, dados de contato e interesses recebidos.</p>

      {demandaId && termoDemanda && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900">
              Alguém está procurando "{termoDemanda}" no Valente Conecta
            </p>
            <p className="text-xs text-blue-700 mt-0.5">
              {perfilExiste === false
                ? "Complete o cadastro da sua loja e depois publique esse produto/serviço pra atender essa pessoa."
                : "Publique esse produto/serviço agora — quem buscou será avisado assim que aparecer."}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-1 border-b mb-6">
        <AbaBotao ativo={aba === "catalogo"} onClick={() => setAba("catalogo")} icone={<Package className="w-4 h-4" />} label="Meu catálogo" />
        <AbaBotao ativo={aba === "perfil"} onClick={() => setAba("perfil")} icone={<User className="w-4 h-4" />} label="Perfil da loja" />
        <AbaBotao ativo={aba === "interesses"} onClick={() => setAba("interesses")} icone={<Bell className="w-4 h-4" />} label="Interesses recebidos" />
        {modulo === "construcao" && (
          <AbaBotao ativo={aba === "agenda"} onClick={() => setAba("agenda")} icone={<Calendar className="w-4 h-4" />} label="Agenda" />
        )}
      </div>

      {aba === "catalogo" && (
        <div>
          {(criandoNovo || editando) ? (
            <ItemForm
              categorias={categorias}
              itemInicial={editando || undefined}
              tituloSugerido={!editando ? termoDemanda : undefined}
              onCancelar={() => { setCriandoNovo(false); setEditando(null); }}
              onSalvar={async (dados) => {
                const resultado = editando ? await atualizar(editando.id, dados) : await criar(dados);
                if (resultado) {
                  setCriandoNovo(false);
                  setEditando(null);
                  if (demandaId && !editando && (resultado as CatalogoItem).id) {
                    fetch("/api/demandas-busca/atender", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ demandaId, itemId: (resultado as CatalogoItem).id }),
                    })
                      .then(() => toast.success("Você atendeu essa demanda! A pessoa que buscou foi avisada."))
                      .catch(() => {});
                    limparContextoDemanda();
                  }
                }
                return resultado;
              }}
            />
          ) : (
            <>
              <button
                onClick={() => setCriandoNovo(true)}
                className="mb-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                <Plus className="w-4 h-4" /> Novo item
              </button>

              {loading ? (
                <p className="text-gray-400 text-sm">Carregando...</p>
              ) : itens.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500">
                  Nenhum item publicado ainda.
                </div>
              ) : (
                <div className="space-y-2">
                  {itens.map((item) => (
                    <div key={item.id} className="bg-white border rounded-lg p-3 flex items-center gap-3">
                      <div className="w-14 h-14 bg-gray-100 rounded overflow-hidden shrink-0">
                        {item.midia?.[0] && (
                          <img src={item.midia[0].thumb_url || item.midia[0].url} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.titulo}</p>
                        <p className="text-xs text-gray-500">
                          {item.categoria} · {item.status === "ativo" ? "Ativo" : item.status === "pausado" ? "Pausado" : "Removido"}
                        </p>
                      </div>
                      <button onClick={() => setEditando(item)} className="p-2 text-gray-500 hover:text-blue-600" title="Editar">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => atualizar(item.id, { status: item.status === "ativo" ? "pausado" : "ativo" })}
                        className="p-2 text-gray-500 hover:text-amber-600"
                        title={item.status === "ativo" ? "Pausar" : "Reativar"}
                      >
                        {item.status === "ativo" ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                      </button>
                      <button onClick={() => remover(item.id)} className="p-2 text-gray-500 hover:text-red-600" title="Remover">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {aba === "perfil" && donoId && (
        <PerfilFornecedorForm
          usuarioId={donoId}
          onSalvo={
            demandaId
              ? () => {
                  setPerfilExiste(true);
                  setAba("catalogo");
                  setCriandoNovo(true);
                }
              : undefined
          }
        />
      )}
      {aba === "interesses" && donoId && <InteressesRecebidos fornecedorId={donoId} />}
      {aba === "agenda" && donoId && modulo === "construcao" && <AgendaConstrucaoTab donoId={donoId} />}
    </div>
  );
}

function AbaBotao({ ativo, onClick, icone, label }: { ativo: boolean; onClick: () => void; icone: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
        ativo ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      {icone} {label}
    </button>
  );
}

function PerfilFornecedorForm({ usuarioId, onSalvo }: { usuarioId: string; onSalvo?: () => void }) {
  const [perfil, setPerfil] = useState<Partial<PerfilFornecedor>>({});
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch(`/api/catalogo/perfil-fornecedor?usuario_id=${usuarioId}`)
      .then((r) => r.json())
      .then((res) => { if (res.success && res.data) setPerfil(res.data); })
      .finally(() => setLoading(false));
  }, [usuarioId]);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      // So' manda horarios se pelo menos um dia estiver ativo — evita
      // gravar um horario "todo desligado" que faria o badge mostrar
      // "Fechado agora" pra quem nunca configurou nada.
      const horariosParaSalvar = perfil.horarios?.some((h) => h.ativo) ? perfil.horarios : null;
      const resp = await fetch("/api/catalogo/perfil-fornecedor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...perfil, usuario_id: usuarioId, plano: perfil.plano || "gratis", horarios: horariosParaSalvar }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Perfil salvo!");
      onSalvo?.();
    } catch {
      toast.error("Erro ao salvar perfil");
    } finally {
      setSalvando(false);
    }
  };

  if (loading) return <p className="text-gray-400 text-sm">Carregando...</p>;

  return (
    <form onSubmit={salvar} className="bg-white rounded-lg shadow p-5 space-y-4 max-w-lg">
      <p className="text-xs text-gray-500 -mt-1">
        Esses dados só são mostrados ao comprador depois que ele libera o contato.
      </p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome da loja/serviço</label>
        <input
          value={perfil.nome_exibicao || ""}
          onChange={(e) => setPerfil((p) => ({ ...p, nome_exibicao: e.target.value }))}
          required
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
        <input
          value={perfil.telefone || ""}
          onChange={(e) => setPerfil((p) => ({ ...p, telefone: e.target.value }))}
          required
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="(75) 9xxxx-xxxx"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (opcional)</label>
        <input
          value={perfil.whatsapp || ""}
          onChange={(e) => setPerfil((p) => ({ ...p, whatsapp: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
        <input
          value={perfil.endereco || ""}
          onChange={(e) => setPerfil((p) => ({ ...p, endereco: e.target.value }))}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="pt-2 border-t">
        <label className="block text-sm font-medium text-gray-700 mb-1">Dados fiscais (opcional)</label>
        <p className="text-xs text-gray-400 mb-2">
          Guardado pra quando a emissão de nota fiscal estiver disponível — preencher agora não emite nada.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            value={perfil.cnpj_cpf || ""}
            onChange={(e) => setPerfil((p) => ({ ...p, cnpj_cpf: e.target.value }))}
            placeholder="CNPJ ou CPF"
            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
          <input
            value={perfil.inscricao_estadual || ""}
            onChange={(e) => setPerfil((p) => ({ ...p, inscricao_estadual: e.target.value }))}
            placeholder="Inscrição estadual"
            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={perfil.regime_tributario || ""}
            onChange={(e) => setPerfil((p) => ({ ...p, regime_tributario: (e.target.value || null) as any }))}
            className="px-3 py-2 border rounded-lg text-sm sm:col-span-2"
          >
            <option value="">Regime tributário (opcional)</option>
            <option value="mei">MEI</option>
            <option value="simples_nacional">Simples Nacional</option>
            <option value="lucro_presumido">Lucro Presumido</option>
            <option value="lucro_real">Lucro Real</option>
          </select>
        </div>
      </div>
      <div className="pt-2 border-t">
        <label className="block text-sm font-medium text-gray-700 mb-1">Horário de funcionamento</label>
        <p className="text-xs text-gray-400 mb-2">
          Público — aparece pra qualquer pessoa como "Aberto agora" quando bate com o horário marcado.
        </p>
        <HorarioSemanaEditor
          horarios={perfil.horarios && perfil.horarios.length > 0 ? perfil.horarios : horariosPadrao()}
          onChange={(horarios) => setPerfil((p) => ({ ...p, horarios }))}
        />
      </div>
      <button
        type="submit"
        disabled={salvando}
        className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 font-medium"
      >
        {salvando ? "Salvando..." : "Salvar perfil"}
      </button>
    </form>
  );
}

function InteressesRecebidos({ fornecedorId }: { fornecedorId: string }) {
  const [interesses, setInteresses] = useState<Interesse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/catalogo/interesses?fornecedor_id=${fornecedorId}`)
      .then((r) => r.json())
      .then((res) => setInteresses(res.success ? res.data : []))
      .finally(() => setLoading(false));
  }, [fornecedorId]);

  if (loading) return <p className="text-gray-400 text-sm">Carregando...</p>;
  if (interesses.length === 0) {
    return <div className="text-center py-12 bg-gray-50 rounded-lg text-gray-500">Nenhum interesse recebido ainda.</div>;
  }

  return (
    <div className="space-y-2">
      {interesses.map((i) => (
        <div key={i.id} className="bg-white border rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{new Date(i.created_at).toLocaleString("pt-BR")}</p>
            <p className="text-xs text-gray-400">Item {i.item_id.slice(0, 8)}</p>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              i.status_fornecedor === "pendente_pagamento"
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {i.status_fornecedor === "pendente_pagamento" ? "Aguardando liberação" : "Liberado"}
          </span>
        </div>
      ))}
    </div>
  );
}
