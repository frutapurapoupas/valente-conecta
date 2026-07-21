// components/cozinha/QuickLink.tsx
// ðŸŽ¨ UI - Link RÃ¡pido

"use client";

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface QuickLinkProps {
  href: string;
  label: string;
}

// âœ… EXPORTAÃ‡ÃƒO NOMEADA
export function QuickLink({ href, label }: QuickLinkProps) {
  return (
    <Link href={href} className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
      {label}
      <ChevronRight className="w-4 h-4" />
    </Link>
  );
}

// âœ… EXPORTAÃ‡ÃƒO DEFAULT
export default QuickLink;


