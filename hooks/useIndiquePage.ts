'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { cadastrarUsuario, loginPorTelefone, getUsuarioLogado } from '@/services/auth'

export type StepIndique = 1 | 2

export type FormDataIndique = {
  nome: string
  email: string
  telefone: string
  tipoPessoa: 'fisica' | 'juridica'
}

export function useIndiquePage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const type = searchParams.get('tipo') || 'amigo'
  const codigo = searchParams.get('codigo') || Date.now().toString()

  const [step, setStep] = useState<StepIndique>(1)
  const [formData, setFormData] = useState<FormDataIndique>({
    nome: '',
    email: '',
    telefone: '',
    tipoPessoa: 'fisica',
  })
  const [installed, setInstalled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const usuario = getUsuarioLogado()
    if (usuario) {
      setInstalled(true)
      setTimeout(() => router.push('/'), 2000)
    }
  }, [])

  const handleLogin = async () => {
    setLoading(true)
    setErro('')

    const usuario = loginPorTelefone(formData.telefone)
    if (usuario) {
      setInstalled(true)
      setTimeout(() => router.push('/'), 2000)
    } else {
      setErro('Telefone não cadastrado. Complete o cadastro.')
      setStep(2)
    }
    setLoading(false)
  }

  const handleCadastro = async () => {
    if (!formData.nome || !formData.telefone || !formData.email) {
      setErro('Preencha todos os campos')
      return
    }

    setLoading(true)
    setErro('')

    const usuario = cadastrarUsuario(formData.nome, formData.telefone, formData.email)
    if (usuario) {
      setInstalled(true)
      setTimeout(() => router.push('/'), 2000)
    } else {
      setErro('Telefone já cadastrado! Faça login.')
    }
    setLoading(false)
  }

  const updateForm = (field: keyof FormDataIndique, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return {
    type,
    codigo,
    step,
    setStep,
    formData,
    updateForm,
    installed,
    loading,
    erro,
    handleLogin,
    handleCadastro,
  }
}
