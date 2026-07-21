"use client";
import { useEffect, useState } from 'react';
import { DemandView } from '@/components/DemandView';
import MachineCard from '@/components/MachineCard';
import { CatalogStorage } from '@/services/catalogStorage';

export default function MaquinasPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadSuppliers = () => {
      const parsed = CatalogStorage.getAll().filter((item) => item.status === 'publicado');
      setSuppliers(Array.isArray(parsed) ? parsed : []);
    };

    loadSuppliers();
    window.addEventListener('catalogo_itens_updated', loadSuppliers as EventListener);
    return () => {
      window.removeEventListener('catalogo_itens_updated', loadSuppliers as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-slate-900/90 backdrop-blur-xl p-6 shadow-2xl shadow-slate-950/40">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-cyan-600 via-blue-700 to-violet-700 p-6 text-white shadow-xl shadow-cyan-500/20">
          <h1 className="text-3xl font-extrabold">Aluguel de MÃ¡quinas</h1>
          <p className="mt-3 text-sm text-cyan-100/90 leading-6">
            Veja mÃ¡quinas disponÃ­veis para aluguel, compare preÃ§os e contato do fornecedor. Se ainda nÃ£o encontrar o equipamento desejado, envie sua solicitaÃ§Ã£o.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-6 shadow-xl shadow-slate-950/20">
              <h2 className="text-2xl font-bold text-white mb-4">MÃ¡quinas disponÃ­veis</h2>
              {suppliers && suppliers.length > 0 ? (
                <div className="space-y-4">
                  {suppliers.map((s, idx) => (
                    <MachineCard key={s.id || idx} supplier={s} />
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl bg-white/5 p-8 text-center text-gray-300">
                  <p className="text-lg font-semibold text-white mb-2">Nenhuma mÃ¡quina encontrada</p>
                  <p>Se vocÃª Ã© fornecedor, cadastre seu equipamento. Se Ã© cliente, envie sua solicitaÃ§Ã£o para que o admin encontre a mÃ¡quina certa.</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/90 p-6 shadow-xl shadow-slate-950/20">
              <h2 className="text-2xl font-bold text-white mb-4">Precisa de ajuda para encontrar?</h2>
              <p className="text-gray-300 mb-6">
                Nossa equipe pode ajudar a buscar o equipamento ideal e conectar vocÃª ao fornecedor certo. Preencha sua demanda abaixo.
              </p>
              <DemandView category="MAQUINAS" title="Enviar solicitaÃ§Ã£o de aluguel" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

