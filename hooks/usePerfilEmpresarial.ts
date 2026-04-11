'use client'

import { useState } from 'react'

export type TipoNegocio = 'empresa' | 'profissional' | null

export type DiaSemana = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom'

export interface HorarioDia {
  dia: DiaSemana
  label: string
  aberto: boolean
  abertura: string
  fechamento: string
}

export interface ItemCatalogo {
  id: string
  nome: string
  preco: number
  foto: string | null
  descricao?: string
}

export interface FormEmpresa {
  nomeFantasia: string
  cnpj: string
  celular: string
  endereco: string
  categoria: string
}

export interface FormProfissional {
  nome: string
  tipoProfissional: string
  celular: string
  valorServico: string
  descricaoServico: string
}

export const TIPOS_PROFISSIONAL = [
  'Pedreiro', 'Manicure', 'Barbeiro', 'Cabeleireiro', 'Eletricista',
  'Encanador', 'Pintor', 'Marceneiro', 'Diarista', 'Massagista',
  'Personal Trainer', 'Professor Particular', 'Nutricionista',
  'Fotógrafo', 'Mecânico', 'Costureira', 'Outros',
]

export const CATEGORIAS_EMPRESA = [
  'Mercado / Mercearia', 'Farmácia', 'Restaurante', 'Lanchonete',
  'Açougue', 'Padaria', 'Pet Shop', 'Loja de Roupas',
  'Loja de Calçados', 'Material de Construção', 'Salão de Beleza',
  'Barbearia', 'Posto de Gasolina', 'Oficina Mecânica', 'Outros',
]

const HORARIOS_INICIAIS: HorarioDia[] = [
  { dia: 'seg', label: 'Segunda', aberto: true, abertura: '08:00', fechamento: '18:00' },
  { dia: 'ter', label: 'Terça', aberto: true, abertura: '08:00', fechamento: '18:00' },
  { dia: 'qua', label: 'Quarta', aberto: true, abertura: '08:00', fechamento: '18:00' },
  { dia: 'qui', label: 'Quinta', aberto: true, abertura: '08:00', fechamento: '18:00' },
  { dia: 'sex', label: 'Sexta', aberto: true, abertura: '08:00', fechamento: '18:00' },
  { dia: 'sab', label: 'Sábado', aberto: true, abertura: '08:00', fechamento: '13:00' },
  { dia: 'dom', label: 'Domingo', aberto: false, abertura: '08:00', fechamento: '12:00' },
]

export function usePerfilEmpresarial() {
  const [tipoNegocio, setTipoNegocio] = useState<TipoNegocio>(null)
  const [perfilSalvo, setPerfilSalvo] = useState(false)
  const [aba, setAba] = useState<'perfil' | 'catalogo' | 'horarios'>('perfil')

  // Dados empresa
  const [formEmpresa, setFormEmpresa] = useState<FormEmpresa>({
    nomeFantasia: '',
    cnpj: '',
    celular: '',
    endereco: '',
    categoria: '',
  })

  // Dados profissional
  const [formProfissional, setFormProfissional] = useState<FormProfissional>({
    nome: '',
    tipoProfissional: '',
    celular: '',
    valorServico: '',
    descricaoServico: '',
  })

  // Horários (empresa)
  const [horarios, setHorarios] = useState<HorarioDia[]>(HORARIOS_INICIAIS)

  // Status excepcional
  const [statusAberto, setStatusAberto] = useState(false)
  const [mensagemExcepcional, setMensagemExcepcional] = useState('')

  // Catálogo
  const [itensCatalogo, setItensCatalogo] = useState<ItemCatalogo[]>([])
  const [showAddItem, setShowAddItem] = useState(false)
  const [showCatalogoOnline, setShowCatalogoOnline] = useState(false)
  const [novoItem, setNovoItem] = useState({ nome: '', preco: '', foto: null as string | null, descricao: '' })
  const [erroItem, setErroItem] = useState('')

  // Helpers empresa
  const updateEmpresa = (field: keyof FormEmpresa, value: string) =>
    setFormEmpresa(prev => ({ ...prev, [field]: value }))

  // Helpers profissional
  const updateProfissional = (field: keyof FormProfissional, value: string) =>
    setFormProfissional(prev => ({ ...prev, [field]: value }))

  // Helpers horários
  const updateHorario = (dia: DiaSemana, field: keyof HorarioDia, value: string | boolean) => {
    setHorarios(prev => prev.map(h => h.dia === dia ? { ...h, [field]: value } : h))
  }

  // Salvar perfil
  const salvarPerfil = () => {
    if (tipoNegocio === 'empresa') {
      if (!formEmpresa.nomeFantasia || !formEmpresa.celular) {
        alert('Preencha pelo menos nome e celular.')
        return
      }
    } else {
      if (!formProfissional.nome || !formProfissional.tipoProfissional) {
        alert('Preencha nome e tipo de serviço.')
        return
      }
    }
    setPerfilSalvo(true)
    setAba('catalogo')
  }

  // Foto do item
  const handleFotoItem = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setNovoItem(prev => ({ ...prev, foto: ev.target?.result as string }))
    reader.readAsDataURL(file)
  }

  // Adicionar item ao catálogo
  const adicionarItem = () => {
    if (!novoItem.nome || !novoItem.preco) {
      setErroItem('Nome e preço são obrigatórios.')
      return
    }
    const item: ItemCatalogo = {
      id: Date.now().toString(),
      nome: novoItem.nome,
      preco: parseFloat(novoItem.preco),
      foto: novoItem.foto,
      descricao: novoItem.descricao,
    }
    setItensCatalogo(prev => [...prev, item])
    setNovoItem({ nome: '', preco: '', foto: null, descricao: '' })
    setShowAddItem(false)
    setErroItem('')
  }

  const removerItem = (id: string) => {
    setItensCatalogo(prev => prev.filter(i => i.id !== id))
  }

  const toggleStatusAberto = () => {
    setStatusAberto(prev => !prev)
    if (!statusAberto) {
      setMensagemExcepcional('Estamos abertos agora! Venha nos visitar.')
    } else {
      setMensagemExcepcional('')
    }
  }

  const nomePrincipal = tipoNegocio === 'empresa'
    ? formEmpresa.nomeFantasia
    : formProfissional.nome

  return {
    tipoNegocio, setTipoNegocio,
    perfilSalvo,
    aba, setAba,
    formEmpresa, updateEmpresa,
    formProfissional, updateProfissional,
    horarios, updateHorario,
    statusAberto, mensagemExcepcional, toggleStatusAberto,
    itensCatalogo,
    showAddItem, setShowAddItem,
    showCatalogoOnline, setShowCatalogoOnline,
    novoItem, setNovoItem,
    erroItem,
    handleFotoItem,
    adicionarItem,
    removerItem,
    salvarPerfil,
    nomePrincipal,
  }
}
