"use client";

// Caminho: C:\valente_conecta\app\pdv\importar-estoque\page.tsx
//
// Wizard de importação de planilha de estoque — publica vários produtos de
// uma vez no catálogo (em vez de item a item, único jeito que existia até
// aqui). Identidade do lojista via getCurrentUser() (lib/auth.ts), mesmo
// padrão de app/pdv/estoque, app/pdv/caixa e app/pdv/captura-externa.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileSpreadsheet } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { PdvSubNav } from "@/components/pdv/PdvSubNav";
import { SemPermissaoPdv } from "@/components/pdv/SemPermissaoPdv";
import { getOperadorAtivo, temPermissao, type OperadorAtivo } from "@/lib/pdv/operadorPdv";
import { PassoUpload } from "./components/PassoUpload";
import { PassoMapeamento } from "./components/PassoMapeamento";
import { PassoRevisao } from "./components/PassoRevisao";
import { PassoResultado } from "./components/PassoResultado";
import { useImportacaoEstoque } from "./hooks/useImportacaoEstoque";

type Passo = "upload" | "mapeamento" | "revisao" | "resultado";

export default function ImportarEstoquePage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [loadingUsuario, setLoadingUsuario] = useState(true);
  const [passo, setPasso] = useState<Passo>("upload");
  const [operador, setOperador] = useState<OperadorAtivo | null>(null);

  const {
    nomeArquivo,
    cabecalho,
    linhasBrutas,
    mapeamento,
    setMapeamento,
    modulo,
    setModulo,
    erroArquivo,
    carregarArquivo,
    linhasProcessadas,
    enviando,
    progresso,
    resultados,
    publicar,
  } = useImportacaoEstoque();

  useEffect(() => {
    setUsuario(getCurrentUser());
    setOperador(getOperadorAtivo());
    setLoadingUsuario(false);
  }, []);

  const handleArquivo = async (arquivo: File) => {
    await carregarArquivo(arquivo);
    setPasso("mapeamento");
  };

  const handlePublicar = async () => {
    if (!usuario) return;
    setPasso("resultado");
    await publicar(usuario.id);
  };

  const reiniciar = () => {
    setPasso("upload");
  };

  if (!loadingUsuario && !usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <p className="text-gray-600">Complete seu cadastro para importar seu estoque.</p>
      </div>
    );
  }

  if (operador && !temPermissao(operador, "importar-estoque")) {
    return <SemPermissaoPdv />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b sticky top-0 z-30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-gray-800 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-blue-600" /> Importar planilha
        </h1>
      </header>
      <PdvSubNav ativa="importar-estoque" operador={operador} />

      {passo !== "upload" && (
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
            <span>{nomeArquivo}</span>
            <span>Passo {["mapeamento", "revisao", "resultado"].indexOf(passo) + 2} de 4</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${((["upload", "mapeamento", "revisao", "resultado"].indexOf(passo) + 1) / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="bg-white rounded-2xl shadow-sm border p-4">
          {passo === "upload" && <PassoUpload onArquivoSelecionado={handleArquivo} erro={erroArquivo} />}

          {passo === "mapeamento" && (
            <>
              <PassoMapeamento
                cabecalho={cabecalho}
                linhasBrutas={linhasBrutas}
                mapeamento={mapeamento}
                onChangeMapeamento={setMapeamento}
                modulo={modulo}
                onChangeModulo={setModulo}
              />
              <button
                onClick={() => setPasso("revisao")}
                disabled={mapeamento.nome === null || mapeamento.preco === null}
                className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium"
              >
                Continuar
              </button>
            </>
          )}

          {passo === "revisao" && (
            <PassoRevisao
              validas={linhasProcessadas.validas}
              invalidas={linhasProcessadas.invalidas}
              enviando={enviando}
              progresso={progresso}
              onPublicar={handlePublicar}
            />
          )}

          {passo === "resultado" && <PassoResultado resultados={resultados} onNovaImportacao={reiniciar} />}
        </div>
      </div>
    </div>
  );
}
