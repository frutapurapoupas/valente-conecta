import Link from 'next/link'
import { ArrowUpRight, Wallet } from 'lucide-react'

export default function FinanceiroPessoalShortcut() {
  return (
    <Link
      href="/admin-master/financeiro-pessoal"
      className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-emerald-300 transition-colors hover:border-emerald-400/50 hover:bg-emerald-500/15"
    >
      <Wallet className="h-3.5 w-3.5" />
      <span>Controle Financeiro</span>
      <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  )
}