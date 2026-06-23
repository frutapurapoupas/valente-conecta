// components/cozinha/QuickLink.tsx
// 🎨 UI - Link Rápido

"use client";

import Link from 'next/link';

interface QuickLinkProps {
  href: string;
  icon: any;
  title: string;
  description: string;
  badge?: string;
}

// ✅ EXPORTAÇÃO NOMEADA
export function QuickLink({ 
  href, 
  icon: Icon, 
  title, 
  description,
  badge
}: QuickLinkProps) {
  return (
    <Link
      href={href}
      className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-green-500/50 hover:bg-gray-800 transition-all group"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-green-400 group-hover:text-green-300" />
          <span className="font-medium text-sm">{title}</span>
        </div>
        {badge && (
          <span className="text-xs bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-400">{description}</p>
    </Link>
  );
}

// ✅ EXPORTAÇÃO DEFAULT
export default QuickLink;