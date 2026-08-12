// Caminho: C:\valente_conecta\lib\gruposInteresse.ts
//
// Grupos de interesse pra segmentar push notification (aviso geral por
// categoria). Baseado nas areas que ja existem de verdade no app — os 9
// modulos do marketplace (lib/catalogo/marketplaceTypes.ts) mais moto
// taxi, academia e educacao, que sao sistemas proprios fora do marketplace.

export interface GrupoInteresse {
  id: string;
  label: string;
}

export const GRUPOS_INTERESSE: GrupoInteresse[] = [
  { id: 'construcao', label: 'Construção e mão de obra' },
  { id: 'saude', label: 'Saúde' },
  { id: 'mercados', label: 'Mercado e alimentação' },
  { id: 'moda', label: 'Moda e vestuário' },
  { id: 'servicos', label: 'Serviços e autônomos' },
  { id: 'imoveis', label: 'Imóveis e moradia' },
  { id: 'emprego', label: 'Emprego e vagas' },
  { id: 'pet', label: 'Pet shop' },
  { id: 'agua-gas', label: 'Água e gás' },
  { id: 'mototaxi', label: 'Moto táxi e transporte' },
  { id: 'academia', label: 'Fitness e academia' },
  { id: 'educacao', label: 'Educação e cursos' },
];
