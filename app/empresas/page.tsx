'use client'

import Link from 'next/link'
import { ArrowLeft, Building2 } from 'lucide-react'

export default function EmpresasPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-purple-600 text-white p-4 sticky top-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-white/20 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-lg">Empresas Parceiras</span>
        </div>
      </header>
      <main className="p-4">
        <div className="bg-white rounded-xl p-8 text-center">
          <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-bold mb-2">Em breve</h2>
          <p className="text-gray-500">Estamos cadastrando empresas parceiras</p>
        </div>
      </main>
    </div>
  )
}