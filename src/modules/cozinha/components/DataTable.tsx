// src/modules/cozinha/components/DataTable.tsx
// ============================================
// TABELA REUTILIZÁVEL
// ============================================

import React from 'react'

export interface Column {
  key: string
  label: string
  render?: (value: any, item: any) => React.ReactNode
  className?: string
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (item: any) => void
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  loading = false,
  emptyMessage = 'Nenhum dado encontrado',
  onRowClick
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.className || "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr
              key={index}
              onClick={() => onRowClick?.(item)}
              className={onRowClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm text-gray-900">
                  {col.render ? col.render(item[col.key], item) : item[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
