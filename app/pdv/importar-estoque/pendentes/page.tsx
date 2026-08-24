"use client";

// Caminho: C:\valente_conecta\app\pdv\importar-estoque\pendentes\page.tsx
//
// Itens que a importação de planilha publicou com foto placeholder
// (metadata.foto_ficticia=true) — lojista sobe a foto real aqui, um por um,
// reaproveitando o MidiaUploader existente. A troca em si (aplicar direto
// ou mandar pra aprovação do admin master) é decidida no backend.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Camera } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { MidiaUploader } from "@/components/catalogo/MidiaUploader";
import { PdvSubNav } from "@/components/pdv/PdvSubNav";
import { SemPermissaoPdv } from "@/components/pdv/SemPermissaoPdv";
import { getOperadorAtivo, temPermissao, type OperadorAtivo } from "@/lib/pdv/operadorPdv";
import type { MidiaItem } from "@/lib/catalogo/marketplaceTypes";

interface ItemPendente {
  id: string;
  titulo: string;
  preco: number | null;
  metadata: { foto_pendente_aprovacao?: { url: string; thumb_url: string } };
}

export default function ImportacaoPendentesPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [itens, setItens] = useState<ItemPendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [operador, setOperador] = useState<OperadorAtivo | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    setUsuario(u);
    setOperador(getOperadorAtivo());
    if (u) carregar(u.id);
    else setLoading(false);
  }, []);

  const carregar = async (donoId: string) => {
    setLoading(true);
    try {
      const resposta = await fetch(`/api/pdv/importar-estoque/pendentes?donoId=${donoId}`);
      const resultado = await resposta.json();
      if (resultado.success) setItens(resultado.data);
    } catch {
      toast.error("Erro ao carregar itens pendentes");
    } finally {
      setLoading(false);
    }
  };

  const enviarFoto = async (itemId: string, midia: MidiaItem[]) => {
    const nova = midia[midia.length - 1];
    if (!nova || !usuario) return;
    try {
      const resposta = await fetch(`/api/pdv/importar-estoque/pendentes/${itemId}/foto`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donoId: usuario.id, url: nova.url, thumb_url: nova.thumb_url }),
      });
      const resultado = await resposta.json();
      if (!resultado.success) throw new Error(resultado.error);
      toast.success(resultado.aplicadoDireto ? "Foto atualizada!" : "Foto enviada para aprovação");
      setItens((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err: any) {
      toast.error(err?.message || "Erro ao enviar foto");
    }
  };

  if (!usuario && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <p className="text-gray-600">Complete seu cadastro para gerenciar seus produtos.</p>
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
          <Camera className="w-5 h-5 text-amber-600" /> Fotos pendentes
        </h1>
      </header>
      <PdvSubNav ativa="importar-estoque" operador={operador} />

      <div className="p-4 space-y-3">
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-8">Carregando...</p>
        ) : itens.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Nenhum produto aguardando foto. 🎉</p>
        ) : (
          itens.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border p-3 space-y-2">
              <div>
                <p className="font-medium text-gray-800 text-sm">{item.titulo}</p>
                {item.preco !== null && <p className="text-xs text-gray-500">R$ {item.preco.toFixed(2)}</p>}
                {item.metadata.foto_pendente_aprovacao && (
                  <p className="text-xs text-amber-600 mt-1">Foto enviada, aguardando aprovação do admin.</p>
                )}
              </div>
              {!item.metadata.foto_pendente_aprovacao && (
                <MidiaUploader midia={[]} onChange={(midia) => enviarFoto(item.id, midia)} maximo={1} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
