"use client";
import { useEffect, useState } from 'react';
import { CatalogStorage, DemandService } from '@/modules-scaffold/services/shared/storageServices';
import { Item, Demand } from '@/modules-scaffold/types/modules';
import ListView from '@/modules-scaffold/components/shared/ListView';
import DemandModal from '@/modules-scaffold/components/shared/DemandModal';
import toast from 'react-hot-toast';

const CATEGORIA = 'cozinha-chef-neide';

export default function CozinhaPublic() {
  const [pratos, setPratos] = useState<Item[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const loadPratos = () => {
      const items = CatalogStorage.getAll(CATEGORIA);
      setPratos(items.filter((i) => i.status === 'publicado'));
    };
    
    loadPratos();
    window.addEventListener('catalogo_itens_updated', loadPratos);
    return () => window.removeEventListener('catalogo_itens_updated', loadPratos);
  }, []);

  const handleNewDemand = (demand: Partial<Demand>) => {
    DemandService.add({
      id: Date.now().toString(),
      ...demand,
      status: 'pendente',
      createdAt: new Date().toISOString(),
    } as Demand);
    toast.success('Pedido enviado para Chef Neide!');
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">ðŸ½ï¸ Chef Neide</h1>
          <p className="text-gray-400 mt-2">Pratos deliciosos do dia</p>
        </div>

        {/* CatÃ¡logo */}
        {pratos.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-slate-900 border border-white/10">
            <p className="text-gray-400 text-lg">Nenhum prato disponÃ­vel hoje</p>
          </div>
        ) : (
          <>
            <ListView items={pratos} gridCols="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />

            {/* CTA */}
            <div className="mt-12 text-center">
              <button
                onClick={() => setModalOpen(true)}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-rose-500 to-pink-600 text-white font-bold text-lg hover:opacity-90 transition"
              >
                ðŸ“¦ Encomendar
              </button>
            </div>
          </>
        )}

        {/* Modal de Pedido */}
        <DemandModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          categoria={CATEGORIA}
          onSubmit={handleNewDemand}
        />
      </div>
    </div>
  );
}

