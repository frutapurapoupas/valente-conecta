'use client'

import Link from 'next/link'
import { ArrowLeft, Settings, X } from 'lucide-react'

interface HeaderProps {
  isAdmin: boolean
  isCheckIn: boolean
  elapsedTime: number
  onActionClick: () => void
}

export default function AcademiaHeader({
  isAdmin,
  isCheckIn,
  elapsedTime,
  onActionClick
}: HeaderProps) {
  return (
    <header className="bg-gradient-to-br from-indigo-700 to-purple-800 text-white p-6 rounded-b-[3rem] shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <Link href="/" className="hover:opacity-80 transition">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="font-black text-xl tracking-tighter italic">VALENTE FITNESS</h1>
        {isAdmin
          ? <Settings className="text-yellow-400 w-6 h-6" />
          : (
            <Link href="/" className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition active:scale-90">
              <X className="w-5 h-5 text-white" />
            </Link>
          )
        }
      </div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center">
        <p className="text-xs uppercase tracking-widest mb-1 opacity-70 font-bold">
          Status do Treino
        </p>
        <div className="text-4xl font-black mb-4">
          {isCheckIn ? `${elapsedTime} MIN` : "OFFLINE"}
        </div>
        <button
          onClick={onActionClick}
          className={`w-full py-4 rounded-2xl font-black shadow-lg transition-all active:scale-95 ${
            isCheckIn ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white text-indigo-700 hover:bg-gray-100'
          }`}
        >
          {isCheckIn ? 'FINALIZAR TREINO' : 'COMEÇAR AGORA'}
        </button>
      </div>
    </header>
  )
}
