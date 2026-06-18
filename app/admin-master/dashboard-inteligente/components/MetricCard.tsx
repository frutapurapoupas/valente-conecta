"use client";

interface MetricCardProps {
  titulo: string;
  valor: string | number;
  icone: React.ReactNode;
  cor: "blue" | "green" | "purple" | "orange" | "red";
  tendencia?: number | string;
  labelTendencia?: string;
}

const cores = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  purple: "bg-purple-100 text-purple-600",
  orange: "bg-orange-100 text-orange-600",
  red: "bg-red-100 text-red-600"
};

export default function MetricCard({ titulo, valor, icone, cor, tendencia, labelTendencia }: MetricCardProps) {
  const isTendenciaPositiva = typeof tendencia === "number" ? tendencia >= 0 : true;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">{titulo}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{valor}</p>
          {tendencia !== undefined && (
            <p className={`text-xs mt-2 ${isTendenciaPositiva ? "text-green-600" : "text-red-600"}`}>
              {isTendenciaPositiva ? "↑" : "↓"} {tendencia} {labelTendencia && `• ${labelTendencia}`}
            </p>
          )}
        </div>
        <div className={`${cores[cor]} p-3 rounded-full`}>
          {icone}
        </div>
      </div>
    </div>
  );
}