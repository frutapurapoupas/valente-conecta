"use client";

// Caminho: C:\valente_conecta\components\QuizPerfilPopup.tsx
//
// Quiz adaptativo de perfil, mostrado uma vez pro usuario logo apos o
// cadastro (ver app/api/quiz-perfil/route.ts e migration
// 046_quiz_perfil.sql). Cada resposta decide a proxima pergunta — os dois
// segmentos detalhados pelo dono do projeto (prestador de servico de
// construcao civil, dono de mercearia) tem um funil mais fundo; os demais
// tem um funil mais curto e generico pra nao inventar pergunta especifica
// de segmento sem confirmacao.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Wrench, Store, Sparkles, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

type StepId =
  | "inicio"
  | "servico_area"
  | "construcao_regime"
  | "construcao_valor"
  | "construcao_fotos"
  | "servico_atendimento"
  | "produto_tipo"
  | "mercearia_tamanho"
  | "mercearia_fiado"
  | "produto_catalogo"
  | "geral_interesses"
  | "fim";

const CHAVE_DISPENSADO = "valente_conecta_quiz_perfil_dispensado";

export function QuizPerfilPopup() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [visivel, setVisivel] = useState(false);
  const [step, setStep] = useState<StepId>("inicio");
  const [segmentoPrincipal, setSegmentoPrincipal] = useState<"servico" | "produto" | "geral" | null>(null);
  const [subsegmento, setSubsegmento] = useState<string | null>(null);
  const [respostas, setRespostas] = useState<Record<string, any>>({});
  const [interessesGeral, setInteressesGeral] = useState<string[]>([]);
  const [valorDiaria, setValorDiaria] = useState("");
  const [ctaHref, setCtaHref] = useState<string | null>(null);
  const [ctaLabel, setCtaLabel] = useState<string | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) return;
    if (localStorage.getItem(`${CHAVE_DISPENSADO}_${u.id}`)) return;

    Promise.all([
      fetch("/api/admin-master/config-quiz-perfil", { cache: "no-store" }).then((r) => r.json()),
      fetch(`/api/quiz-perfil?usuarioId=${u.id}`, { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([config, resposta]) => {
        if (config.success && config.data?.ativo && resposta.success && !resposta.data) {
          setUsuario(u);
          setVisivel(true);
        }
      })
      .catch(() => {});
  }, []);

  const dispensar = () => {
    if (usuario) localStorage.setItem(`${CHAVE_DISPENSADO}_${usuario.id}`, "1");
    setVisivel(false);
  };

  const concluir = async (dadosFinais: Record<string, any>, cta?: { href: string; label: string }) => {
    setRespostas(dadosFinais);
    setCtaHref(cta?.href || null);
    setCtaLabel(cta?.label || null);
    setStep("fim");
    if (!usuario || !segmentoPrincipal) return;
    try {
      await fetch("/api/quiz-perfil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: usuario.id, segmentoPrincipal, subsegmento, respostas: dadosFinais }),
      });
    } catch {
      // best-effort — o usuario ja viu a conclusao do quiz de qualquer forma
    }
  };

  if (!visivel) return null;

  const irPara = (href: string) => {
    if (usuario) localStorage.setItem(`${CHAVE_DISPENSADO}_${usuario.id}`, "1");
    setVisivel(false);
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <button onClick={dispensar} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Fechar">
          <X className="w-5 h-5" />
        </button>

        {step === "inicio" && (
          <Pergunta
            titulo="Antes de começar, me conta rapidinho sobre você 👋"
            subtitulo="Isso ajuda a gente a mostrar o que é mais útil pra você."
            opcoes={[
              { label: "Presto serviços", icone: <Wrench className="w-4 h-4" />, onClick: () => { setSegmentoPrincipal("servico"); setStep("servico_area"); } },
              { label: "Tenho uma loja ou vendo produtos", icone: <Store className="w-4 h-4" />, onClick: () => { setSegmentoPrincipal("produto"); setStep("produto_tipo"); } },
              { label: "Só quero aproveitar o app", icone: <Sparkles className="w-4 h-4" />, onClick: () => { setSegmentoPrincipal("geral"); setStep("geral_interesses"); } },
            ]}
          />
        )}

        {step === "servico_area" && (
          <Pergunta
            titulo="Qual sua área de atuação?"
            opcoes={[
              { label: "Construção civil (pedreiro, pintor, eletricista...)", onClick: () => { setSubsegmento("construcao_civil"); setStep("construcao_regime"); } },
              { label: "Beleza e estética", onClick: () => { setSubsegmento("beleza"); setStep("servico_atendimento"); } },
              { label: "Outros serviços", onClick: () => { setSubsegmento("outros_servicos"); setStep("servico_atendimento"); } },
            ]}
          />
        )}

        {step === "construcao_regime" && (
          <Pergunta
            titulo="Você trabalha por diária, empreitada, ou os dois?"
            opcoes={[
              { label: "Diária", onClick: () => { setRespostas((r) => ({ ...r, regime: "diaria" })); setStep("construcao_valor"); } },
              { label: "Empreitada", onClick: () => { setRespostas((r) => ({ ...r, regime: "empreitada" })); setStep("construcao_valor"); } },
              { label: "Os dois", onClick: () => { setRespostas((r) => ({ ...r, regime: "ambos" })); setStep("construcao_valor"); } },
            ]}
          />
        )}

        {step === "construcao_valor" && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">Qual o valor médio da sua diária?</h2>
            <p className="text-sm text-gray-500 mb-4">Pode pular se preferir não informar agora.</p>
            <input
              type="number"
              min="0"
              step="0.01"
              value={valorDiaria}
              onChange={(e) => setValorDiaria(e.target.value)}
              placeholder="R$"
              className="w-full px-3 py-2.5 border rounded-lg mb-3"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={() => setStep("construcao_fotos")} className="flex-1 py-2.5 rounded-lg border text-gray-600 font-medium">Pular</button>
              <button
                onClick={() => { setRespostas((r) => ({ ...r, valorDiaria: valorDiaria ? Number(valorDiaria) : null })); setStep("construcao_fotos"); }}
                className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-medium flex items-center justify-center gap-1"
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === "construcao_fotos" && (
          <Pergunta
            titulo="Você tem fotos dos seus últimos serviços?"
            subtitulo="Elas ajudam muito a conseguir novos clientes no app."
            opcoes={[
              {
                label: "Sim, vou adicionar",
                onClick: () => concluir({ ...respostas, temFotos: true }, { href: "/construcao/admin", label: "Publicar meu perfil agora" }),
              },
              {
                label: "Ainda não tenho",
                onClick: () => concluir({ ...respostas, temFotos: false }),
              },
            ]}
          />
        )}

        {step === "servico_atendimento" && (
          <Pergunta
            titulo="Você atende em domicílio, tem um local fixo, ou os dois?"
            opcoes={[
              { label: "Domicílio", onClick: () => concluir({ ...respostas, atendimento: "domicilio" }, { href: "/servicos/admin", label: "Publicar meu perfil agora" }) },
              { label: "Local fixo", onClick: () => concluir({ ...respostas, atendimento: "local_fixo" }, { href: "/servicos/admin", label: "Publicar meu perfil agora" }) },
              { label: "Os dois", onClick: () => concluir({ ...respostas, atendimento: "ambos" }, { href: "/servicos/admin", label: "Publicar meu perfil agora" }) },
            ]}
          />
        )}

        {step === "produto_tipo" && (
          <Pergunta
            titulo="Que tipo de loja você tem?"
            opcoes={[
              { label: "Mercearia ou mercado", onClick: () => { setSubsegmento("mercearia"); setStep("mercearia_tamanho"); } },
              { label: "Farmácia", onClick: () => { setSubsegmento("farmacia"); setStep("produto_catalogo"); } },
              { label: "Açougue", onClick: () => { setSubsegmento("acougue"); setStep("produto_catalogo"); } },
              { label: "Moda / roupas", onClick: () => { setSubsegmento("moda"); setStep("produto_catalogo"); } },
              { label: "Outro", onClick: () => { setSubsegmento("outro"); setStep("produto_catalogo"); } },
            ]}
          />
        )}

        {step === "mercearia_tamanho" && (
          <Pergunta
            titulo="Qual o tamanho do seu negócio?"
            opcoes={[
              { label: "Pequeno (até 5 funcionários)", onClick: () => { setRespostas((r) => ({ ...r, tamanho: "pequeno" })); setStep("mercearia_fiado"); } },
              { label: "Médio", onClick: () => { setRespostas((r) => ({ ...r, tamanho: "medio" })); setStep("mercearia_fiado"); } },
              { label: "Grande", onClick: () => { setRespostas((r) => ({ ...r, tamanho: "grande" })); setStep("mercearia_fiado"); } },
            ]}
          />
        )}

        {step === "mercearia_fiado" && (
          <Pergunta
            titulo="Tem interesse que o app controle o fiado pra você?"
            subtitulo="Limite de crédito, recibo e cobrança automática, sem dor de cabeça."
            opcoes={[
              { label: "Sim, quero isso", onClick: () => concluir({ ...respostas, interesseFiado: true }, { href: "/pdv/fiado", label: "Conhecer o Fiado agora" }) },
              { label: "Não, obrigado", onClick: () => concluir({ ...respostas, interesseFiado: false }) },
            ]}
          />
        )}

        {step === "produto_catalogo" && (
          <Pergunta
            titulo="Quer cadastrar seus produtos no catálogo agora?"
            opcoes={[
              { label: "Sim, vamos lá", onClick: () => concluir({ ...respostas, cadastrarAgora: true }, { href: "/pdv/estoque", label: "Cadastrar produtos agora" }) },
              { label: "Depois", onClick: () => concluir({ ...respostas, cadastrarAgora: false }) },
            ]}
          />
        )}

        {step === "geral_interesses" && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">O que mais te interessa no app?</h2>
            <p className="text-sm text-gray-500 mb-4">Pode marcar mais de um.</p>
            <div className="space-y-2 mb-4">
              {[
                { id: "moeda_conecta", label: "Economizar com a Moeda Conecta" },
                { id: "servicos_produtos", label: "Encontrar serviços e produtos perto de mim" },
                { id: "carona", label: "Carona entre cidades" },
                { id: "mototaxi", label: "Moto táxi" },
                { id: "outro", label: "Outro" },
              ].map((op) => (
                <label key={op.id} className="flex items-center gap-2 px-3 py-2.5 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={interessesGeral.includes(op.id)}
                    onChange={(e) =>
                      setInteressesGeral((prev) => (e.target.checked ? [...prev, op.id] : prev.filter((x) => x !== op.id)))
                    }
                  />
                  <span className="text-sm text-gray-700">{op.label}</span>
                </label>
              ))}
            </div>
            <button
              onClick={() => concluir({ interesses: interessesGeral })}
              className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium"
            >
              Concluir
            </button>
          </div>
        )}

        {step === "fim" && (
          <div className="text-center py-2">
            <Sparkles className="w-10 h-10 text-blue-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-800 mb-1">Prontinho!</h2>
            <p className="text-sm text-gray-500 mb-5">Valeu por compartilhar — vamos usar isso pra te mostrar coisas relevantes.</p>
            <div className="space-y-2">
              {ctaHref && ctaLabel && (
                <button onClick={() => irPara(ctaHref)} className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium">
                  {ctaLabel}
                </button>
              )}
              <button onClick={dispensar} className="w-full py-2.5 rounded-lg border text-gray-600 font-medium">
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Pergunta({
  titulo,
  subtitulo,
  opcoes,
}: {
  titulo: string;
  subtitulo?: string;
  opcoes: { label: string; icone?: React.ReactNode; onClick: () => void }[];
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-1">{titulo}</h2>
      {subtitulo && <p className="text-sm text-gray-500 mb-4">{subtitulo}</p>}
      <div className={`space-y-2 ${!subtitulo ? "mt-4" : ""}`}>
        {opcoes.map((op) => (
          <button
            key={op.label}
            onClick={op.onClick}
            className="w-full text-left px-4 py-3 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition flex items-center gap-2 text-gray-700 font-medium"
          >
            {op.icone} {op.label}
          </button>
        ))}
      </div>
    </div>
  );
}
