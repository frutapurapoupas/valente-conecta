'use client';

import { Plus } from 'lucide-react';
import { textosIngredientes } from '@/constants/ingredientesConstants';

interface HeaderIngredientesProps {
  onNovoClick: () => void;
}

export default function HeaderIngredientes({ onNovoClick }: HeaderIngredientesProps) {
  return (
    <div className="ingredientes-header">
      <div>
        <h1 className="ingredientes-titulo">{textosIngredientes.pagina.titulo}</h1>
        <p className="ingredientes-subtitulo">{textosIngredientes.pagina.subtitulo}</p>
      </div>
      <button onClick={onNovoClick} className="btn-novo">
        <Plus className="w-4 h-4" /> {textosIngredientes.botoes.novo}
      </button>
    </div>
  );
}