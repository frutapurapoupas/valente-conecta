'use client'

import { CheckCircle } from 'lucide-react'

interface TrainingItem {
  id: number
  name: string
  series: number
  reps: number
}

interface TrainingCardProps {
  items: TrainingItem[]
}

export default function TrainingCard({ items }: TrainingCardProps) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-lg">TREINO DO DIA</h3>
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-black">
          SÉRIE A
        </span>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold">
                {item.id}
              </div>
              <div>
                <p className="font-bold text-sm uppercase">{item.name}</p>
                <p className="text-xs text-slate-400 font-medium">
                  {item.series} séries x {item.reps} reps
                </p>
              </div>
            </div>
            <CheckCircle className="text-slate-200 w-6 h-6 hover:text-slate-400 transition" />
          </div>
        ))}
      </div>
    </div>
  )
}
