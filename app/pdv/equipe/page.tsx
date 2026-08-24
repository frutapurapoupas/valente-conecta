"use client";

// Caminho: C:\valente_conecta\app\pdv\equipe\page.tsx
//
// Cadastro de funcionários (operadores internos) do PDV — só o dono usa.
// Cada funcionário loga num terminal por PIN (ver
// components/pdv/SelecionarOperadorPdv.tsx) e só enxerga/faz o que as
// permissões marcadas aqui liberarem (ver lib/pdv/permissoesFuncionario.ts).

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Users, Plus, X, Pencil, KeyRound } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { PdvSubNav } from "@/components/pdv/PdvSubNav";
import { SemPermissaoPdv } from "@/components/pdv/SemPermissaoPdv";
import { getOperadorAtivo, type OperadorAtivo } from "@/lib/pdv/operadorPdv";
import { PERMISSOES_PDV, type ChavePermissaoPdv, type PermissoesFuncionario } from "@/lib/pdv/permissoesFuncionario";

interface FuncionarioPdv {
  id: string;
  nome: string;
  permissoes: PermissoesFuncionario;
  ativo: boolean;
  created_at: string;
}

function ListaPermissoes({
  valores,
  onMudar,
}: {
  valores: PermissoesFuncionario;
  onMudar: (chave: ChavePermissaoPdv, marcado: boolean) => void;
}) {
  return (
    <div className="space-y-1.5 max-h-56 overflow-y-auto border rounded-xl p-3">
      {PERMISSOES_PDV.map((p) => (
        <label key={p.chave} className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={Boolean(valores[p.chave])}
            onChange={(e) => onMudar(p.chave, e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          {p.label}
        </label>
      ))}
    </div>
  );
}

export default function PdvEquipePage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [funcionarios, setFuncionarios] = useState<FuncionarioPdv[]>([]);
  const [operador, setOperador] = useState<OperadorAtivo | null>(null);

  const [showNovo, setShowNovo] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoPin, setNovoPin] = useState("");
  const [novoPermissoes, setNovoPermissoes] = useState<PermissoesFuncionario>({});
  const [salvando, setSalvando] = useState(false);

  const [editando, setEditando] = useState<FuncionarioPdv | null>(null);
  const [editPermissoes, setEditPermissoes] = useState<PermissoesFuncionario>({});
  const [editNovoPin, setEditNovoPin] = useState("");

  const carregar = async (usuarioId: string) => {
    const resp = await fetch(`/api/pdv/funcionarios?donoId=${usuarioId}`, { cache: "no-store" }).then((r) => r.json());
    if (resp.success) setFuncionarios(resp.data);
    setLoading(false);
  };

  useEffect(() => {
    const u = getCurrentUser();
    setUsuario(u);
    setOperador(getOperadorAtivo());
    if (u) carregar(u.id);
    else setLoading(false);
  }, []);

  const cadastrarFuncionario = async () => {
    if (!usuario) return;
    if (!novoNome.trim()) { toast.error("Informe o nome"); return; }
    if (!/^\d{4,6}$/.test(novoPin)) { toast.error("PIN precisa ter de 4 a 6 números"); return; }
    setSalvando(true);
    try {
      const resp = await fetch("/api/pdv/funcionarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donoId: usuario.id, nome: novoNome.trim(), pin: novoPin, permissoes: novoPermissoes }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Funcionário cadastrado!");
      setShowNovo(false);
      setNovoNome(""); setNovoPin(""); setNovoPermissoes({});
      carregar(usuario.id);
    } catch (error: any) {
      toast.error(error.message || "Erro ao cadastrar");
    } finally {
      setSalvando(false);
    }
  };

  const abrirEdicao = (f: FuncionarioPdv) => {
    setEditando(f);
    setEditPermissoes(f.permissoes || {});
    setEditNovoPin("");
  };

  const salvarEdicao = async () => {
    if (!editando || !usuario) return;
    if (editNovoPin && !/^\d{4,6}$/.test(editNovoPin)) { toast.error("PIN precisa ter de 4 a 6 números"); return; }
    setSalvando(true);
    try {
      const resp = await fetch(`/api/pdv/funcionarios?id=${editando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissoes: editPermissoes, ...(editNovoPin ? { pin: editNovoPin } : {}) }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Atualizado!");
      setEditando(null);
      carregar(usuario.id);
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar");
    } finally {
      setSalvando(false);
    }
  };

  const alternarAtivo = async (f: FuncionarioPdv) => {
    if (!usuario) return;
    await fetch(`/api/pdv/funcionarios?id=${f.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !f.ativo }),
    });
    carregar(usuario.id);
  };

  if (!usuario && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <p className="text-gray-600">Complete seu cadastro pra gerenciar sua equipe.</p>
      </div>
    );
  }

  if (operador && !operador.ehDono) {
    return <SemPermissaoPdv />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b sticky top-0 z-30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()}><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-bold text-gray-800 flex items-center gap-2"><Users className="w-5 h-5 text-blue-600" /> Equipe</h1>
      </header>
      <PdvSubNav ativa="equipe" operador={operador} />

      <div className="p-4 max-w-lg mx-auto space-y-3">
        <p className="text-sm text-gray-400">
          Cada funcionário loga com nome + PIN direto na tela de venda e só acessa o que você liberar aqui. Você (dono) sempre tem acesso total.
        </p>

        <button
          onClick={() => setShowNovo(true)}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-xl py-3 font-medium hover:bg-blue-50"
        >
          <Plus className="w-4 h-4" /> Novo funcionário
        </button>

        {loading ? (
          <p className="text-sm text-gray-400 text-center py-8">Carregando...</p>
        ) : funcionarios.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Nenhum funcionário cadastrado ainda — a tela de venda continua abrindo direto pra você.</p>
        ) : (
          <div className="space-y-2">
            {funcionarios.map((f) => (
              <div key={f.id} className="bg-white border rounded-xl p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-800 text-sm flex items-center gap-2">
                    {f.nome}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${f.ativo ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      {f.ativo ? "ativo" : "inativo"}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">{Object.values(f.permissoes || {}).filter(Boolean).length} permissões liberadas</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => abrirEdicao(f)} className="p-2 text-gray-400 hover:text-blue-600" title="Editar permissões / redefinir PIN">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => alternarAtivo(f)} className="px-2.5 py-1.5 text-xs font-medium rounded-lg border text-gray-600 hover:bg-gray-50">
                    {f.ativo ? "Desativar" : "Reativar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showNovo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full max-h-[85vh] overflow-y-auto p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">Novo funcionário</h2>
              <button onClick={() => setShowNovo(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500">Nome</label>
                <input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} autoFocus className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">PIN (4 a 6 números)</label>
                <input
                  value={novoPin}
                  onChange={(e) => setNovoPin(e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="••••"
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm tracking-widest"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Permissões</label>
                <ListaPermissoes valores={novoPermissoes} onMudar={(chave, marcado) => setNovoPermissoes((prev) => ({ ...prev, [chave]: marcado }))} />
              </div>
              <button onClick={cadastrarFuncionario} disabled={salvando} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold disabled:opacity-60">
                {salvando ? "Cadastrando..." : "Cadastrar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editando && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full max-h-[85vh] overflow-y-auto p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800">{editando.nome}</h2>
              <button onClick={() => setEditando(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Permissões</label>
                <ListaPermissoes valores={editPermissoes} onMudar={(chave, marcado) => setEditPermissoes((prev) => ({ ...prev, [chave]: marcado }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 flex items-center gap-1"><KeyRound className="w-3.5 h-3.5" /> Redefinir PIN (opcional)</label>
                <input
                  value={editNovoPin}
                  onChange={(e) => setEditNovoPin(e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Deixe em branco pra manter o atual"
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-sm tracking-widest"
                />
              </div>
              <button onClick={salvarEdicao} disabled={salvando} className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold disabled:opacity-60">
                {salvando ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
