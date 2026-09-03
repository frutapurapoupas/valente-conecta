"use client";

// Caminho: C:\valente_conecta\components\consumidor\QuizCadastroProduto.tsx
//
// Quiz pra CONSUMIDOR cadastrar um produto que comprou, comprovando com
// foto da nota fiscal/cupom + foto do código de barras da nota + foto do produto
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
import { BarcodeScanner } from "@/components/pdv/BarcodeScanner";

interface Props {
  usuarioId: string;
  onClose: () => void;
  onSucesso: () => void;
}

type Etapa = "loja" | "nota" | "qrcode" | "codigo" | "produto" | "foto" | "detalhes" | "sucesso";

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
  const [produtosEnviados, setProdutosEnviados] = useState(0);

  const [buscaLoja, setBuscaLoja] = useState("");
  const [resultadosLoja, setResultadosLoja] = useState<Loja[]>([]);
  const [buscandoLoja, setBuscandoLoja] = useState(false);
  const [lojaSelecionada, setLojaSelecionada] = useState<Loja | null>(null);
  const [nomeLojaTexto, setNomeLojaTexto] = useState<string | null>(null);

  const [nomeProduto, setNomeProduto] = useState("");
  const [categoria, setCategoria] = useState("mercado");
  const [alertaDuplicidade, setAlertaDuplicidade] = useState<string | null>(null);

  const [ean, setEan] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [verificandoEan, setVerificandoEan] = useState(false);

  const [fotoNotaFiscalPath, setFotoNotaFiscalPath] = useState<string | null>(null);
  const [fotoQrcodePath, setFotoQrcodePath] = useState<string | null>(null);
  const [qrcodeConteudo, setQrcodeConteudo] = useState("");
  const [showScannerQrcode, setShowScannerQrcode] = useState(false);
  const [enviandoFotoQrcode, setEnviandoFotoQrcode] = useState(false);
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

  // Le' o codigo de barras da NOTA (nao do produto) AO VIVO -- mesmo scanner
  // por camera usado no codigo de barras do produto, unifica os dois passos
  // de "escanear codigo" no mesmo jeito de usar, em vez de abrir o app de
  // camera nativo do celular como antes -- e sobe o recorte que decodificou
  // como foto comprovante (obrigatorio pra essa etapa, diferente do codigo
  // de barras do produto que e' so' leitura, sem precisar arquivar).
  const handleCodigoNotaDetectado = async (codigo: string, fotoBlob?: Blob) => {
    setShowScannerQrcode(false);
    if (!fotoBlob) {
      toast.error("Não deu pra capturar a foto. Tente escanear de novo.");
      return;
    }
    setQrcodeConteudo(codigo);
    setEnviandoFotoQrcode(true);
    try {
      const formData = new FormData();
      formData.append("arquivo", fotoBlob, "codigo-nota.jpg");
      formData.append("donoId", usuarioId);
      const resp = await fetch("/api/upload/comprovante-catalogo", { method: "POST", body: formData }).then((r) => r.json());
      if (!resp.success) throw new Error(resp.error || "Falha no upload");
      setFotoQrcodePath(resp.path);
      toast.success("Código de barras da nota capturado!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar a foto do código de barras.");
    } finally {
      setEnviandoFotoQrcode(false);
    }
  };

  const handleEanDetectado = async (codigo: string) => {
    setShowScanner(false);
    setVerificandoEan(true);
    try {
      const resp = await fetch(`/api/consumidor/cadastro-produto/verificar-ean?ean=${encodeURIComponent(codigo)}`).then((r) => r.json());
      if (resp.success && resp.existe) {
        // Ja existe no catalogo -- avisa na hora, sem fazer o consumidor
        // tirar as 3 fotos (nota fiscal, produto, QR code) pra so' descobrir
        // isso no final (mesmo bloqueio que ja existia no POST, so' que mais cedo).
        toast.error("Esse produto já existe no catálogo. Escaneie outro produto.");
        setAlertaDuplicidade(resp.nome || codigo);
        setEan("");
        return;
      }
      setEan(codigo);
    } catch {
      // Falha na checagem nao deve travar o cadastro -- segue com o codigo
      // lido normalmente, o POST final ainda confere de novo por garantia.
      setEan(codigo);
    } finally {
      setVerificandoEan(false);
    }
  };

  const avancarDoNome = () => {
    if (!nomeProduto.trim()) {
      toast.error("Informe o nome do produto.");
      return;
    }
    setAlertaDuplicidade(null);
    setEtapa("foto");
  };

  // Reseta so' os campos ESPECIFICOS DO PRODUTO (mantem loja, nota fiscal e
  // QR code, que valem pra nota inteira) -- pra cadastrar o proximo produto
  // da MESMA nota sem repetir as fotos de comprovante, que ja foram
  // tiradas uma vez so' no comeco.
  const cadastrarOutroProdutoDaMesmaNota = () => {
    setNomeProduto("");
    setCategoria("mercado");
    setEan("");
    setMidiaProduto([]);
    setPrecoPago("");
    setDetalhes("");
    setAlertaDuplicidade(null);
    setEtapa("codigo");
  };

  const enviar = async () => {
    if (!lojaSelecionada && !nomeLojaTexto) return;
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
          fornecedorId: lojaSelecionada?.usuarioId || null,
          nomeLojaTexto: lojaSelecionada ? null : nomeLojaTexto,
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
      setProdutosEnviados((n) => n + 1);
      setEtapa("sucesso");
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar cadastro");
    } finally {
      setEnviando(false);
    }
  };

  const voltar = () => {
    const ordem: Etapa[] = ["loja", "nota", "qrcode", "codigo", "produto", "foto", "detalhes"];
    const idx = ordem.indexOf(etapa);
    if (idx > 0) setEtapa(ordem[idx - 1]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {etapa !== "loja" && etapa !== "sucesso" && (
              <button onClick={voltar}><ArrowLeft className="w-5 h-5 text-gray-500" /></button>
            )}
            <h2 className="font-bold text-gray-800">Cadastrar produto comprado</h2>
          </div>
          <button onClick={() => (produtosEnviados > 0 ? onSucesso() : onClose())}><X className="w-5 h-5 text-gray-400" /></button>
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
                      setNomeLojaTexto(null);
                      setEtapa("nota");
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
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Nenhuma loja encontrada com esse nome.</p>
                <button
                  onClick={() => {
                    setLojaSelecionada(null);
                    setNomeLojaTexto(buscaLoja.trim());
                    setEtapa("nota");
                  }}
                  className="w-full py-2.5 border-2 border-dashed rounded-xl text-sm text-gray-600 hover:border-blue-500"
                >
                  A loja ainda não tem cadastro no app — continuar assim mesmo
                </button>
              </div>
            )}
          </div>
        )}

        {etapa === "nota" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Comprado em: <strong>{lojaSelecionada?.nomeExibicao || nomeLojaTexto}</strong></p>
            <CapturaFotoComprovante
              fotoPath={fotoNotaFiscalPath}
              donoId={usuarioId}
              titulo="Foto da nota fiscal / cupom"
              obrigatoria
              onFotoPathChange={setFotoNotaFiscalPath}
            />
            <button
              onClick={() => setEtapa("qrcode")}
              disabled={!fotoNotaFiscalPath}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
            >
              Continuar
            </button>
          </div>
        )}

        {etapa === "qrcode" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Aponte a câmera pro código de barras impresso na nota fiscal/cupom (obrigatório — é a prova de que a nota é verdadeira).
            </p>
            <button
              onClick={() => setShowScannerQrcode(true)}
              disabled={enviandoFotoQrcode}
              className="w-full py-3 border-2 border-dashed rounded-xl text-sm text-gray-600 hover:border-blue-500 disabled:opacity-60"
            >
              {enviandoFotoQrcode ? "Salvando foto..." : fotoQrcodePath ? "Escanear de novo" : "Escanear código de barras da nota"}
            </button>
            {fotoQrcodePath && <p className="text-sm text-emerald-600 text-center">Código de barras da nota capturado ✓</p>}
            <p className="text-xs text-gray-400">
              Se sua nota tiver mais de um produto, essa foto vale pra todos — você só tira uma vez.
            </p>
            <button
              onClick={() => setEtapa("codigo")}
              disabled={!fotoQrcodePath}
              className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
            >
              Continuar
            </button>
          </div>
        )}

        {etapa === "codigo" && (
          <div className="space-y-3">
            {produtosEnviados > 0 && (
              <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                Produto {produtosEnviados + 1} dessa nota — nota fiscal e código de barras da nota já registrados.
              </p>
            )}
            {alertaDuplicidade && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 text-amber-800">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p className="text-sm">
                  O produto <strong>"{alertaDuplicidade}"</strong> já existe no app. Escaneie outro produto ou continue sem código de barras.
                </p>
              </div>
            )}
            <p className="text-sm text-gray-600">Esse produto tem código de barras? Escaneie primeiro — ajuda a evitar duplicidade antes de você tirar as fotos.</p>
            <button
              onClick={() => { setAlertaDuplicidade(null); setShowScanner(true); }}
              disabled={verificandoEan}
              className="w-full py-3 border-2 border-dashed rounded-xl text-sm text-gray-600 hover:border-blue-500 disabled:opacity-60"
            >
              {verificandoEan ? "Verificando código..." : "Escanear código de barras"}
            </button>
            {ean && <p className="text-sm text-emerald-600 text-center">Código lido: {ean}</p>}
            <button onClick={() => setEtapa("produto")} className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold">
              {ean ? "Continuar" : "Não tem código de barras"}
            </button>
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
            {!lojaSelecionada && nomeLojaTexto && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
                Essa loja ainda não tem cadastro no app. Seu produto fica registrado e, quando ela se cadastrar e for validada, poderá aprovar e você ganha normalmente.
              </p>
            )}
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

        {etapa === "foto" && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Foto do produto</label>
            <MidiaUploader midia={midiaProduto} onChange={setMidiaProduto} maximo={1} />
            <button
              onClick={() => setEtapa("detalhes")}
              disabled={!midiaProduto[0]?.url}
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

        {etapa === "sucesso" && (
          <div className="space-y-4 text-center py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <div>
              <p className="font-semibold text-gray-800">Produto cadastrado!</p>
              <p className="text-sm text-gray-500 mt-1">A loja vai revisar e aprovar. Essa nota tem mais algum produto?</p>
            </div>
            <div className="space-y-2">
              <button
                onClick={cadastrarOutroProdutoDaMesmaNota}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold"
              >
                Cadastrar outro produto dessa nota
              </button>
              <button
                onClick={onSucesso}
                className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-xl text-sm font-semibold"
              >
                Concluir
              </button>
            </div>
          </div>
        )}
      </div>

      {showScanner && (
        <BarcodeScanner
          onDetected={handleEanDetectado}
          onClose={() => setShowScanner(false)}
        />
      )}

      {showScannerQrcode && (
        <BarcodeScanner
          titulo="Escanear código de barras da nota"
          instrucaoCamera="Centralize o código de barras da nota fiscal/cupom no quadro. A leitura tenta sozinha, mas você pode tocar em 'Tirar foto agora' pra forçar."
          capturarFoto
          onDetected={handleCodigoNotaDetectado}
          onClose={() => setShowScannerQrcode(false)}
        />
      )}
    </div>
  );
}
