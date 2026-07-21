"use client";
import { DemandView } from '@/components/DemandView';

export default function PublicPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <DemandView category="AGRO" title="SolicitaÃ§Ã£o AgropecuÃ¡ria" />
    </div>
  );
}

