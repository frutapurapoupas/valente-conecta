"use client";

// Caminho: C:\valente_conecta\components\consumidor\QuizCadastroProduto.tsx
//
// Quiz pra CONSUMIDOR cadastrar um produto que comprou, comprovando com
// foto da nota fiscal/cupom + foto do QR code da nota + foto do produto
// (ver 093_cadastro_consumidor_produto.sql). O lojista identificado (loja
// onde comprou) precisa aprovar antes do produto "aparecer" no catálogo
// colaborativo do PDV pros outros lojistas. Duplicidade é bloqueada de
// verdade pelo backend (POST /api/consumidor/cadastro-produto devolve 409
// produto_ja_existe) — mostramos o alerta e voltamos pro passo do nome.

import { useState } from "react";
import toast from "react-hot-toast";
import { X, ArrowLeft, Search, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { MidiaUploader } from "@/components/catalogo/MidiaUploader";
import { CapturaFotoComprovante } from "@/components/pdv/CapturaFotoComprovante";
import { CapturaCodigoBarras } from "@/components/pdv/CapturaCodigoBarras";
import { BarcodeScanner } from "@/components/pdv/BarcodeScanner";

interface Props {
  usuarioId: string;
  onClose: () => void;
  onSucesso: () => void;
}

type Etapa = "loja" | "produto" | "codigo" | "nota" | "foto" | "qrcode" | "detalhes";

interface Loja {
  usuarioId: string;
  nomeExibicao: string;
  cidade: string | null;
}

const CATEGORIAS = [
  { id: "mercado", label: "Mercado / Mercearia" },
  { id: "farmacia", label: "Farmácia" },
  { id: "auto_pecas", label: "Auto Peças" },
  { id: "acougue", label: "Açougue" },
  { id: "moda", label: "Moda / Roupas" },
  { id: "papelaria", label: "Papelaria" },
  { id: "geral", label: "Outro" },
];

export function QuizCadastroProduto({ usuarioId, onClose, onSucesso }: Props) {
  const [etapa, setEtapa] = useState<Etapa>("loja");

  const [buscaLoja, setBuscaLoja] = useState("");
  const [resultadosLoja, setResultadosLoja] = useState<Loja[]>([]);
  const [buscandoLoja, setBuscandoLoja] = useState(false);
  const [lojaSelecionada, setLojaSelecionada] = useState<Loja | null>(null);

  const [nomeProduto, setNomeProduto] = useState("");
  const [categoria, setCategoria] = useState("mercado");
  const [alertaDuplicidade, setAlertaDuplicidade] = useState<string | null>(null);

  const [ean, setEan] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  const [fotoNotaFiscalPath, setFotoNotaFiscalPath] = useState<string | null>(null);
  const [fotoQrcodePath, setFotoQrcodePath] = useState<string | null>(null);
  const [qrcodeConteudo, setQrcodeConteudo] = useState("");
  const [midiaProduto, setMidiaProduto] = useState<any[]>([]);

  const [precoPago, setPrecoPago] = useState("");
  const [detalhes, setDetalhes] = useState("");
  const [enviando, setEnviando] = useState(false);

  const buscarLojas = async (texto: string) => {
    setBuscaLoja(texto);
    if (texto.trim().length < 2) {
      setResultadosLoja([]);
      return;
    }
    setBuscandoLoja(true);
    try {
      const resp = await fetch(`/api/lojistas/buscar?nome=${encodeURIComponent(texto)}`).then((r) => r.json());
      setResultadosLoja(resp.success ? resp.data : []);
    } finally {
      setBuscandoLoja(false);
    }
  };

  const avancarDoNome = () => {
    if (!nomeProduto.trim()) {
      toast.error("Informe o nome do produto.");
      return;
    }
    setAlertaDuplicidade(null);
    setEtapa("codigo");
  };

  const enviar = async () => {
    if (!lojaSelecionada) return;
    if (!fotoNotaFiscalPath || !midiaProduto[0]?.url || !fotoQrcodePath) {
      toast.error("Faltam fotos obrigatórias.");
      return;
    }
    setEnviando(true);
    try {
      const resp = await fetch("/api/consumidor/cadastro-produto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId,
          fornecedorId: lojaSelecionada.usuarioId,
          nomeProduto: nomeProduto.trim(),
          categoria,
          ean: ean || null,
          precoPago: precoPago ? Number(precoPago) : null,
          detalhes: detalhes.trim() || null,
          fotoProdutoUrl: midiaProduto[0].url,
          fotoNotaFiscalPath,
          fotoQrcodePath,
          qrcodeConteudo: qrcodeConteudo || null,
        }),
      });
      const resultado = await resp.json();
      if (!resultado.success) {
        if (resultado.error === "produto_ja_existe") {
          setAlertaDuplicidade(resultado.nomeExistente || nomeProduto);
          setEtapa("produto");
          return;
        }
        throw new Error(resultado.error);
      }
      toast.success("Cadastro enviado! A loja vai revisar e aprovar.");
      onSucesso();
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar cadastro");
    } finally {
      setEnviando(false);
    }
  };

  const voltar = () => {
    const ordem: Etapa[] = ["loja", "produto", "codigo", "nota", "foto", "qrcode", "detalhes"];
    const idx = ordem.indexOf(etapa);
    if (idx > 0) setEtapa(ordem[idx - 1]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {etapa !== "loja" && (
              <button onClick={voltar}><ArrowLeft className="w-5 h-5 text-gray-500" /></button>
            )}
            <h2 className="font-bold text-gray-800">Cadastrar produto comprado</h2>
          </div>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        {etapa === "loja" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Onde você comprou esse produto?</p>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                value={buscaLoja}
                onChange={(e) => buscarLojas(e.target.value)}
                placeholder="Nome da loja"
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
                autoFocus
              />
            </div>
            {buscandoLoja && <p className="text-sm text-gray-400 flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Buscando...</p>}
            {resultadosLoja.length > 0 && (
              <div className="border rounded-lg divide-y">
                {resultadosLoja.map((loja) => (
                  <button
                    key={loja.usuarioId}
                    onClick={() => {
                      setLojaSelecionada(loja);
                      setEtapa("produto");
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                  >
                    <p className="font-medium text-gray-800">{loja.nomeExibicao}</p>
                    {loja.cidade && <p className="text-xs text-gray-500">{loja.cidade}</p>}
                  </button>
                ))}
              </div>
            )}
            {!buscandoLoja && buscaLoja.trim().length >= 2 && resultadosLoja.length === 0 && (
              <p className="text-sm text-gray-400">Nenhuma loja encontrada com esse nome.</p>
            )}
          </div>
        )}

        {etapa === "produto" && (
          <div className="space-y-3">
            {alertaDuplicidade && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 text-amber-800">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p className="text-sm">
                  O produto <strong>"{alertaDuplicidade}"</strong> já existe no app. Cadastre um produto diferente.
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500">Comprado em: <strong>{lojaSelecionada?.nomeExibicao}</strong></p>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Nome do produto</label>
              <input
                value={nomeProduto}
                onChange={(e) => { setNomeProduto(e.target.value); setAlertaDuplicidade(null); }}
                placeholder="Ex: Refrigerante Coca-Cola 2L"
                className="w-full px-3 py-2 border rounded-lg text-sm"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Categoria</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                {CATEGORIAS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <button onClick={avancarDoNome} className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold">Continuar</button>
          </div>
        )}

        {etapa === "codigo" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Esse produto tem código de barras? Se tiver, ajuda a evitar duplicidade.</p>
            <button
              onClick={() => setShowScanner(true)}
              className="w-full py-3 border-2 border-dashed rounded-xl text-sm text-gray-600 hover:border-blue-500"
            >
              Escanear código de barras
            </button>
            {ean && <p className="text-sm text-emerald-600 text-center">Código lido: {ean}</p>}
            <button onClick={() => setEtapa("nota")} className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold">
              {ean ? "Continuar" : "Não tem código de barras"}
            </button>
          </div>
        )}

        {etapa === "nota" && (
          <div className="space-y-3">
            <CapturaFotoComprovante
              fotoPath={fotoNotaFiscalPath}
              donoId={usuarioId}
              titulo="Foto da nota fiscal / cupom"
              obrigatoria
              onFotoPathChange={setFotoNotaFiscalPath}
            />
            <button
              onClick={() => setEtapa("foto")}
              disabled={!fotoNotaFiscalPath}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
            >
              Continuar
            </button>
          </div>
        )}

        {etapa === "foto" && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Foto do produto</label>
            <MidiaUploader midia={midiaProduto} onChange={setMidiaProduto} maximo={1} />
            <button
              onClick={() => setEtapa("qrcode")}
              disabled={!midiaProduto[0]?.url}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
            >
              Continuar
            </button>
          </div>
        )}

        {etapa === "qrcode" && (
          <div className="space-y-3">
            <CapturaCodigoBarras
              fotoPath={fotoQrcodePath}
              donoId={usuarioId}
              ean={qrcodeConteudo}
              obrigatoria
              titulo="Foto do QR code da nota"
              textoObrigatoria="Obrigatória — é a prova de que a nota é verdadeira. Fica no canto da nota fiscal/cupom."
              onEanChange={setQrcodeConteudo}
              onFotoPathChange={setFotoQrcodePath}
            />
            <button
              onClick={() => setEtapa("detalhes")}
              disabled={!fotoQrcodePath}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
            >
              Continuar
            </button>
          </div>
        )}

        {etapa === "detalhes" && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Preço pago (opcional)</label>
              <input
                type="number" step="0.01" min="0"
                value={precoPago}
                onChange={(e) => setPrecoPago(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Detalhes complementares (opcional)</label>
              <textarea
                value={detalhes}
                onChange={(e) => setDetalhes(e.target.value)}
                rows={3}
                placeholder="Ex: cor, tamanho, marca..."
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <button
              onClick={enviar}
              disabled={enviando}
              className="w-full bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {enviando ? "Enviando..." : "Enviar pra aprovação"}
            </button>
          </div>
        )}
      </div>

      {showScanner && (
        <BarcodeScanner
          onDetected={(codigo) => { setEan(codigo); setShowScanner(false); }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
