"use client";

// Caminho: C:\valente_conecta\app\carona\motorista\cadastro\page.tsx
//
// Cadastro de motorista da Carona Solidaria — exige as 3 fotos de verdade
// (rosto, veiculo, CNH), mostradas pro caronista antes dele pagar pra
// desbloquear o contato. Usa a identidade real (getCurrentUser), nao o id
// anonimo por navegador do Moto Taxi, porque aqui ha' dinheiro de verdade
// entrando e saindo.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AlertTriangle, Car } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { MidiaUploader } from "@/components/catalogo/MidiaUploader";
import type { MidiaItem } from "@/lib/catalogo/marketplaceTypes";

export default function CadastroMotoristaCaronaPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState({ veiculo: "", placa: "", cnhNumero: "", cnhValida: false });
  const [fotoRosto, setFotoRosto] = useState<MidiaItem[]>([]);
  const [fotoVeiculo, setFotoVeiculo] = useState<MidiaItem[]>([]);
  const [fotoCnh, setFotoCnh] = useState<MidiaItem[]>([]);

  useEffect(() => {
    setUsuario(getCurrentUser());
  }, []);

  const cadastrar = async () => {
    if (!usuario) {
      toast.error("Complete seu cadastro no app primeiro.");
      return;
    }
    if (!fotoRosto[0] || !fotoVeiculo[0] || !fotoCnh[0]) {
      toast.error("Envie as 3 fotos: seu rosto, o veículo e a CNH.");
      return;
    }
    if (!form.veiculo.trim() || !form.placa.trim() || !form.cnhNumero.trim()) {
      toast.error("Preencha veículo, placa e número da CNH.");
      return;
    }
    if (!form.cnhValida) {
      toast.error("Confirme que sua CNH está válida.");
      return;
    }

    setEnviando(true);
    try {
      const resp = await fetch("/api/carona/motoristas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: usuario.id,
          nome: usuario.nome,
          telefone: usuario.whatsapp,
          fotoUrl: fotoRosto[0].url,
          veiculoFotoUrl: fotoVeiculo[0].url,
          cnhFotoUrl: fotoCnh[0].url,
          veiculo: form.veiculo,
          placa: form.placa,
          cnhNumero: form.cnhNumero,
          cnhValida: form.cnhValida,
        }),
      });
      const resultado = await resp.json();
      if (!resultado.success) throw new Error(resultado.error);

      toast.success("Cadastro de motorista concluído!");
      router.push("/carona/motorista/nova-viagem");
    } catch (error: any) {
      toast.error(error.message || "Erro no cadastro");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 sticky top-0 z-30">
        <div className="max-w-lg mx-auto flex items-center gap-2 text-white">
          <Car size={18} />
          <h1 className="font-bold text-lg">Seja motorista da Carona Solidária</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {!usuario ? (
          <p className="text-gray-500 text-sm">Complete seu cadastro no app (nome e WhatsApp) antes de continuar.</p>
        ) : (
          <div className="bg-white rounded-2xl shadow p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input value={form.veiculo} onChange={(e) => setForm((p) => ({ ...p, veiculo: e.target.value }))} placeholder="Veículo (ex: Fiat Uno prata)" className="border rounded-lg px-3 py-2" />
              <input value={form.placa} onChange={(e) => setForm((p) => ({ ...p, placa: e.target.value }))} placeholder="Placa" className="border rounded-lg px-3 py-2" />
              <input value={form.cnhNumero} onChange={(e) => setForm((p) => ({ ...p, cnhNumero: e.target.value }))} placeholder="Número da CNH" className="border rounded-lg px-3 py-2 md:col-span-2" />
            </div>

            <div>
              <p className="text-sm font-medium mb-1.5">Sua foto (rosto) *</p>
              <MidiaUploader midia={fotoRosto} onChange={setFotoRosto} maximo={1} />
            </div>
            <div>
              <p className="text-sm font-medium mb-1.5">Foto do veículo *</p>
              <MidiaUploader midia={fotoVeiculo} onChange={setFotoVeiculo} maximo={1} />
            </div>
            <div>
              <p className="text-sm font-medium mb-1.5">Foto da CNH *</p>
              <MidiaUploader midia={fotoCnh} onChange={setFotoCnh} maximo={1} />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.cnhValida} onChange={(e) => setForm((p) => ({ ...p, cnhValida: e.target.checked }))} /> CNH válida confirmada
            </label>

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-amber-800 text-xs flex items-start gap-2">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              Suas fotos ficam visíveis pros caronistas quando eles decidirem desbloquear o contato de uma viagem sua.
            </div>

            <button onClick={cadastrar} disabled={enviando} className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold disabled:opacity-60">
              {enviando ? "Enviando..." : "Cadastrar como motorista"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
