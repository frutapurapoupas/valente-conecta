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
    <Link href={href} className="relative flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] h-44 active:scale-95 transition-all w-full shadow-2xl hover:bg-white/15 group">
      <div className={`p-4 rounded-2xl bg-white/10 backdrop-blur-md ${color} mb-4 relative`}>
        <Icon className="w-8 h-8" />
        <div className="absolute inset-0 bg-white/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <span className="text-[11px] font-black uppercase text-white/90 text-center leading-tight tracking-tighter italic relative">
        {label}
        <div className="absolute inset-0 bg-white/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </span>
    </Link>
  )
}
