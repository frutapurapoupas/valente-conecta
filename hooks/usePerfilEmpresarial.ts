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
  endereco?: string
  planoPago?: boolean
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
  endereco: string // cidade/base obrigatória
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
    // Função para atualizar campos do formulário de empresa
    function updateEmpresa(campo: keyof FormEmpresa, valor: string) {
      setFormEmpresa(prev => ({ ...prev, [campo]: valor }))
    }

    // Função para atualizar campos do formulário de profissional
    function updateProfissional(campo: keyof FormProfissional, valor: string) {
      setFormProfissional(prev => ({ ...prev, [campo]: valor }))
    }
  // Estados principais primeiro
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
    endereco: '',
  })
  // Horários (empresa)
  const [horarios, setHorarios] = useState<HorarioDia[]>(HORARIOS_INICIAIS)
  // Status excepcional
  const [statusAberto, setStatusAberto] = useState(false)
  const [mensagemExcepcional, setMensagemExcepcional] = useState('')
  // Aviso de horário atípico
  const [avisoAtipicoAtivo, setAvisoAtipicoAtivo] = useState(false)
  const publicarAvisoAtipico = () => setAvisoAtipicoAtivo(prev => !prev)
  // Catálogo
  const [itensCatalogo, setItensCatalogo] = useState<ItemCatalogo[]>([])
  // Estados para modal de adicionar item
  const [showAddItem, setShowAddItem] = useState(false)
  const [showCatalogoOnline, setShowCatalogoOnline] = useState(false)
  const [novoItem, setNovoItem] = useState<any>({ nome: '', preco: '', descricao: '', foto: null })
  const [erroItem, setErroItem] = useState<string | null>(null)

  // Função para lidar com upload de foto do item
  function handleFotoItem(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      setNovoItem((prev: any) => ({ ...prev, foto: ev.target?.result as string }))
    }
    reader.readAsDataURL(file)
  }

  // Função para adicionar item ao catálogo
  function adicionarItem() {
    // Só pode cadastrar na cidade/base do perfil
    const cidadeBase = tipoNegocio === 'empresa' ? formEmpresa.endereco : formProfissional.endereco
    if (!novoItem.nome || !novoItem.preco) {
      setErroItem('Preencha nome e preço')
      return
    }
    if (!cidadeBase) {
      setErroItem('Defina o endereço/cidade no perfil antes de cadastrar')
      return
    }
    // Força o endereço do item ser a cidade/base do perfil
    setItensCatalogo(prev => [
      ...prev,
      { ...novoItem, id: Math.random().toString(36).slice(2), preco: Number(novoItem.preco), endereco: cidadeBase, planoPago: false }
    ])
    setNovoItem({ nome: '', preco: '', descricao: '', foto: null })
    setShowAddItem(false)
    setErroItem(null)
  }

  // Função para remover item do catálogo
  function removerItem(id: string) {
    setItensCatalogo(prev => prev.filter(item => item.id !== id))
  }

  // Função mock para salvar perfil
  function salvarPerfil() {
    setPerfilSalvo(true)
  }

  // Nome principal mock
  const nomePrincipal = formEmpresa?.nomeFantasia || formProfissional?.nome || ''
  // Função para atualizar campos dos horários
  function updateHorario(dia: DiaSemana, campo: keyof HorarioDia, valor: string | boolean) {
    setHorarios(prev => prev.map(h =>
      h.dia === dia ? { ...h, [campo]: valor } : h
    ))
  }

  // Função para alternar statusAberto
  function toggleStatusAberto() {
    setStatusAberto(prev => !prev)
  }

  // Garante que todos os itens tenham endereco e planoPago
  const itensCatalogoCompletos = itensCatalogo.map(item => ({
    ...item,
    endereco: item.endereco ?? '',
    planoPago: item.planoPago ?? false,
  }))

  // Retorno do hook

  return {
    tipoNegocio, setTipoNegocio,
    perfilSalvo,
    aba, setAba,
    formEmpresa, updateEmpresa,
    formProfissional, updateProfissional,
    horarios, updateHorario,
    statusAberto, toggleStatusAberto,
    avisoAtipicoAtivo, publicarAvisoAtipico,
    itensCatalogo: itensCatalogoCompletos,
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

