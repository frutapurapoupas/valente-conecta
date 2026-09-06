"use client";

// Caminho: C:\valente_conecta\app\indicar-estabelecimento\page.tsx
//
// Reescrita completa -- a versão anterior usava um módulo isolado
// (@/modules/estabelecimento) que consultava uma tabela "estabelecimentos"
// nunca criada em nenhuma migration, e usava um usuário fixo no código
// ("current-user-id"). Agora usa a identidade real do usuário
// (getCurrentUser()) e fala com /api/indicacao-estabelecimento, ligado a
// 100_indicacao_estabelecimento_fornecedor.sql. O admin master revisa em
// /admin-master/indicacoes-estabelecimento, e a indicação aprovada conta
// pra meta de bônus em Moeda Conecta de quem indicou.

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Megaphone, Send } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

interface MinhaIndicacao {
  id: string;
  nome: string;
  categoria: string;
  cidade: string;
  status: "pendente" | "aprovado" | "recusado";
  motivo_recusa: string | null;
  created_at: string;
}

const statusInfo: Record<string, { label: string; classe: string }> = {
  pendente: { label: "Em análise", classe: "bg-amber-100 text-amber-800" },
  aprovado: { label: "Aprovado", classe: "bg-emerald-100 text-emerald-800" },
  recusado: { label: "Não aprovado", classe: "bg-red-100 text-red-800" },
};

export default function IndicarEstabelecimentoPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [minhasIndicacoes, setMinhasIndicacoes] = useState<MinhaIndicacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState({ nome: "", categoria: "", cidade: "", telefone: "", endereco: "", observacoes: "" });

  const carregar = (usuarioId: string) => {
    setCarregando(true);
    fetch(`/api/indicacao-estabelecimento?usuarioId=${usuarioId}`)
      .then((r) => r.json())
      .then((resp) => setMinhasIndicacoes(resp.success ? resp.data : []))
      .finally(() => setCarregando(false));
  };

  useEffect(() => {
    const u = getCurrentUser();
    setUsuario(u);
    if (u?.id) {
      setForm((prev) => ({ ...prev, cidade: u.cidade_base || "" }));
      carregar(u.id);
    } else {
      setCarregando(false);
    }
  }, []);

  const enviar = async () => {
    if (!usuario?.id) {
      toast.error("Faça seu cadastro pra indicar um estabelecimento.");
      return;
    }
    if (!form.nome.trim() || !form.categoria.trim() || !form.cidade.trim()) {
      toast.error("Preencha nome, categoria e cidade.");
      return;
    }
    setEnviando(true);
    try {
      const resp = await fetch("/api/indicacao-estabelecimento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: usuario.id, ...form }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success("Indicação enviada! Vamos avaliar e você acompanha o status aqui.");
      setForm({ nome: "", categoria: "", cidade: usuario.cidade_base || "", telefone: "", endereco: "", observacoes: "" });
      carregar(usuario.id);
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar indicação");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-5">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <Megaphone size={20} />
          <div>
            <h1 className="font-bold text-lg">Indicar estabelecimento</h1>
            <p className="text-sm text-white/90">Conhece uma loja ou fornecedor que ainda não está no app? Indique aqui.</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        <div className="bg-white rounded-2xl shadow p-4 space-y-3">
          <input
            value={form.nome}
            onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
            placeholder="Nome do estabelecimento ou fornecedor *"
            className="w-full px-3 py-2 border rounded-lg"
          />
          <input
            value={form.categoria}
            onChange={(e) => setForm((p) => ({ ...p, categoria: e.target.value }))}
            placeholder="Categoria (ex: mercearia, farmácia, distribuidor) *"
            className="w-full px-3 py-2 border rounded-lg"
          />
          <input
            value={form.cidade}
            onChange={(e) => setForm((p) => ({ ...p, cidade: e.target.value }))}
            placeholder="Cidade *"
            className="w-full px-3 py-2 border rounded-lg"
          />
          <input
            value={form.telefone}
            onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))}
            placeholder="Telefone/WhatsApp (se souber)"
            className="w-full px-3 py-2 border rounded-lg"
          />
          <input
            value={form.endereco}
            onChange={(e) => setForm((p) => ({ ...p, endereco: e.target.value }))}
            placeholder="Endereço (se souber)"
            className="w-full px-3 py-2 border rounded-lg"
          />
          <textarea
            value={form.observacoes}
            onChange={(e) => setForm((p) => ({ ...p, observacoes: e.target.value }))}
            placeholder="Alguma observação? (opcional)"
            rows={2}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <button
            onClick={enviar}
            disabled={enviando}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold py-2.5 rounded-lg disabled:opacity-60"
          >
            <Send size={16} /> {enviando ? "Enviando..." : "Enviar indicação"}
          </button>
        </div>

        <div>
          <h2 className="font-semibold text-gray-700 mb-2">Minhas indicações</h2>
          {carregando ? (
            <p className="text-sm text-gray-500">Carregando...</p>
          ) : minhasIndicacoes.length === 0 ? (
            <p className="text-sm text-gray-500">Você ainda não indicou nenhum estabelecimento.</p>
          ) : (
            <div className="space-y-2">
              {minhasIndicacoes.map((i) => (
                <div key={i.id} className="bg-white rounded-xl shadow-sm p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{i.nome}</p>
                    <p className="text-xs text-gray-500">{i.categoria} · {i.cidade}</p>
                    {i.status === "recusado" && i.motivo_recusa && (
                      <p className="text-xs text-red-600 mt-1">{i.motivo_recusa}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${statusInfo[i.status].classe}`}>
                    {statusInfo[i.status].label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
