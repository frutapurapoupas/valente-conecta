'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMotorcycle } from '@fortawesome/free-solid-svg-icons';
import {
  ShoppingCart, UtensilsCrossed, Dumbbell, Bike, Wrench,
  Briefcase, Handshake, Building2, Car, Stethoscope,
  GraduationCap, Scissors, Gamepad2, Compass
} from 'lucide-react';
import { homeConstants } from '@/constants/homeConstants';
import { filterCategoriasByFlags, CURRENT_ENV } from '@/config/modules';

// Mapeamento de ícones Lucide
const iconMap: Record<string, any> = {
  ShoppingCart,
  UtensilsCrossed,
  Dumbbell,
  Bike,
  Wrench,
  Briefcase,
  Handshake,
  Building2,
  Car,
  Stethoscope,
  GraduationCap,
  Scissors,
  Gamepad2,
  Compass
};

// Mapeamento de ícones FontAwesome (deve casar com o ID ou campo icon da categoria)
const fontAwesomeIcons: Record<string, any> = {
  mototaxi: faMotorcycle,
};

export default function SecaoCategorias() {
  const { titulos, categorias } = homeConstants;
  const categoriasVisiveis = filterCategoriasByFlags(categorias);

  if (categoriasVisiveis.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span className="text-blue-600">📈</span>
        {titulos.categorias}
        {CURRENT_ENV === "development" && (
          <span className="text-xs bg-yellow-200 text-yellow-700 px-2 py-0.5 rounded-full font-normal">
            {categoriasVisiveis.length}/{categorias.length} ativas
          </span>
        )}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 auto-rows-auto">
        {categoriasVisiveis.map((cat) => {
          const Icon = iconMap[cat.icon];
          const faIcon = fontAwesomeIcons[cat.id]; // Busca no novo objeto criado acima
          const isFontAwesome = !!faIcon;
          
          // Fallback para caso o ícone não seja encontrado
          const IconComponent = Icon || null; 

          return (
            <Link
              key={cat.id}
              href={cat.href}
              className="group relative flex flex-col items-center justify-center p-4 text-center bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl shadow-sm hover:-translate-y-1 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 ease-out hover:shadow-xl"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.cor} flex items-center justify-center mb-2.5 shadow-lg ring-2 ring-white/20 group-hover:ring-white/40 group-hover:shadow-xl transition-all duration-300 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300" />
                {isFontAwesome ? (
                  <FontAwesomeIcon icon={faIcon} className="w-7 h-7 text-white relative z-10" />
                ) : IconComponent ? (
                  <IconComponent className="w-7 h-7 text-white relative z-10" />
                ) : null}
              </div>

              <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors duration-200 leading-tight">
                {cat.nome}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}