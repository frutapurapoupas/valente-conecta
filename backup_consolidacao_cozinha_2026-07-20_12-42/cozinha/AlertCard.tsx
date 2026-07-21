// components/cozinha/AlertCard.tsx
// ðŸŽ¨ UI - Card de Alerta

"use client";

import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface AlertCardProps {
  alerta: {
    title: string;
    message: string;
    type: 'warning' | 'danger' | 'success' | 'info';
    action?: string;
    onAction?: () => void;
  }
}

// âœ… EXPORTAÃ‡ÃƒO NOMEADA
export function AlertCard({ 
  alerta
}: AlertCardProps) {
  const colors = {
    warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
    danger: 'border-red-500/30 bg-red-500/10 text-red-400',
    success: 'border-green-500/30 bg-green-500/10 text-green-400',
    info: 'border-blue-500/30 bg-blue-500/10 text-blue-400'
  };

  const icons = {
    warning: AlertCircle,
    danger: AlertCircle,
    success: CheckCircle,
    info: Clock
  };

  const Icon = icons[alerta.type];

  return (
    <div className={`p-3 rounded-lg border ${colors[alerta.type]} flex items-start gap-3`}>
      <Icon size={16} className="mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{alerta.title}</p>
        <p className="text-xs opacity-80">{alerta.message}</p>
      </div>
      {alerta.action && alerta.onAction && (
        <button
          onClick={alerta.onAction}
          className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition whitespace-nowrap"
        >
          {alerta.action}
        </button>
      )}
    </div>
  );
}


