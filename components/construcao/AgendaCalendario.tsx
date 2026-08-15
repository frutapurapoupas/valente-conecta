"use client";

// Caminho: C:\valente_conecta\components\construcao\AgendaCalendario.tsx
//
// Grade dos proximos 60 dias, reaproveitada nos dois lados da agenda de
// construcao civil: o profissional marca ocupado/livre (modo "editar"), o
// usuario escolhe um dia livre pra solicitar (modo "escolher").

function gerarProximos60Dias(): string[] {
  const dias: string[] = [];
  const hoje = new Date();
  for (let i = 0; i < 60; i++) {
    const d = new Date(hoje);
    d.setDate(d.getDate() + i);
    dias.push(d.toISOString().slice(0, 10));
  }
  return dias;
}

const NOMES_MES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

interface Props {
  diasOcupados: Set<string>;
  modo: "editar" | "escolher";
  onToggleDia?: (data: string) => void;
  onSelecionarDia?: (data: string) => void;
  diaSelecionado?: string | null;
}

export function AgendaCalendario({ diasOcupados, modo, onToggleDia, onSelecionarDia, diaSelecionado }: Props) {
  const dias = gerarProximos60Dias();

  const grupos: Record<string, string[]> = {};
  for (const dia of dias) {
    const [ano, mes] = dia.split("-");
    const chave = `${NOMES_MES[Number(mes) - 1]}/${ano}`;
    if (!grupos[chave]) grupos[chave] = [];
    grupos[chave].push(dia);
  }

  return (
    <div className="space-y-4">
      {Object.entries(grupos).map(([mesLabel, diasDoMes]) => (
        <div key={mesLabel}>
          <p className="text-xs font-semibold text-gray-500 mb-1.5">{mesLabel}</p>
          <div className="grid grid-cols-7 gap-1.5">
            {diasDoMes.map((dia) => {
              const ocupado = diasOcupados.has(dia);
              const numeroDia = Number(dia.split("-")[2]);
              const selecionado = diaSelecionado === dia;

              if (modo === "editar") {
                return (
                  <button
                    key={dia}
                    onClick={() => onToggleDia?.(dia)}
                    className={`aspect-square rounded-lg text-xs font-medium flex items-center justify-center transition ${
                      ocupado ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                    title={ocupado ? "Ocupado — clique pra liberar" : "Livre — clique pra marcar ocupado"}
                  >
                    {numeroDia}
                  </button>
                );
              }

              return (
                <button
                  key={dia}
                  onClick={() => !ocupado && onSelecionarDia?.(dia)}
                  disabled={ocupado}
                  className={`aspect-square rounded-lg text-xs font-medium flex items-center justify-center transition ${
                    ocupado
                      ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                      : selecionado
                        ? "bg-blue-600 text-white"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  {numeroDia}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
