"use client";

// Caminho: C:\valente_conecta\app\pdv\responder-demanda\page.tsx
//
// "Quiz" de cadastro rapido do catalogo colaborativo do PDV — pedido do
// dono do produto pra fechar o loop da busca inteligente: o fornecedor
// recebe push quando alguem procura algo que nao existe na plataforma
// (ver app/api/admin-master/demandas-busca/notificar/route.ts), clica no
// link (?demanda=ID&termo=X) e cai aqui pra responder em poucos campos.
//
// O MESMO formulario tambem serve pra "atualizar estoque de quem ja tem
// catalogo existente" (pedido separado do dono do produto): se o EAN
// escaneado ja existe em pdv_produtos_catalogo (outro fornecedor ja
// cadastrou), a tela pre-preenche nome/foto/categoria automaticamente —
// o fornecedor so' confirma preco e quantidade, sem precisar tirar foto
// do produto de novo. E' o link que o lembrete semanal de estoque tambem
// usa (ver app/api/pdv/lembrete-estoque/route.ts).

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, CheckCircle2, Loader2, Package } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { MidiaUploader } from "@/components/catalogo/MidiaUploader";
import { CapturaCodigoBarras } from "@/components/pdv/CapturaCodigoBarras";
import { ModalCompletarPerfilVitrine } from "@/components/pdv/ModalCompletarPerfilVitrine";
import type { MidiaItem } from "@/lib/catalogo/marketplaceTypes";

const SEGMENTOS = [
  { id: "mercado", nome: "Mercado / Mercearia" },
  { id: "farmacia", nome: "Farmácia" },
  { id: "auto_pecas", nome: "Auto Peças" },
  { id: "acougue", nome: "Açougue" },
  { id: "moda", nome: "Moda / Roupas" },
  { id: "papelaria", nome: "Papelaria" },
  { id: "geral", nome: "Outro" },
];

export default function ResponderDemandaPage() {
  const router = useRouter();
  const params = useSearchParams();
  const demandaId = params.get("demanda");
  const termo = params.get("termo") || "";

  const [usuario, setUsuario] = useState<any>(null);
  const [carregandoAuth, setCarregandoAuth] = useState(true);

  const [ean, setEan] = useState("");
  const [fotoCodigoBarrasUrl, setFotoCodigoBarrasUrl] = useState<string | null>(null);
  const [buscandoNoCatalogo, setBuscandoNoCatalogo] = useState(false);
  const [produtoJaExistia, setProdutoJaExistia] = useState(false);

  const [nome, setNome] = useState(termo);
  const [categoria, setCategoria] = useState("");
  const [segmento, setSegmento] = useState("geral");
  const [midiaProduto, setMidiaProduto] = useState<MidiaItem[]>([]);
  const [preco, setPreco] = useState<number | "">("");
  const [quantidade, setQuantidade] = useState<number | "">(1);

  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const [categoriasNegocio, setCategoriasNegocio] = useState<{ id: string; nome: string }[]>([]);
  const [showCompletarPerfil, setShowCompletarPerfil] = useState(false);
  const [perfilPendente, setPerfilPendente] = useState<any>(null);
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);

  useEffect(() => {
    const u = getCurrentUser();
    setUsuario(u);
    setCarregandoAuth(false);
  }, []);

  useEffect(() => {
    fetch("/api/planos-config")
      .then((r) => r.json())
      .then((resp) => { if (resp.success) setCategoriasNegocio(resp.data.services.map((s: any) => ({ id: s.id, nome: s.nome }))); })
      .catch(() => {});
  }, []);

  // Quando o EAN vem preenchido (foto decodificada), verifica se o produto
  // ja existe no catalogo colaborativo pra pre-preencher — isso e' o que
  // faz essa mesma tela servir tanto pra produto novo quanto pra "eu ja
  // vendo isso, so' quero adicionar meu estoque".
  useEffect(() => {
    if (ean.length < 8) return;
    setBuscandoNoCatalogo(true);
    fetch(`/api/pdv/catalogo/buscar-externo?ean=${encodeURIComponent(ean)}`)
      .then((r) => r.json())
      .then((resp) => {
        if (resp.success && resp.data) {
          setNome(resp.data.nome);
          setCategoria(resp.data.categoria || "");
          setSegmento(resp.data.segmento || "geral");
          if (resp.data.foto_url) setMidiaProduto([{ tipo: "imagem", url: resp.data.foto_url, thumb_url: resp.data.foto_url, ordem: 0 }]);
          setProdutoJaExistia(true);
        } else {
          setProdutoJaExistia(false);
        }
      })
      .catch(() => {})
      .finally(() => setBuscandoNoCatalogo(false));
  }, [ean]);

  const enviar = async (perfilOverride?: { endereco: string; categoriaNegocio: string; nomeExibicao: string }) => {
    if (!usuario) return;
    if (!nome.trim()) { toast.error("Informe o nome do produto"); return; }
    if (!preco || Number(preco) <= 0) { toast.error("Informe o preço de venda"); return; }

    setEnviando(true);
    try {
      const resp = await fetch("/api/pdv/responder-demanda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donoId: usuario.id,
          demandaId: demandaId || undefined,
          nome: nome.trim(),
          categoria: categoria || undefined,
          segmento,
          preco: Number(preco),
          quantidade: Number(quantidade) || 0,
          ean: ean || undefined,
          fotoProdutoUrl: midiaProduto[0]?.url || null,
          fotoCodigoBarrasUrl: fotoCodigoBarrasUrl || undefined,
        }),
      }).then((r) => r.json());

      if (!resp.success) {
        if (resp.error === "perfil_incompleto") {
          setPerfilPendente(resp.perfil);
          setShowCompletarPerfil(true);
          return;
        }
        throw new Error(resp.error);
      }

      setSucesso(true);
      toast.success("Produto publicado!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao publicar produto");
    } finally {
      setEnviando(false);
    }
  };

  const confirmarPerfilEEnviar = async (dados: { nome: string; endereco: string; categoriaNegocio: string }) => {
    if (!usuario) return;
    if (!dados.nome.trim() || !dados.endereco.trim() || !dados.categoriaNegocio) {
      toast.error("Preencha nome da loja, endereço e categoria do negócio");
      return;
    }
    setSalvandoPerfil(true);
    try {
      const resp = await fetch("/api/pdv/perfil-vitrine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: usuario.id, nomeExibicao: dados.nome.trim(), endereco: dados.endereco.trim(), categoriaNegocio: dados.categoriaNegocio }),
      }).then((r) => r.json());
      if (!resp.success) throw new Error(resp.error);
      setShowCompletarPerfil(false);
      await enviar();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar perfil");
    } finally {
      setSalvandoPerfil(false);
    }
  };

  if (carregandoAuth) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>;
  }

  if (!usuario) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-gray-600 mb-4">Entre com sua conta de fornecedor pra responder.</p>
        <button onClick={() => router.push("/login")} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold">Entrar</button>
      </div>
    );
  }

  if (sucesso) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <CheckCircle2 className="w-14 h-14 text-emerald-500 mb-3" />
        <h1 className="text-lg font-bold text-gray-800">Produto publicado!</h1>
        <p className="text-gray-500 text-sm mt-1 max-w-xs">
          {demandaId ? "Quem buscou já foi avisado que o produto está disponível." : "Já está na vitrine e no seu estoque do PDV."}
        </p>
        <button onClick={() => router.push("/pdv/estoque")} className="mt-6 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold">
          Ver meu estoque
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <Toaster position="top-center" />
      <div className="bg-white border-b px-4 py-3 flex items-center gap-2 sticky top-0 z-10">
        <button onClick={() => router.back()}><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
        <div>
          <h1 className="font-bold text-gray-800 text-sm flex items-center gap-1.5"><Package className="w-4 h-4" /> Cadastrar produto</h1>
          {termo && <p className="text-xs text-gray-500">Alguém está procurando: "{termo}"</p>}
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-5">
        <CapturaCodigoBarras fotoUrl={fotoCodigoBarrasUrl} ean={ean} onEanChange={setEan} onFotoChange={setFotoCodigoBarrasUrl} />
        {buscandoNoCatalogo && <p className="text-xs text-gray-400">Verificando se esse produto já existe no catálogo...</p>}
        {produtoJaExistia && (
          <p className="text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
            Esse produto já existe no catálogo — preenchemos os dados. Confirme preço e quantidade do seu estoque.
          </p>
        )}

        <div>
          <label className="text-sm font-medium text-gray-700">Nome do produto</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Arroz Tio João 5kg" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Categoria do produto</label>
          <select value={segmento} onChange={(e) => setSegmento(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white">
            {SEGMENTOS.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
        </div>

        {!produtoJaExistia && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Foto do produto</label>
            <MidiaUploader midia={midiaProduto} onChange={setMidiaProduto} maximo={1} />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Preço de venda (R$)</label>
            <input
              type="number" min={0} step="0.01" value={preco}
              onChange={(e) => setPreco(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0,00" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Quantidade em estoque</label>
            <input
              type="number" min={0} value={quantidade}
              onChange={(e) => setQuantidade(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        <button
          onClick={() => enviar()}
          disabled={enviando}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publicar"}
        </button>
      </div>

      {showCompletarPerfil && (
        <ModalCompletarPerfilVitrine
          nomeInicial={perfilPendente?.nome_exibicao || usuario.nome || ""}
          enderecoInicial={perfilPendente?.endereco || ""}
          categoriaNegocioInicial={perfilPendente?.categoria_negocio || ""}
          categoriasNegocio={categoriasNegocio}
          salvando={salvandoPerfil}
          onClose={() => setShowCompletarPerfil(false)}
          onConfirmar={confirmarPerfilEEnviar}
        />
      )}
    </div>
  );
}
