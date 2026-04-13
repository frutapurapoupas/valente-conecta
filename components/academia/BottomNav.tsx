'use client'

import Link from 'next/link'
import { LayoutDashboard, Dumbbell, Settings } from 'lucide-react'

interface BottomNavProps {
  isAdmin: boolean
}

export default function BottomNav({ isAdmin }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-100 p-4 flex justify-around items-center z-50">
      <Link href="/" className="flex flex-col items-center text-slate-400 hover:text-slate-600 transition">
        <LayoutDashboard size={20} />
        <span className="text-[8px] font-bold mt-1">HOME</span>
      </Link>

      <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-indigo-200 shadow-xl -mt-10 border-4 border-white">
        <Dumbbell className="text-white" size={24} />
      </div>

      <Link
        href={isAdmin ? "/admin" : "/perfil"}
        className={`flex flex-col items-center transition ${
          isAdmin ? 'text-red-500 hover:text-red-600' : 'text-slate-400 hover:text-slate-600'
        }`}
        prefetch={false}
      >
        <Settings size={20} />
        <span className="text-[8px] font-bold mt-1 uppercase">{isAdmin ? 'ADMIN' : 'PERFIL'}</span>
      </Link>
    </nav>
  )
}
