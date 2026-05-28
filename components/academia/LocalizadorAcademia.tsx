"use client";
import { useState, useEffect } from "react";
import { Navigation, CheckCircle, AlertCircle } from "lucide-react";

export default function LocalizadorAcademia() {
  const [localizacao, setLocalizacao] = useState<{ lat: number; lng: number } | null>(null);
  const [dentroAcademia, setDentroAcademia] = useState(false);
  const [capturando, setCapturando] = useState(false);
  const [academiaData, setAcademiaData] = useState<any>(null);

  useEffect(() => {
    const academia = localStorage.getItem("academia_local_dados");
    if (academia) {
      setAcademiaData(JSON.parse(academia));
    }
  }, []);

  const capturarLocalizacao = () => {
    setCapturando(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocalizacao({ lat: latitude, lng: longitude });
          
          if (academiaData?.localizador) {
            const distancia = Math.sqrt(
              Math.pow(latitude - academiaData.localizador.lat, 2) + 
              Math.pow(longitude - academiaData.localizador.lng, 2)
            ) * 111;
            setDentroAcademia(distancia < 0.5);
          }
          setCapturando(false);
        },
        () => setCapturando(false)
      );
    } else {
      setCapturando(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <h3 className="font-bold text-white mb-3 flex items-center gap-2">
        <Navigation className="w-4 h-4 text-yellow-400" />
        Localizador da Academia
      </h3>
      <button
        onClick={capturarLocalizacao}
        disabled={capturando}
        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
      >
        <Navigation className="w-4 h-4" />
        {capturando ? "Capturando..." : "Verificar presença"}
      </button>
      {localizacao && (
        <div className="mt-3 p-3 bg-white/5 rounded-xl">
          <div className="flex items-center gap-2">
            {dentroAcademia ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">Você está na academia!</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm">Fora da área da academia</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
