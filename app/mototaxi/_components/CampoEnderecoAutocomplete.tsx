// Caminho sugerido: C:\valente_conecta\app\mototaxi\_components\CampoEnderecoAutocomplete.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type Sugestao = {
  id: string;
  texto: string;
  lat: number;
  lng: number;
  origem: "local" | "mapa";
};

type Props = {
  placeholder: string;
  value: string;
  cidadeId: string | null;
  onChange: (texto: string) => void;
  onSelecionar: (sugestao: { texto: string; lat: number; lng: number }) => void;
  className?: string;
};

export default function CampoEnderecoAutocomplete({
  placeholder,
  value,
  cidadeId,
  onChange,
  onSelecionar,
  className,
}: Props) {
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cidadeId || value.trim().length < 2 || value.startsWith("Minha localizacao")) {
      setSugestoes([]);
      return;
    }

    setCarregando(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/mototaxi?recurso=autocomplete&cidade_id=${cidadeId}&q=${encodeURIComponent(value)}`);
        const data = await res.json();
        setSugestoes(Array.isArray(data?.data) ? data.data : []);
        setAberto(true);
      } catch {
        setSugestoes([]);
      } finally {
        setCarregando(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [value, cidadeId]);

  // Fecha a lista ao clicar fora
  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => sugestoes.length > 0 && setAberto(true)}
        placeholder={placeholder}
        autoComplete="off"
        inputMode="text"
        className={className || "bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 w-full"}
      />

      {aberto && (sugestoes.length > 0 || carregando) && (
        <div className="absolute z-20 mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto">
          {carregando && (
            <div className="px-3 py-2 text-xs text-slate-400">Buscando...</div>
          )}
          {!carregando && sugestoes.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                onChange(s.texto);
                onSelecionar({ texto: s.texto, lat: s.lat, lng: s.lng });
                setAberto(false);
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-800 border-b border-slate-800 last:border-0 flex items-center gap-2"
            >
              {s.origem === "local" && (
                <span className="text-[10px] bg-cyan-600/30 text-cyan-300 px-1.5 py-0.5 rounded-full shrink-0">Local</span>
              )}
              <span className="text-slate-200 truncate">{s.texto}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
