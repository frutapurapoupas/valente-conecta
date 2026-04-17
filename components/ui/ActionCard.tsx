'use client'

import Link from 'next/link'
import { LucideIcon } from 'lucide-react'

interface ActionCardProps {
  href: string
  icon: LucideIcon
  label: string
  color: string
}

export function ActionCard({ href, icon: Icon, label, color }: ActionCardProps) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center p-6 bg-zinc-900 border border-zinc-800 rounded-[32px] h-44 active:scale-95 transition-all w-full shadow-lg">
      <div className={`p-4 rounded-2xl bg-white/5 ${color} mb-4`}>
        <Icon className="w-8 h-8" />
      </div>
      <span className="text-[11px] font-black uppercase text-zinc-300 text-center leading-tight tracking-tighter italic">
        {label}
      </span>
    </Link>
  )
}
