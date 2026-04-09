'use client'

import { ReactNode } from 'react'

interface Column {
  key: string
  label: string
  render?: (value: any, item: any) => ReactNode
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  loading?: boolean
  emptyMessage?: string
}

export default function DataTable({ columns, data, loading = false, emptyMessage = 'Nenhum dado encontrado' }: DataTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center text-gray-500">Carregando...</div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="text-center text-gray-500">{emptyMessage}</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="text-left p-4 font-semibold text-gray-600">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="p-4 text-gray-700">
                    {col.render ? col.render(item[col.key], item) : item[col.key] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}