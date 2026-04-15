// app/admin/dashboard/page.tsx
// Server Component - SEM 'use client'
import { Metadata } from 'next'
import DashboardClient from './DashboardClient'

export const metadata: Metadata = {
  title: 'Admin Master | Valente Conecta',
  description: 'Painel Administrativo Master - Gestão de Negócios, Financeiro e Demandas de Mercado',
}

export default function AdminDashboardPage() {
  return <DashboardClient />
}