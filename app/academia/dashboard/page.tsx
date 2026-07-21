"use client";

export const dynamic = 'force-dynamic';  // Ã¢â€ Â ÃƒÅ¡NICA LINHA ADICIONADA

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Dumbbell, Calendar, Clock, MapPin, Bell, Heart, Activity, Droplet, ChevronLeft, Edit2, User } from 'lucide-react';
import LocalizadorAcademia from '@/components/academia/LocalizadorAcademia';

export default function AcademiaDashboardPage() {
  const [dados, setDados] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('academia_local_dados');
    if (saved) setDados(JSON.parse(saved));
  }, []);

  if (!dados) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <Dumbbell className="w-16 h-16 text-yellow-400 mb-4 animate-pulse" />
        <h2 className="text-xl font-bold text-white mb-2">Nenhuma academia cadastrada</h2>
        <Link href="/academia/academia-local" className="px-6 py-3 bg-yellow-500 text-black rounded-xl font-bold">Cadastrar Academia</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/academia" className="p-2 bg-zinc-800 rounded-xl"><ChevronLeft className="w-5 h-5 text-zinc-400" /></Link>
          <h1 className="text-lg font-black flex items-center gap-2"><Dumbbell className="w-5 h-5 text-yellow-400" />Meu Treino</h1>
          <Link href="/academia/academia-local" className="p-2 bg-zinc-800 rounded-xl"><Edit2 className="w-5 h-5 text-zinc-400" /></Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-6"><div className="flex items-center gap-4"><div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center"><User className="w-8 h-8 text-white" /></div><div><h2 className="text-xl font-black text-white">{dados.responsavel || 'UsuÃƒÂ¡rio'}</h2><p className="text-yellow-400 text-sm">{dados.nome}</p></div></div></div>

        <LocalizadorAcademia />

        <div className="grid grid-cols-3 gap-3"><div className="bg-zinc-900 rounded-2xl p-4 text-center"><Heart className="w-6 h-6 text-red-400 mx-auto mb-1" /><p className="text-2xl font-black">98</p><p className="text-xs text-zinc-500">Batimentos</p></div><div className="bg-zinc-900 rounded-2xl p-4 text-center"><Activity className="w-6 h-6 text-green-400 mx-auto mb-1" /><p className="text-2xl font-black">5.2</p><p className="text-xs text-zinc-500">km hoje</p></div><div className="bg-zinc-900 rounded-2xl p-4 text-center"><Droplet className="w-6 h-6 text-blue-400 mx-auto mb-1" /><p className="text-2xl font-black">2.5</p><p className="text-xs text-zinc-500">Litros ÃƒÂ¡gua</p></div></div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"><h3 className="font-bold mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-yellow-400" />PrÃƒÂ³ximo Treino</h3><div className="flex justify-between"><div><p className="text-white font-bold">Treino A - Superior</p><p className="text-sm text-zinc-500">Hoje Ã¢â‚¬Â¢ 18:00</p></div><div className="text-right"><p className="text-yellow-400 font-bold">Local</p><p className="text-sm text-zinc-500">{dados.nome}</p></div></div><button className="w-full mt-4 py-3 bg-yellow-500 text-black rounded-xl font-bold">Iniciar Treino</button></div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"><h3 className="font-bold mb-3 flex items-center gap-2"><Bell className="w-4 h-4 text-yellow-400" />NotificaÃƒÂ§ÃƒÂµes</h3><div className="space-y-3"><div className="flex gap-3 p-3 bg-zinc-800/50 rounded-xl"><div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 animate-pulse" /><div><p className="font-bold text-sm">Hora de treinar!</p><p className="text-xs text-zinc-500">NÃƒÂ£o esqueÃƒÂ§a do treino hoje ÃƒÂ s 18h</p></div></div></div></div>
      </main>
    </div>
  );
}

