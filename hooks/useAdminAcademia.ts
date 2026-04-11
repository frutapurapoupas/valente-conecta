'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// ─── Tipos ────────────────────────────────────────────────────────────────────
export type PlanoAcademia = 'gratuito' | 'basico'

export type AlunoAcademia = {
  id: number
  nome: string
  foto: string
  plano: PlanoAcademia
  academia: string
  whatsapp: string
  diasSemUso: number          // 0 = usou hoje
  totalCheckins: number
  ultimoCheckin: string       // data ISO
  ativo: boolean
}

export type AcademiaUnit = {
  id: number
  nome: string
  responsavel: string
  cidade: string
  contato: string
  endereco: string
  localizador: string
  alunos: number
  ativa: boolean
}

export type FuncionalidadePlano = {
  id: string
  label: string
  planos: { gratuito: boolean; basico: boolean }
}

export type CarrosselSlot = {
  slot: number
  url: string   // URL ou base64 preview
  titulo: string
  destino: string
}

export type CampanhaAcademia = {
  id: number
  titulo: string
  mensagem: string
  enviadoEm: string
  destinatarios: number
  tipo: 'incentivo' | 'campanha'
}

export type PlanoPreco = {
  plano: PlanoAcademia
  label: string
  preco: string
  descricao: string
}

// ─── Dados mock (fase 1 — integração Supabase na fase 2) ──────────────────────
const MOCK_ACADEMIAS: AcademiaUnit[] = [
  {
    id: 1, nome: 'Academia Valente Fit', responsavel: 'Carlos Andrade', cidade: 'Valente-BA',
    contato: '(75) 99999-1111', endereco: 'Rua das Flores, 120 – Centro, Valente-BA',
    localizador: 'https://maps.google.com/?q=Academia+Valente+Fit', alunos: 156, ativa: true,
  },
  {
    id: 2, nome: 'Studio Move', responsavel: 'Daniela Souza', cidade: 'Valente-BA',
    contato: '(75) 98888-2222', endereco: 'Av. João Pessoa, 45 – Novo Horizonte, Valente-BA',
    localizador: 'https://maps.google.com/?q=Studio+Move+Valente', alunos: 78, ativa: true,
  },
  {
    id: 3, nome: 'CrossFit Sertão', responsavel: 'Roberto Lima', cidade: 'Valente-BA',
    contato: '(75) 97777-3333', endereco: 'Rua do Comércio, 88 – Industrial, Valente-BA',
    localizador: 'https://maps.google.com/?q=CrossFit+Sertao+Valente', alunos: 34, ativa: false,
  },
]

const MOCK_ALUNOS: AlunoAcademia[] = [
  { id: 1,  nome: 'João Silva',     foto: '', plano: 'basico',   academia: 'Academia Valente Fit', whatsapp: '75999991001', diasSemUso: 0,  totalCheckins: 45, ultimoCheckin: '2026-04-10', ativo: true  },
  { id: 2,  nome: 'Maria Oliveira', foto: '', plano: 'basico',   academia: 'Academia Valente Fit', whatsapp: '75999991002', diasSemUso: 2,  totalCheckins: 38, ultimoCheckin: '2026-04-08', ativo: true  },
  { id: 3,  nome: 'Pedro Costa',    foto: '', plano: 'gratuito', academia: 'Studio Move',          whatsapp: '75999991003', diasSemUso: 0,  totalCheckins: 12, ultimoCheckin: '2026-04-10', ativo: true  },
  { id: 4,  nome: 'Ana Paula',      foto: '', plano: 'gratuito', academia: 'Academia Valente Fit', whatsapp: '75999991004', diasSemUso: 14, totalCheckins: 5,  ultimoCheckin: '2026-03-27', ativo: true  },
  { id: 5,  nome: 'Carlos Eduardo', foto: '', plano: 'basico',   academia: 'Studio Move',          whatsapp: '75999991005', diasSemUso: 21, totalCheckins: 3,  ultimoCheckin: '2026-03-20', ativo: true  },
  { id: 6,  nome: 'Fernanda Lima',  foto: '', plano: 'gratuito', academia: 'CrossFit Sertão',      whatsapp: '75999991006', diasSemUso: 0,  totalCheckins: 60, ultimoCheckin: '2026-04-10', ativo: true  },
  { id: 7,  nome: 'Lucas Mendes',   foto: '', plano: 'gratuito', academia: 'Academia Valente Fit', whatsapp: '75999991007', diasSemUso: 30, totalCheckins: 2,  ultimoCheckin: '2026-03-11', ativo: true  },
  { id: 8,  nome: 'Beatriz Santos', foto: '', plano: 'basico',   academia: 'Studio Move',          whatsapp: '75999991008', diasSemUso: 1,  totalCheckins: 29, ultimoCheckin: '2026-04-09', ativo: true  },
  { id: 9,  nome: 'Rafael Pereira', foto: '', plano: 'gratuito', academia: 'Academia Valente Fit', whatsapp: '75999991009', diasSemUso: 7,  totalCheckins: 8,  ultimoCheckin: '2026-04-03', ativo: false },
  { id: 10, nome: 'Juliana Ramos',  foto: '', plano: 'basico',   academia: 'CrossFit Sertão',      whatsapp: '75999991010', diasSemUso: 3,  totalCheckins: 22, ultimoCheckin: '2026-04-07', ativo: true  },
]

const FUNCIONALIDADES_INICIAIS: FuncionalidadePlano[] = [
  { id: 'treinos_guiados',    label: 'Treinos Guiados',          planos: { gratuito: true,  basico: true  } },
  { id: 'chat_personal',      label: 'Chat com Personal',        planos: { gratuito: false, basico: true  } },
  { id: 'relatorio_progresso',label: 'Relatório de Progresso',   planos: { gratuito: false, basico: true  } },
  { id: 'aulas_ao_vivo',      label: 'Aulas ao Vivo',            planos: { gratuito: false, basico: true  } },
  { id: 'plano_nutricional',  label: 'Plano Nutricional',        planos: { gratuito: false, basico: true  } },
  { id: 'avaliacao_fisica',   label: 'Avaliação Física',         planos: { gratuito: false, basico: true  } },
  { id: 'desconto_parceiros', label: 'Desconto em Parceiros',    planos: { gratuito: false, basico: true  } },
  { id: 'carrossel_ads',      label: 'Ver anúncios no app',      planos: { gratuito: true,  basico: false } },
]

const FRASES_INCENTIVO_INICIAIS = [
  'Saudades de você! Que tal retomar os treinos hoje?',
  'Seu progresso te espera! Volte para a academia.',
  'Um treino é tudo que você precisa pra virar o dia.',
  'Faz quanto tempo? A turma sentiu sua falta 💪',
  'Tá esperando o quê? Hoje é dia de treinar!',
  'Pequenos passos todos os dias fazem a diferença.',
]

const PLANOS_PRECOS_INICIAIS: PlanoPreco[] = [
  { plano: 'gratuito', label: 'Plano Grátis', preco: '0,00',  descricao: 'Acesso básico com anúncios' },
  { plano: 'basico',   label: 'Plano Básico', preco: '29,90', descricao: 'Acesso completo sem anúncios' },
]

const CARROSSEL_INICIAL: CarrosselSlot[] = [
  { slot: 1, url: '', titulo: 'Oferta Especial — 3x na semana', destino: '/' },
  { slot: 2, url: '', titulo: 'Parceiro: Nutrição Sertão',       destino: '/' },
  { slot: 3, url: '', titulo: 'Upgrade para Plano Básico',       destino: '/academia' },
]

const CAMPANHAS_INICIAIS: CampanhaAcademia[] = [
  { id: 1, titulo: 'Incentivo Automático', mensagem: FRASES_INCENTIVO_INICIAIS[0], enviadoEm: '2026-04-10 09:15', destinatarios: 3, tipo: 'incentivo' },
  { id: 2, titulo: 'Campanha Semana Santa',mensagem: 'Treine mais, sinta mais! Semana Santa especial.', enviadoEm: '2026-04-08 14:00', destinatarios: 45, tipo: 'campanha' },
]

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAdminAcademia() {
  const [aba, setAba]  = useState<'academias' | 'alunos' | 'planos' | 'campanhas'>('academias')
  const [filtro, setFiltro] = useState('')
  const [filtroPlano, setFiltroPlano] = useState<'todos' | 'gratuito' | 'basico'>('todos')
  const [academias, setAcademias] = useState<AcademiaUnit[]>(MOCK_ACADEMIAS)
  const [alunos, setAlunos] = useState<AlunoAcademia[]>(MOCK_ALUNOS)
  const [funcionalidades, setFuncionalidades] = useState<FuncionalidadePlano[]>(FUNCIONALIDADES_INICIAIS)
  const [planosPrecos, setPlanosPrecos] = useState<PlanoPreco[]>(PLANOS_PRECOS_INICIAIS)
  const [carrossel, setCarrossel] = useState<CarrosselSlot[]>(CARROSSEL_INICIAL)
  const [campanhas, setCampanhas] = useState<CampanhaAcademia[]>(CAMPANHAS_INICIAIS)
  const [novaCampanhaTitulo, setNovaCampanhaTitulo] = useState('')
  const [novaCampanhaMensagem, setNovaCampanhaMensagem] = useState('')
  const [enviandoPush, setEnviandoPush] = useState(false)
  const [frasesIncentivo, setFrasesIncentivo] = useState<string[]>(FRASES_INCENTIVO_INICIAIS)
  const [novaFrase, setNovaFrase] = useState('')

  // ── Carrega dados do Supabase ──────────────────────────────────────────────
  const loadData = useCallback(async () => {
    const [unitsRes, membersRes, funcsRes, carrosselRes, campanhasRes] = await Promise.all([
      supabase.from('gym_units').select('*').order('nome'),
      supabase.from('gym_members').select('*').order('nome'),
      supabase.from('gym_funcionalidades').select('*').order('label'),
      supabase.from('gym_carrossel').select('*').order('slot'),
      supabase.from('gym_campanhas').select('*').order('created_at', { ascending: false }).limit(50),
    ])

    if (unitsRes.data && unitsRes.data.length > 0) {
      setAcademias(unitsRes.data.map(r => ({
        id: r.id, nome: r.nome, responsavel: r.responsavel,
        cidade: r.cidade, contato: r.contato, endereco: r.endereco,
        localizador: r.localizador, alunos: r.alunos, ativa: r.ativa,
      })))
    }

    if (membersRes.data && membersRes.data.length > 0) {
      const today = new Date()
      setAlunos(membersRes.data.map(r => {
        const last = r.ultimo_checkin ? new Date(r.ultimo_checkin) : null
        const diasSemUso = last
          ? Math.floor((today.getTime() - last.getTime()) / 86_400_000)
          : 999
        return {
          id: r.id, nome: r.nome, foto: r.foto ?? '', plano: r.plano as PlanoAcademia,
          academia: r.academia, whatsapp: r.whatsapp ?? '', diasSemUso,
          totalCheckins: r.total_checkins ?? 0, ultimoCheckin: r.ultimo_checkin ?? '',
          ativo: r.ativo,
        }
      }))
    }

    if (funcsRes.data && funcsRes.data.length > 0) {
      setFuncionalidades(funcsRes.data.map(r => ({
        id: r.id, label: r.label,
        planos: { gratuito: r.plano_gratuito, basico: r.plano_basico },
      })))
    }

    if (carrosselRes.data && carrosselRes.data.length > 0) {
      setCarrossel(carrosselRes.data.map(r => ({
        slot: r.slot, url: r.url ?? '', titulo: r.titulo ?? '', destino: r.destino ?? '/',
      })))
    }

    if (campanhasRes.data && campanhasRes.data.length > 0) {
      setCampanhas(campanhasRes.data.map(r => ({
        id: r.id, titulo: r.titulo, mensagem: r.mensagem,
        enviadoEm: r.enviado_em, destinatarios: r.destinatarios, tipo: r.tipo as CampanhaAcademia['tipo'],
      })))
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // Stats calculados
  const totalAlunos    = alunos.length
  const alunosRegulares = alunos.filter(a => a.diasSemUso <= 7).length
  const alunosPoucoUso  = alunos.filter(a => a.diasSemUso > 7)
  const alunosGratuitos = alunos.filter(a => a.plano === 'gratuito').length
  const alunosBasico    = alunos.filter(a => a.plano === 'basico').length

  const alunosFiltrados = alunos.filter(a => {
    const textoOk = a.nome.toLowerCase().includes(filtro.toLowerCase()) ||
                    a.academia.toLowerCase().includes(filtro.toLowerCase())
    const planoOk = filtroPlano === 'todos' ||
                    (filtroPlano === 'gratuito' && a.plano === 'gratuito') ||
                    (filtroPlano === 'basico' && a.plano === 'basico')
    return textoOk && planoOk
  })

  // Toggle funcionalidade de plano
  function toggleFuncionalidade(id: string, plano: 'gratuito' | 'basico') {
    setFuncionalidades(prev => prev.map(f =>
      f.id === id
        ? { ...f, planos: { ...f.planos, [plano]: !f.planos[plano] } }
        : f
    ))
  }

  // Toggle academia ativa/inativa
  function toggleAcademia(id: number) {
    const ativa = !academias.find(a => a.id === id)?.ativa
    setAcademias(prev => prev.map(a => a.id === id ? { ...a, ativa } : a))
    supabase.from('gym_units').update({ ativa }).eq('id', id)
  }

  function atualizarPlanoPreco(plano: PlanoAcademia, campo: keyof PlanoPreco, valor: string) {
    setPlanosPrecos(prev => prev.map(p =>
      p.plano === plano ? { ...p, [campo]: valor } : p
    ))
  }

  // Enviar incentivo aleatório para alunos com pouco uso
  async function enviarIncentivoAleatorio() {
    if (alunosPoucoUso.length === 0) return
    setEnviandoPush(true)
    await new Promise(r => setTimeout(r, 800))
    const frase = frasesIncentivo[Math.floor(Math.random() * frasesIncentivo.length)]
    const nova: CampanhaAcademia = {
      id: Date.now(),
      titulo: 'Incentivo Automático',
      mensagem: frase,
      enviadoEm: new Date().toLocaleString('pt-BR'),
      destinatarios: alunosPoucoUso.length,
      tipo: 'incentivo',
    }
    setCampanhas(prev => [nova, ...prev])
    await supabase.from('gym_campanhas').insert({
      titulo: nova.titulo, mensagem: nova.mensagem,
      destinatarios: nova.destinatarios, tipo: nova.tipo,
      enviado_em: nova.enviadoEm,
    })
    setEnviandoPush(false)
  }

  // Enviar campanha manual
  function enviarCampanha() {
    if (!novaCampanhaTitulo.trim() || !novaCampanhaMensagem.trim()) return
    const nova: CampanhaAcademia = {
      id: Date.now(),
      titulo: novaCampanhaTitulo,
      mensagem: novaCampanhaMensagem,
      enviadoEm: new Date().toLocaleString('pt-BR'),
      destinatarios: totalAlunos,
      tipo: 'campanha',
    }
    setCampanhas(prev => [nova, ...prev])
    supabase.from('gym_campanhas').insert({
      titulo: nova.titulo, mensagem: nova.mensagem,
      destinatarios: nova.destinatarios, tipo: nova.tipo,
      enviado_em: nova.enviadoEm,
    })
    setNovaCampanhaTitulo('')
    setNovaCampanhaMensagem('')
  }

  // Atualizar slot do carrossel
  function atualizarCarrossel(slot: number, campo: keyof CarrosselSlot, valor: string) {
    setCarrossel(prev => prev.map(s => {
      if (s.slot !== slot) return s
      const updated = { ...s, [campo]: valor }
      supabase.from('gym_carrossel').update({ [campo]: valor }).eq('slot', slot)
      return updated
    }))
  }

  function adicionarFrase() {
    if (!novaFrase.trim()) return
    setFrasesIncentivo(prev => [...prev, novaFrase.trim()])
    setNovaFrase('')
  }

  function editarFrase(index: number, texto: string) {
    setFrasesIncentivo(prev => prev.map((f, i) => i === index ? texto : f))
  }

  function removerFrase(index: number) {
    setFrasesIncentivo(prev => prev.filter((_, i) => i !== index))
  }

  return {
    aba, setAba,
    filtro, setFiltro,
    filtroPlano, setFiltroPlano,
    academias, toggleAcademia,
    alunos: alunosFiltrados,
    alunosPoucoUso,
    stats: { totalAlunos, alunosRegulares, alunosPoucoUso: alunosPoucoUso.length, alunosGratuitos, alunosBasico },
    funcionalidades, toggleFuncionalidade,
    planosPrecos, atualizarPlanoPreco,
    carrossel, atualizarCarrossel,
    campanhas,
    novaCampanhaTitulo, setNovaCampanhaTitulo,
    novaCampanhaMensagem, setNovaCampanhaMensagem,
    enviarIncentivoAleatorio, enviarCampanha, enviandoPush,
    frasesIncentivo, novaFrase, setNovaFrase,
    adicionarFrase, editarFrase, removerFrase,
    // legacy compat
    listaFiltrada: alunos,
  }
}
