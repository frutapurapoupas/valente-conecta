"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function EmpresaHeader({ titulo, voltarPara = "/academia/empresa" }: { titulo: string; voltarPara?: string }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
      <div className="h-16 max-w-2xl mx-auto flex items-center justify-between px-4">
        <button onClick={() => router.push(voltarPara)} className="relative group">
          <ArrowLeft className="w-6 h-6 text-yellow-400 cursor-pointer hover:text-yellow-300 transition-colors" />
        </button>
        <div className="font-black uppercase italic text-white text-sm tracking-widest">
          <span>{titulo}</span>
        </div>
        <div className="w-6" />
      </div>
    </header>
  );
}
