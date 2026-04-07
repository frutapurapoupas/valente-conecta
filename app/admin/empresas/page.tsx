'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building2, Users, MapPin, Phone, Mail, Star, Eye } from 'lucide-react'

export default function EmpresasPage() {
  const [empresas] = useState([
    { id: 1, nome: 'Padaria do Zé', endereco: 'Rua das Flores, 123', telefone: '(11) 98888-8888', rating: 4.8 },
    { id: 2, nome: 'Supermercado Valente', endereco: 'Av. Paulista, 1000', telefone: '(11) 96666-6666', rating: 4.7 },
    { id: 3, nome: 'Academia Fitness', endereco: 'Rua Augusta, 500', telefone: '(11) 95555-5555', rating: 4.9 },
  ])

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

      <main className="p-4 max-w-7xl mx-auto">
        <div className="grid gap-4">
          {empresas.map(empresa => (
            <div key={empresa.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{empresa.nome}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{empresa.endereco}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Phone className="w-4 h-4" />
                    <span>{empresa.telefone}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-yellow-500" />
                  <span className="font-medium">{empresa.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}