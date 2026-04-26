'use client'

import { useFinanceiroPessoal } from '@/hooks/useFinanceiroPessoal'
import { FinanceiroPessoalScreen } from '@/components/admin-master/FinanceiroPessoalScreen'

export default function FinanceiroPessoalPage() {
  const financeiroData = useFinanceiroPessoal()

  return <FinanceiroPessoalScreen {...financeiroData} />
}
