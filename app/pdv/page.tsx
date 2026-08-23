"use client";

// Caminho: C:\valente_conecta\app\pdv\page.tsx
//
// Shell da frente de caixa: carrega usuário/estoque/clientes uma vez só,
// decide qual layout mostrar (usePdvLayoutPreference) e dá o botão pro
// lojista trocar de versão a qualquer momento. Antes disso era um
// protótipo com dado fictício (clientes fixos no código, produtos mock,
// chamando /api/pdv/produtos e /api/pdv/vendas que não existiam) — agora
// usa o estoque e o fiado reais que já existem no app.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Monitor, Smartphone, Store } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { PdvSubNav } from "@/components/pdv/PdvSubNav";
import { usePdvLayoutPreference } from "@/lib/hooks/usePdvLayoutPreference";
import { FrenteCaixaDesktop } from "@/components/pdv/FrenteCaixaDesktop";
import { FrenteCaixaMobile } from "@/components/pdv/FrenteCaixaMobile";
import type { ClienteFiado, ProdutoPDV } from "@/lib/pdv/frenteCaixaTypes";

export default function PDVPage() {
  const router = useRouter();
  const { layout, setLayout, carregado } = usePdvLayoutPreference();
  const [usuario, setUsuario] = useState<any>(null);
  const [produtos, setProdutos] = useState<ProdutoPDV[]>([]);
  const [clientes, setClientes] = useState<ClienteFiado[]>([]);
  const [carregandoProdutos, setCarregandoProdutos] = useState(true);

  const carregarDados = async (usuarioId: string) => {
    setCarregandoProdutos(true);
    try {
      const [estoqueResp, clientesResp] = await Promise.all([
        fetch(`/api/pdv/estoque?usuarioId=${usuarioId}`, { cache: "no-store" }).then((r) => r.json()),
        fetch(`/api/fiado/clientes?donoId=${usuarioId}`, { cache: "no-store" }).then((r) => r.json()),
      ]);
      if (estoqueResp.success) {
        setProdutos(
          estoqueResp.data
            .filter((item: any) => item.ativo !== false)
            .map((item: any) => ({
              estoqueId: item.id,
              catalogoId: item.catalogo_id,
              ean: item.produto?.ean || null,
              nome: item.produto?.nome || "Produto",
              variante: item.variante || "",
              preco: Number(item.preco_venda) || 0,
              fotoUrl: item.produto?.foto_url || null,
              categoria: item.produto?.categoria || item.produto?.segmento || "Geral",
              unidade: item.produto?.unidade || null,
              estoque: Number(item.quantidade) || 0,
              estoqueMinimo: Number(item.estoque_minimo) || 0,
              validade: item.validade || null,
            }))
        );
      }
      if (clientesResp.success) setClientes(clientesResp.data);
    } finally {
      setCarregandoProdutos(false);
    }
  };

  useEffect(() => {
    const u = getCurrentUser();
    setUsuario(u);
    if (u) carregarDados(u.id);
    else setCarregandoProdutos(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!carregandoProdutos && !usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <p className="text-gray-600">Complete seu cadastro pra usar a frente de caixa.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-30 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-gray-800 flex items-center gap-2 flex-1">
          <Store className="w-5 h-5 text-blue-600" /> Vender
        </h1>
        {carregado && (
          <div className="flex bg-gray-100 rounded-full p-0.5">
            <button
              onClick={() => setLayout("mobile")}
              className={`p-1.5 rounded-full transition ${layout === "mobile" ? "bg-white shadow-sm text-blue-600" : "text-gray-400"}`}
              title="Versão celular"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayout("desktop")}
              className={`p-1.5 rounded-full transition ${layout === "desktop" ? "bg-white shadow-sm text-blue-600" : "text-gray-400"}`}
              title="Versão computador"
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>
      <PdvSubNav ativa="vender" />

      {carregado && usuario && (
        layout === "desktop" ? (
          <FrenteCaixaDesktop
            usuarioId={usuario.id}
            usuarioNome={usuario.nome}
            produtos={produtos}
            clientes={clientes}
            carregandoProdutos={carregandoProdutos}
            onVendaFinalizada={() => carregarDados(usuario.id)}
          />
        ) : (
          <FrenteCaixaMobile
            usuarioId={usuario.id}
            produtos={produtos}
            clientes={clientes}
            carregandoProdutos={carregandoProdutos}
            onVendaFinalizada={() => carregarDados(usuario.id)}
          />
        )
      )}
    </div>
  );
}
