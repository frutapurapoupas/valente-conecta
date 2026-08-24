"use client";

// Caminho: C:\valente_conecta\components\pdv\SelecionarOperadorPdv.tsx
//
// Gate de operador do PDV multi-máquina: só aparece quando a loja já tem
// pelo menos 1 funcionário cadastrado (ver app/pdv/page.tsx). Escolhe o
// nome numa lista e digita o PIN — mesmo espírito do "login lúdico" já
// usado no painel da Agenda, adaptado pro PDV.

import { useState } from "react";
import { User, ArrowLeft, Store } from "lucide-react";
import { setOperadorAtivo, type OperadorAtivo } from "@/lib/pdv/operadorPdv";

interface FuncionarioPdv {
  id: string;
  nome: string;
  permissoes: Record<string, boolean>;
  ativo: boolean;
}

export function SelecionarOperadorPdv({
  donoNome,
  funcionarios,
  onSelecionado,
}: {
  donoNome?: string;
  funcionarios: FuncionarioPdv[];
  onSelecionado: (operador: OperadorAtivo) => void;
}) {
  const [escolhido, setEscolhido] = useState<FuncionarioPdv | null>(null);
  const [pin, setPin] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState("");

  const entrarComoDono = () => {
    const operador: OperadorAtivo = { id: null, nome: donoNome || "Dono", permissoes: {}, ehDono: true };
    setOperadorAtivo(operador);
    onSelecionado(operador);
  };

  const confirmarPin = async () => {
    if (!escolhido || pin.length < 4) return;
    setEntrando(true);
    setErro("");
    try {
      const resp = await fetch("/api/pdv/funcionarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ funcionarioId: escolhido.id, pin }),
      });
      const resultado = await resp.json();
      if (!resultado.success) {
        setErro(resultado.error || "PIN incorreto");
        return;
      }
      const operador: OperadorAtivo = {
        id: resultado.data.id,
        nome: resultado.data.nome,
        permissoes: resultado.data.permissoes || {},
        ehDono: false,
      };
      setOperadorAtivo(operador);
      onSelecionado(operador);
    } catch {
      setErro("Falha de conexão");
    } finally {
      setEntrando(false);
    }
  };

  const ativos = funcionarios.filter((f) => f.ativo);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border p-6 max-w-sm w-full">
        {!escolhido ? (
          <>
            <h1 className="font-bold text-gray-800 text-lg mb-1">Quem está operando o caixa?</h1>
            <p className="text-sm text-gray-400 mb-4">Escolha seu nome pra continuar.</p>
            <div className="space-y-1.5">
              <button
                onClick={entrarComoDono}
                className="w-full text-left p-3 border-2 border-blue-200 rounded-xl hover:bg-blue-50 flex items-center gap-2.5"
              >
                <Store className="w-4.5 h-4.5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm text-blue-700">Sou {donoNome || "o dono"}</p>
                  <p className="text-xs text-blue-400">Acesso total, sem PIN</p>
                </div>
              </button>
              {ativos.map((f) => (
                <button
                  key={f.id}
                  onClick={() => { setEscolhido(f); setErro(""); setPin(""); }}
                  className="w-full text-left p-3 border rounded-xl hover:bg-gray-50 flex items-center gap-2.5"
                >
                  <User className="w-4.5 h-4.5 text-gray-400" />
                  <p className="font-medium text-sm text-gray-800">{f.nome}</p>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button onClick={() => setEscolhido(null)} className="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm mb-3">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <h1 className="font-bold text-gray-800 text-lg mb-1">Olá, {escolhido.nome}</h1>
            <p className="text-sm text-gray-400 mb-4">Digite seu PIN pra entrar.</p>
            <input
              autoFocus
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && confirmarPin()}
              placeholder="••••"
              className="w-full px-3 py-3 border-2 rounded-xl text-center text-2xl tracking-[0.5em] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {erro && <p className="text-sm text-red-600 mt-2 text-center">{erro}</p>}
            <button
              onClick={confirmarPin}
              disabled={entrando || pin.length < 4}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold"
            >
              {entrando ? "Entrando..." : "Entrar"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
