'use client'

export default function AdminMasterGate({ children }: { children: React.ReactNode }) {
  // BYPASS TOTAL PARA TESTES / DESENVOLVIMENTO
  // Remove qualquer bloqueio de login ou sessionStorage

  return <>{children}</>
}