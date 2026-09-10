// Caminho: C:\valente_conecta\lib\servicos\categorias.ts
//
// Categorias do modulo unico "Servicos" (ver 105_servicos_tipo_
// profissional_empresa.sql): Profissional autonomo x Empresa. Centralizado
// aqui porque e' usado tanto na busca (app/servicos/page.tsx) quanto no
// cadastro (app/servicos/cadastro/page.tsx) -- duplicar a lista nos dois
// lugares e' o tipo de coisa que descasa com o tempo.

import {
  HardHat, Hammer, Paintbrush2, Zap, Droplets, TreePine, Laptop, Scissors,
  Wrench, Scissors as Tesoura, Car, Sparkles, type LucideIcon,
} from 'lucide-react';

export type TipoServico = 'profissional' | 'empresa';

export interface CategoriaServico {
  id: string;
  label: string;
  icon: LucideIcon;
  cor: string;
  descricao: string;
}

export const CATEGORIAS_PROFISSIONAL: CategoriaServico[] = [
  { id: 'pedreiro', label: 'Pedreiro', icon: HardHat, cor: 'bg-orange-500', descricao: 'Construção, reforma, reboco, assentamento' },
  { id: 'carpinteiro', label: 'Carpinteiro', icon: Hammer, cor: 'bg-yellow-600', descricao: 'Madeira, forros, portas, estruturas' },
  { id: 'pintor', label: 'Pintor', icon: Paintbrush2, cor: 'bg-purple-500', descricao: 'Pintura interna, externa, textura, gesso' },
  { id: 'eletricista', label: 'Eletricista', icon: Zap, cor: 'bg-yellow-400', descricao: 'Instalações, manutenção elétrica, ar-condicionado' },
  { id: 'encanador', label: 'Encanador', icon: Droplets, cor: 'bg-blue-500', descricao: 'Hidráulica, vazamentos, instalações' },
  { id: 'marceneiro', label: 'Marceneiro', icon: Wrench, cor: 'bg-amber-700', descricao: 'Móveis sob medida, reparos em madeira' },
  { id: 'jardineiro', label: 'Jardineiro', icon: TreePine, cor: 'bg-green-600', descricao: 'Jardins, poda, paisagismo, limpeza de terreno' },
  { id: 'informatica', label: 'Informática', icon: Laptop, cor: 'bg-cyan-500', descricao: 'Manutenção de computadores, redes, suporte' },
  { id: 'diarista', label: 'Diarista', icon: Sparkles, cor: 'bg-pink-500', descricao: 'Limpeza residencial e comercial' },
  { id: 'outros', label: 'Outros', icon: Wrench, cor: 'bg-gray-500', descricao: 'Outras especialidades e serviços gerais' },
];

export const CATEGORIAS_EMPRESA: CategoriaServico[] = [
  { id: 'cabeleireiro', label: 'Cabeleireiro', icon: Scissors, cor: 'bg-fuchsia-500', descricao: 'Corte, coloração, tratamentos' },
  { id: 'barbeiro', label: 'Barbeiro', icon: Tesoura, cor: 'bg-indigo-500', descricao: 'Corte masculino, barba, acabamento' },
  { id: 'borracheiro', label: 'Borracheiro', icon: Car, cor: 'bg-slate-600', descricao: 'Conserto de pneu, calibragem' },
  { id: 'oficina', label: 'Oficina mecânica', icon: Wrench, cor: 'bg-red-600', descricao: 'Manutenção e reparo de veículos' },
  { id: 'conserto_eletro', label: 'Conserto de eletrodomésticos', icon: Zap, cor: 'bg-amber-500', descricao: 'Geladeira, fogão, máquina de lavar' },
  { id: 'conserto_celular', label: 'Conserto de celular', icon: Laptop, cor: 'bg-cyan-600', descricao: 'Tela, bateria, manutenção geral' },
  { id: 'outros_empresa', label: 'Outros', icon: Wrench, cor: 'bg-gray-500', descricao: 'Outros tipos de negócio e serviço' },
];

export function categoriasPorTipo(tipo: TipoServico): CategoriaServico[] {
  return tipo === 'empresa' ? CATEGORIAS_EMPRESA : CATEGORIAS_PROFISSIONAL;
}

export function getCategoria(tipo: TipoServico, id: string): CategoriaServico {
  const lista = categoriasPorTipo(tipo);
  return lista.find((c) => c.id === id) ?? lista[lista.length - 1];
}
