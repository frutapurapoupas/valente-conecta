"use client";

export const dynamic = 'force-dynamic';

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, MapPin, Navigation, CheckCircle2, Building2 } from "lucide-react";
import { calcularDistanciaMetros } from "@/utils/geo";

const ALUNO_ID_STORAGE_KEY = 'academia_aluno_local_id';
const RAIO_CHECKIN_METROS = 200;

interface GymUnitResumo {
  id: string;
  nome: string;
  cidade: string;
  latitude: number | null;
  longitude: number | null;
}

interface Checkin {
  id: string;
  checkin_time: string;
}

export default function CheckinPage() {
  const router = useRouter();
  const [alunoId, setAlunoId] = useState<number | null>(null);
  const [gymUnitId, setGymUnitId] = useState<string | null>(null);
  const [empresa, setEmpresa] = useState<GymUnitResumo | null>(null);
  const [empresas, setEmpresas] = useState<GymUnitResumo[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [vinculando, setVinculando] = useState(false);
  const [fazendoCheckin, setFazendoCheckin] = useState(false);
  const [distanciaAtual, setDistanciaAtual] = useState<number | null>(null);

  const carregar = useCallback(async () => {
    const id = Number(localStorage.getItem(ALUNO_ID_STORAGE_KEY));
    if (!id) { setCarregando(false); return; }
    setAlunoId(id);
    try {
      const alunoRes = await fetch(`/api/academia?recurso=alunos&aluno_id=${id}`);
      const alunoData = await alunoRes.json();
      const aluno = alunoData?.data?.[0];
      const checkinsRes = await fetch(`/api/academia?recurso=checkins&aluno_id=${id}`);
      const checkinsData = await checkinsRes.json();
      setCheckins(Array.isArray(checkinsData?.data) ? checkinsData.data.slice(0, 5) : []);

      if (aluno?.gym_unit_id) {
        setGymUnitId(aluno.gym_unit_id);
        const empresaRes = await fetch(`/api/academia?recurso=empresas&id=${aluno.gym_unit_id}`);
        const empresaData = await empresaRes.json();
        setEmpresa(empresaData?.data?.[0] || null);
      } else {
        const listaRes = await fetch('/api/academia?recurso=empresas');
        const listaData = await listaRes.json();
        setEmpresas(Array.isArray(listaData?.data) ? listaData.data : []);
      }
    } catch {
      toast.error("Erro ao carregar dados de check-in.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const vincularAcademia = async (id: string) => {
    if (!alunoId) return;
    setVinculando(true);
    try {
      const res = await fetch("/api/academia", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recurso: "aluno", id: alunoId, patch: { gym_unit_id: id } }),
      });
      const data = await res.json();
      if (!data?.success) throw new Error(data?.error || "Erro ao vincular academia.");
      toast.success("Academia vinculada!");
      carregar();
    } catch (err: any) {
      toast.error(err.message || "Erro ao vincular academia.");
    } finally {
      setVinculando(false);
    }
  };

  const fazerCheckin = () => {
    if (!empresa?.latitude || !empresa?.longitude) {
      toast.error("Sua academia ainda não configurou a localização para check-in.");
      return;
    }
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada neste navegador.");
      return;
    }
    setFazendoCheckin(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const distancia = calcularDistanciaMetros(
          pos.coords.latitude, pos.coords.longitude,
          empresa.latitude!, empresa.longitude!
        );
        setDistanciaAtual(distancia);

        if (distancia > RAIO_CHECKIN_METROS) {
          toast.error(`Você está a ${Math.round(distancia)}m da academia. Aproxime-se para confirmar presença.`);
          setFazendoCheckin(false);
          return;
        }

        try {
          const res = await fetch("/api/academia", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recurso: "checkins", aluno_id: alunoId }),
          });
          const data = await res.json();
          if (!data?.success) throw new Error(data?.error || "Erro ao registrar check-in.");
          toast.success("Check-in confirmado!");
          carregar();
        } catch (err: any) {
          toast.error(err.message || "Erro ao registrar check-in.");
        } finally {
          setFazendoCheckin(false);
        }
      },
      () => { toast.error("Erro ao capturar sua localização."); setFazendoCheckin(false); },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white pb-20">
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
        <div className="h-16 max-w-2xl mx-auto flex items-center justify-between px-4">
          <button onClick={() => router.push("/academia/aluno")}>
            <ArrowLeft className="w-6 h-6 text-yellow-400" />
          </button>
          <div className="font-black uppercase italic text-white text-sm tracking-widest">
            <span>CHECK-IN</span>
          </div>
          <div className="w-6" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-8 space-y-6">
        {carregando ? (
          <p className="text-center text-zinc-400 py-12">Carregando...</p>
        ) : !alunoId ? (
          <p className="text-center text-zinc-400 py-12">Não foi possível identificar seu perfil. Recarregue a página inicial da Academia.</p>
        ) : !gymUnitId ? (
          <div className="space-y-4">
            <div className="text-center">
              <Building2 className="w-14 h-14 text-indigo-400 mx-auto mb-3" />
              <h1 className="text-xl font-black">Escolha sua academia</h1>
              <p className="text-zinc-400 text-sm mt-1">Vincule-se a uma academia cadastrada para usar o check-in por proximidade.</p>
            </div>
            {empresas.length === 0 ? (
              <p className="text-center text-zinc-500 text-sm py-8">Nenhuma academia cadastrada na plataforma ainda.</p>
            ) : (
              <div className="space-y-2">
                {empresas.map(e => (
                  <button key={e.id} onClick={() => vincularAcademia(e.id)} disabled={vinculando}
                    className="w-full text-left bg-white/10 rounded-xl p-4 hover:bg-white/20 transition disabled:opacity-50">
                    <p className="font-bold">{e.nome}</p>
                    <p className="text-xs text-zinc-400">{e.cidade}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full mb-4">
                <MapPin className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-xl font-black">{empresa?.nome}</h1>
              {!empresa?.latitude && (
                <p className="text-xs text-yellow-400 mt-2">Sua academia ainda não configurou a localização — peça pro dono ativar no painel dele.</p>
              )}
            </div>

            <button onClick={fazerCheckin} disabled={fazendoCheckin || !empresa?.latitude}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl font-black text-lg disabled:opacity-40 flex items-center justify-center gap-2">
              <Navigation className="w-5 h-5" /> {fazendoCheckin ? "Verificando localização..." : "Fazer check-in agora"}
            </button>
            {distanciaAtual !== null && (
              <p className="text-center text-xs text-zinc-400">Distância na última tentativa: {Math.round(distanciaAtual)}m (raio permitido: {RAIO_CHECKIN_METROS}m)</p>
            )}

            <div>
              <h2 className="text-sm font-bold text-zinc-300 mb-2">Últimos check-ins</h2>
              {checkins.length === 0 ? (
                <p className="text-sm text-zinc-500">Nenhum check-in registrado ainda.</p>
              ) : (
                <div className="space-y-2">
                  {checkins.map(c => (
                    <div key={c.id} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-sm text-white">{new Date(c.checkin_time).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
