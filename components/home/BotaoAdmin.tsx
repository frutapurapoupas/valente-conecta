// Arquivo: components/home/BotaoAdmin.tsx
// Status: AGUARDANDO CÓDIGO
// Este arquivo será preenchido na próxima etapa
'use client';

// ============================================
// COMPONENTE - BOTÃO ADMIN MASTER
// ============================================

import Link from 'next/link';
import { Shield } from 'lucide-react';

interface BotaoAdminProps {
  isAdmin: boolean;
}

export default function BotaoAdmin({ isAdmin }: BotaoAdminProps) {
  if (!isAdmin) return null;

  return (
    <Link
      href="/admin"
      className="fixed bottom-6 right-6 bg-gradient-to-r from-gray-800 to-gray-900 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
    >
      <Shield className="w-6 h-6" />
    </Link>
  );
}

