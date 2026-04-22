// Categorias e Serviços para Agendamento
export interface Categoria {
  id: string
  nome: string
  icone: string
  cor: string
  subcategorias: Subcategoria[]
}

export interface Subcategoria {
  id: string
  nome: string
  servicos: ServicoItem[]
}

export interface ServicoItem {
  id: string
  nome: string
  descricao?: string
  duracaoMedia: number
  precoMedio?: number
  tags: string[]
}

// Categorias principais
export const categorias: Categoria[] = [
  {
    id: 'beleza',
    nome: 'Beleza & Estética',
    icone: '💇',
    cor: 'from-pink-500 to-rose-500',
    subcategorias: [
      {
        id: 'cabelo',
        nome: 'Cabelo',
        servicos: [
          { id: 'barbeiro', nome: 'Barbeiro', duracaoMedia: 30, tags: ['corte', 'barba', 'cabelo masculino'] },
          { id: 'cabeleireiro', nome: 'Cabeleireiro(a)', duracaoMedia: 60, tags: ['corte feminino', 'escova', 'hidratação'] },
          { id: 'colorista', nome: 'Colorista', duracaoMedia: 120, tags: ['coloração', 'mechas', 'luzes'] },
          { id: 'trancista', nome: 'Trancista', duracaoMedia: 180, tags: ['tranças', 'afro', 'box braids'] },
        ]
      },
      {
        id: 'unhas',
        nome: 'Unhas',
        servicos: [
          { id: 'manicure', nome: 'Manicure e Pedicure', duracaoMedia: 60, tags: ['unhas', 'esmaltação', 'cutículas'] },
          { id: 'nail-designer', nome: 'Nail Designer', duracaoMedia: 90, tags: ['alongamento', 'fibra', 'gel'] },
        ]
      },
      {
        id: 'estetica',
        nome: 'Estética',
        servicos: [
          { id: 'esteticista', nome: 'Esteticista', duracaoMedia: 90, tags: ['limpeza de pele', 'tratamento facial'] },
          { id: 'depilacao', nome: 'Depilação', duracaoMedia: 45, tags: ['cera', 'laser', 'depilação'] },
          { id: 'micropigmentacao', nome: 'Micropigmentação', duracaoMedia: 120, tags: ['sobrancelha', 'delineado'] },
          { id: 'harmonizacao', nome: 'Harmonização Facial', duracaoMedia: 60, tags: ['preenchimento', 'botox'] },
        ]
      },
      {
        id: 'maquiagem',
        nome: 'Maquiagem',
        servicos: [
          { id: 'maquiadora', nome: 'Maquiadora', duracaoMedia: 60, tags: ['make', 'noiva', 'social'] },
          { id: 'sobrancelhas', nome: 'Designer de Sobrancelhas', duracaoMedia: 30, tags: ['design', 'henna', 'micropigmentação'] },
          { id: 'lash-designer', nome: 'Lash Designer', duracaoMedia: 90, tags: ['cílios', 'extensão', 'volume'] },
        ]
      },
    ]
  },
  {
    id: 'saude',
    nome: 'Saúde & Bem-estar',
    icone: '🧘',
    cor: 'from-emerald-500 to-teal-500',
    subcategorias: [
      {
        id: 'saude-mental',
        nome: 'Saúde Mental',
        servicos: [
          { id: 'psicologo', nome: 'Psicólogo(a)', duracaoMedia: 50, tags: ['terapia', 'aconselhamento', 'ansiedade'] },
          { id: 'terapeuta', nome: 'Terapeuta Holístico', duracaoMedia: 60, tags: ['reiki', 'constelação', 'holístico'] },
        ]
      },
      {
        id: 'fisioterapia',
        nome: 'Fisioterapia',
        servicos: [
          { id: 'fisioterapeuta', nome: 'Fisioterapeuta', duracaoMedia: 50, tags: ['reabilitação', 'ortopedia', 'esportiva'] },
          { id: 'massoterapeuta', nome: 'Massoterapeuta', duracaoMedia: 60, tags: ['massagem', 'relaxamento', 'terapêutica'] },
          { id: 'quiropraxista', nome: 'Quiropraxista', duracaoMedia: 30, tags: ['coluna', 'ajuste', 'postura'] },
          { id: 'acupunturista', nome: 'Acupunturista', duracaoMedia: 50, tags: ['acupuntura', 'auriculoterapia'] },
        ]
      },
      {
        id: 'nutricao',
        nome: 'Nutrição',
        servicos: [
          { id: 'nutricionista', nome: 'Nutricionista', duracaoMedia: 60, tags: ['consulta', 'dieta', 'reeducação'] },
        ]
      },
      {
        id: 'atividade-fisica',
        nome: 'Atividade Física',
        servicos: [
          { id: 'personal', nome: 'Personal Trainer', duracaoMedia: 60, tags: ['treino', 'musculação', 'acompanhamento'] },
          { id: 'pilates', nome: 'Instrutor de Pilates/Yoga', duracaoMedia: 50, tags: ['pilates', 'yoga', 'flexibilidade'] },
        ]
      },
    ]
  },
  {
    id: 'automotivo',
    nome: 'Automotivo',
    icone: '🚗',
    cor: 'from-blue-500 to-cyan-500',
    subcategorias: [
      {
        id: 'manutencao',
        nome: 'Manutenção',
        servicos: [
          { id: 'mecanico', nome: 'Mecânico', duracaoMedia: 120, tags: ['revisão', 'motor', 'freios'] },
          { id: 'eletricista-auto', nome: 'Eletricista Automotivo', duracaoMedia: 90, tags: ['elétrica', 'bateria', 'alternador'] },
          { id: 'borracheiro', nome: 'Borracheiro', duracaoMedia: 30, tags: ['pneu', 'câmara', 'alinhamento'] },
          { id: 'martelinho', nome: 'Martelinho de Ouro', duracaoMedia: 60, tags: ['funilaria', 'amassado', 'repintura'] },
        ]
      },
      {
        id: 'estetica-auto',
        nome: 'Estética Automotiva',
        servicos: [
          { id: 'lavajato', nome: 'Lava Jato', duracaoMedia: 60, tags: ['lavagem', 'higienização', 'polimento'] },
          { id: 'polimento', nome: 'Polimento Automotivo', duracaoMedia: 180, tags: ['polimento', 'cristalização'] },
          { id: 'som-auto', nome: 'Instalação de Som Automotivo', duracaoMedia: 120, tags: ['som', 'multimídia'] },
        ]
      },
    ]
  },
  {
    id: 'domestico',
    nome: 'Serviços Domésticos',
    icone: '🏠',
    cor: 'from-amber-500 to-orange-500',
    subcategorias: [
      {
        id: 'limpeza',
        nome: 'Limpeza',
        servicos: [
          { id: 'diarista', nome: 'Diarista', duracaoMedia: 240, tags: ['limpeza', 'faxina', 'organização'] },
          { id: 'faxineira', nome: 'Faxineira', duracaoMedia: 180, tags: ['faxina', 'limpeza pesada'] },
          { id: 'passadeira', nome: 'Passadeira', duracaoMedia: 120, tags: ['passar roupa', 'engomar'] },
        ]
      },
      {
        id: 'alimentacao',
        nome: 'Alimentação',
        servicos: [
          { id: 'cozinheira', nome: 'Cozinheira', duracaoMedia: 180, tags: ['cozinha', 'alimentação'] },
          { id: 'marmita', nome: 'Marmita sob Encomenda', duracaoMedia: 60, tags: ['marmita', 'delivery'] },
          { id: 'bolos', nome: 'Bolos Personalizados', duracaoMedia: 120, tags: ['bolo', 'aniversário', 'confeitaria'] },
        ]
      },
      {
        id: 'cuidadores',
        nome: 'Cuidadores',
        servicos: [
          { id: 'babá', nome: 'Babá', duracaoMedia: 480, tags: ['crianças', 'babá'] },
          { id: 'cuidador', nome: 'Cuidador de Idosos', duracaoMedia: 480, tags: ['idoso', 'cuidados'] },
        ]
      },
    ]
  },
  {
    id: 'manutencao',
    nome: 'Manutenção & Reparos',
    icone: '🔧',
    cor: 'from-gray-500 to-zinc-500',
    subcategorias: [
      {
        id: 'reparos',
        nome: 'Reparos Gerais',
        servicos: [
          { id: 'eletricista', nome: 'Eletricista Residencial', duracaoMedia: 60, tags: ['elétrica', 'reparo', 'instalação'] },
          { id: 'encanador', nome: 'Encanador', duracaoMedia: 60, tags: ['encanamento', 'vazamento', 'hidráulica'] },
          { id: 'pedreiro', nome: 'Pedreiro', duracaoMedia: 480, tags: ['alvenaria', 'reforma', 'construção'] },
          { id: 'pintor', nome: 'Pintor', duracaoMedia: 240, tags: ['pintura', 'parede'] },
          { id: 'marceneiro', nome: 'Marceneiro', duracaoMedia: 180, tags: ['marcenaria', 'móveis'] },
        ]
      },
      {
        id: 'eletrodomesticos',
        nome: 'Eletrodomésticos',
        servicos: [
          { id: 'tecnico-ar', nome: 'Técnico em Ar-Condicionado', duracaoMedia: 60, tags: ['ar condicionado', 'climatização'] },
          { id: 'tecnico-geladeira', nome: 'Técnico em Geladeira', duracaoMedia: 60, tags: ['refrigeração'] },
          { id: 'tecnico-lavar', nome: 'Técnico em Máquina de Lavar', duracaoMedia: 60, tags: ['lavadora'] },
        ]
      },
    ]
  },
  {
    id: 'tecnologia',
    nome: 'Tecnologia',
    icone: '📱',
    cor: 'from-purple-500 to-indigo-500',
    subcategorias: [
      {
        id: 'reparo',
        nome: 'Reparo',
        servicos: [
          { id: 'tecnico-celular', nome: 'Técnico de Celular', duracaoMedia: 60, tags: ['celular', 'smartphone', 'reparo'] },
          { id: 'tecnico-computador', nome: 'Técnico de Computador', duracaoMedia: 90, tags: ['pc', 'notebook', 'manutenção'] },
        ]
      },
      {
        id: 'instalacao',
        nome: 'Instalação',
        servicos: [
          { id: 'internet', nome: 'Instalação de Internet/Wi-Fi', duracaoMedia: 60, tags: ['internet', 'wi-fi', 'rede'] },
          { id: 'cameras', nome: 'Instalação de Câmeras', duracaoMedia: 120, tags: ['cftv', 'segurança', 'monitoramento'] },
        ]
      },
      {
        id: 'design',
        nome: 'Design',
        servicos: [
          { id: 'designer', nome: 'Designer Gráfico', duracaoMedia: 120, tags: ['design', 'arte', 'criação'] },
          { id: 'social-media', nome: 'Social Media', duracaoMedia: 60, tags: ['redes sociais', 'marketing'] },
        ]
      },
    ]
  },
  {
    id: 'educacao',
    nome: 'Educação',
    icone: '📚',
    cor: 'from-green-500 to-emerald-500',
    subcategorias: [
      {
        id: 'aulas',
        nome: 'Aulas Particulares',
        servicos: [
          { id: 'professor-particular', nome: 'Professor Particular', duracaoMedia: 60, tags: ['aula', 'reforço', 'ensino'] },
          { id: 'reforco', nome: 'Reforço Escolar', duracaoMedia: 60, tags: ['escola', 'matemática', 'português'] },
          { id: 'musica', nome: 'Professor de Música', duracaoMedia: 50, tags: ['música', 'instrumento', 'canto'] },
        ]
      },
      {
        id: 'cursos',
        nome: 'Cursos',
        servicos: [
          { id: 'informatica', nome: 'Instrutor de Informática', duracaoMedia: 60, tags: ['computador', 'software'] },
          { id: 'direcao', nome: 'Aula de Direção', duracaoMedia: 60, tags: ['carro', 'autoescola'] },
          { id: 'enem', nome: 'Preparatório ENEM/Concursos', duracaoMedia: 120, tags: ['enem', 'concurso', 'vestibular'] },
        ]
      },
    ]
  },
  {
    id: 'eventos',
    nome: 'Eventos',
    icone: '🎉',
    cor: 'from-red-500 to-pink-500',
    subcategorias: [
      {
        id: 'profissionais',
        nome: 'Profissionais',
        servicos: [
          { id: 'dj', nome: 'DJ', duracaoMedia: 240, tags: ['música', 'festa', 'som'] },
          { id: 'fotografo', nome: 'Fotógrafo', duracaoMedia: 120, tags: ['foto', 'ensaio', 'evento'] },
          { id: 'cinegrafista', nome: 'Filmagem', duracaoMedia: 120, tags: ['vídeo', 'filme', 'produção'] },
          { id: 'decorador', nome: 'Decorador', duracaoMedia: 240, tags: ['decoração', 'enfeites'] },
        ]
      },
    ]
  },
  {
    id: 'pets',
    nome: 'Pets',
    icone: '🐾',
    cor: 'from-yellow-500 to-amber-500',
    subcategorias: [
      {
        id: 'cuidados',
        nome: 'Cuidados',
        servicos: [
          { id: 'banho-tosa', nome: 'Banho e Tosa', duracaoMedia: 60, tags: ['pet', 'cachorro', 'gato'] },
          { id: 'veterinario', nome: 'Veterinário', duracaoMedia: 30, tags: ['veterinário', 'consulta'] },
          { id: 'adestrador', nome: 'Adestrador', duracaoMedia: 60, tags: ['adestramento', 'comportamento'] },
          { id: 'pet-sitter', nome: 'Pet Sitter', duracaoMedia: 480, tags: ['cuidados', 'animal', 'passeio'] },
        ]
      },
    ]
  },
]

// Função para buscar serviços por termo (autocompletar)
export function buscarServicos(termo: string): ServicoItem[] {
  const termoLower = termo.toLowerCase()
  const resultados: ServicoItem[] = []
  
  for (const categoria of categorias) {
    for (const subcategoria of categoria.subcategorias) {
      for (const servico of subcategoria.servicos) {
        if (servico.nome.toLowerCase().includes(termoLower) ||
            servico.tags.some(tag => tag.toLowerCase().includes(termoLower))) {
          resultados.push(servico)
        }
      }
    }
  }
  
  return resultados.slice(0, 10) // Limitar a 10 resultados
}

// Função para buscar categoria por ID
export function buscarCategoriaPorId(id: string): Categoria | undefined {
  return categorias.find(c => c.id === id)
}

// Função para buscar subcategoria por ID
export function buscarSubcategoriaPorId(categoriaId: string, subcategoriaId: string): Subcategoria | undefined {
  const categoria = buscarCategoriaPorId(categoriaId)
  return categoria?.subcategorias.find(s => s.id === subcategoriaId)
}