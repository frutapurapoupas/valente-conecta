'use client'

import { useState } from 'react'
import { Calendar, TrendingUp, TrendingDown, DollarSign, ArrowLeftRight, CheckCircle, Clock, Zap, Users, Building2 } from 'lucide-react'

export default function CompensacaoPage() {
  const [mesSelecionado, setMesSelecionado] = useState('abril/2026')
  const [compensando, setCompensando] = useState(false)

  const [saldosCidades, setSaldosCidades] = useState([
    { cidade: 'Coité Conecta', saldo: 45600, deve: 0, receber: 0 },
    { cidade: 'São Paulo', saldo: 32000, deve: 0, receber: 0 },
    { cidade: 'Rio de Janeiro', saldo: 23000, deve: 0, receber: 0 },
  ])

  const calcularCompensacao = () => {
    setCompensando(true)
    setTimeout(() => {
      // Simular cálculo
      const novosSaldos = [
        { cidade: 'Coité Conecta', saldo: 45600, deve: 12450, receber: 0 },
        { cidade: 'São Paulo', saldo: 32000, deve: 0, receber: 8900 },
        { cidade: 'Rio de Janeiro', saldo: 23000, deve: 0, receber: 3550 },
      ]
      setSaldosCidades(novosSaldos)
      setCompensando(false)
      alert('✅ Compensação mensal calculada com sucesso!')
    }, 2000)
  }

  const executarCompensacao = () => {
    if (confirm('Confirmar execução da compensação mensal? Esta ação irá transferir os saldos entre cidades.')) {
      alert('✅ Compensação executada! Saldos ajustados.')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Compensação Mensal</h1>
          <p className="text-gray-500 text-base mt-1">Ajuste de saldos entre cidades</p>
        </div>
        <div className="flex gap-3">
          <select
            value={mesSelecionado}
            onChange={(e) => setMesSelecionado(e.target.value)}
            className="px-4 py-2 border rounded-lg text-base"
          >
            <option>abril/2026</option>
            <option>março/2026</option>
            <option>fevereiro/2026</option>
          </select>
          <button
            onClick={calcularCompensacao}
            disabled={compensando}
            className="bg-blue-600 text-white px-5 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
          >
            {compensando ? 'Calculando...' : 'Calcular Compensação'}
          </button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-5 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm text-center">
          <DollarSign className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">R$ 100.600</p>
          <p className="text-sm text-gray-500">Saldo Total</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm text-center">
          <ArrowLeftRight className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">R$ 12.450</p>
          <p className="text-sm text-gray-500">Valor a Compensar</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm text-center">
          <Calendar className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold">30/04/2026</p>
          <p className="text-sm text-gray-500">Próxima Compensação</p>
        </div>
      </div>

      {/* Saldos por cidade */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="p-5 border-b bg-gray-50">
          <h2 className="font-bold text-lg">Saldos por Cidade</h2>
        </div>
        <div className="divide-y">
          {saldosCidades.map(cidade => (
            <div key={cidade.cidade} className="p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-lg">{cidade.cidade}</span>
                <span className="text-2xl font-bold text-blue-600">R$ {cidade.saldo.toLocaleString()}</span>
              </div>
              {cidade.deve > 0 && (
                <div className="bg-red-50 rounded-lg p-3 mb-2">
                  <p className="text-red-700 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Deve compensar: R$ {cidade.deve.toLocaleString()}
                  </p>
                </div>
              )}
              {cidade.receber > 0 && (
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-green-700 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Receberá: R$ {cidade.receber.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Botão executar */}
      <button
        onClick={executarCompensacao}
        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:from-green-600 hover:to-emerald-700 transition"
      >
        <Zap className="w-5 h-5" />
        Executar Compensação Mensal
      </button>

      {/* Histórico */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-semibold mb-3">Últimas Compensações</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Março/2026</p>
              <p className="text-xs text-gray-500">Compensação concluída</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600">R$ 11.200</p>
              <p className="text-xs text-gray-500">30/03/2026</p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Fevereiro/2026</p>
              <p className="text-xs text-gray-500">Compensação concluída</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600">R$ 9.850</p>
              <p className="text-xs text-gray-500">28/02/2026</p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
        </div>
      </div>
    </div>
  )
}