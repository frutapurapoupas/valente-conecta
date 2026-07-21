"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import MachineCard from '@/components/MachineCard';
import { CatalogStorage } from '@/services/catalogStorage';

export default function HomeOffersSection() {
  const [offers, setOffers] = useState<any[]>([]);

  const loadOffers = () => {
    if (typeof window === 'undefined') return;
    const filtered = CatalogStorage.getAll().filter(item => item.status === 'publicado');
    const published = filtered
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    setOffers(published.slice(0, 3));
  };

  useEffect(() => {
    loadOffers();
    const listener = () => loadOffers();
    window.addEventListener('storage', listener);
    window.addEventListener('fornecedores_servicos_updated', listener as EventListener);
    return () => {
      window.removeEventListener('storage', listener);
      window.removeEventListener('fornecedores_servicos_updated', listener as EventListener);
    };
  }, []);

  return (
    <section className="px-5 pb-6">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl shadow-slate-950/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Ofertas pÃºblicas agora</h2>
            <p className="text-gray-300 mt-2">Veja alguns equipamentos e serviÃ§os que jÃ¡ estÃ£o disponÃ­veis para o pÃºblico.</p>
          </div>
          <Link href="/publico/maquinas" className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-black hover:bg-cyan-400 transition">
            Ver todas as ofertas
          </Link>
        </div>

        {offers.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer, idx) => (
              <MachineCard key={offer.id || idx} supplier={offer} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-slate-950/80 p-8 text-center text-gray-300">
            <p className="text-lg font-semibold text-white mb-2">Ainda nÃ£o hÃ¡ ofertas pÃºblicas no catÃ¡logo.</p>
            <p>Quando um fornecedor cadastrar seu equipamento ou serviÃ§o, ele aparecerÃ¡ aqui imediatamente.</p>
          </div>
        )}
      </div>
    </section>
  );
}

